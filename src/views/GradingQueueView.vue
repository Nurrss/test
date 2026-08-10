<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'
import { cefrFromScore } from '../lib/cefr'
import AppCard from '../components/shared/AppCard.vue'
import AppButton from '../components/shared/AppButton.vue'

const auth = useAuthStore()
const loading = ref(true)
const errorMessage = ref('')
const submissions = ref([])
const selectedId = ref(null)

const sectionLabels = {
  listening: 'Listening',
  reading: 'Reading',
  writing: 'Writing',
  speaking: 'Speaking',
}

const selected = computed(() => submissions.value.find((s) => s.id === selectedId.value))

async function loadQueue() {
  loading.value = true
  errorMessage.value = ''

  const { data, error } = await supabase
    .from('student_answers')
    .select(
      'id, answer, audio_path, questions!inner(section, order_index, question_type, max_points, requires_manual_grading), exam_attempts!inner(id, status, profiles(full_name))'
    )
    .is('points_awarded', null)
    .eq('questions.requires_manual_grading', true)
    .eq('exam_attempts.status', 'submitted')

  if (error) {
    errorMessage.value = 'Тізімді жүктеу мүмкін болмады: ' + error.message
    loading.value = false
    return
  }

  submissions.value = await Promise.all(
    (data || []).map(async (row) => {
      let audioUrl = null
      if (row.audio_path) {
        const { data: signed } = await supabase.storage
          .from('speaking-recordings')
          .createSignedUrl(row.audio_path, 3600)
        audioUrl = signed?.signedUrl || null
      }

      return {
        id: row.id,
        attempt_id: row.exam_attempts.id,
        student_name: row.exam_attempts.profiles?.full_name || '—',
        question_label: `${sectionLabels[row.questions.section] || row.questions.section} — ${row.questions.order_index}`,
        question_type: row.questions.question_type,
        content_text: row.answer,
        audio_url: audioUrl,
        max_points: row.questions.max_points,
        score: 0,
        feedback: '',
      }
    })
  )

  selectedId.value = submissions.value[0]?.id ?? null
  loading.value = false
}

onMounted(loadQueue)

async function finalizeAttemptIfComplete(attemptId) {
  const { data: remaining } = await supabase
    .from('student_answers')
    .select('id, questions!inner(requires_manual_grading)')
    .eq('attempt_id', attemptId)
    .is('points_awarded', null)
    .eq('questions.requires_manual_grading', true)

  if (remaining && remaining.length > 0) return

  const [{ data: allAnswers }, { data: attemptRow }] = await Promise.all([
    supabase.from('student_answers').select('points_awarded').eq('attempt_id', attemptId),
    supabase.from('exam_attempts').select('auto_score, variant_id').eq('id', attemptId).single(),
  ])

  const totalScore = (allAnswers || []).reduce((sum, a) => sum + Number(a.points_awarded || 0), 0)
  const autoScore = Number(attemptRow?.auto_score || 0)

  const { data: variantQuestions } = await supabase
    .from('questions')
    .select('max_points')
    .eq('variant_id', attemptRow?.variant_id)
  const maxScore = (variantQuestions || []).reduce((sum, q) => sum + Number(q.max_points), 0)

  await supabase
    .from('exam_attempts')
    .update({
      manual_score: totalScore - autoScore,
      total_score: totalScore,
      cefr_level: cefrFromScore(totalScore, maxScore || 80),
      status: 'graded',
    })
    .eq('id', attemptId)
}

async function saveScore() {
  const item = selected.value
  if (!item) return

  errorMessage.value = ''

  const maxPoints = Number(item.max_points)
  const clampedScore = Math.min(Math.max(Number(item.score) || 0, 0), maxPoints)
  if (clampedScore !== item.score) item.score = clampedScore

  const { error } = await supabase
    .from('student_answers')
    .update({
      points_awarded: clampedScore,
      teacher_feedback: item.feedback,
      graded_by: auth.session?.user?.id,
      graded_at: new Date().toISOString(),
    })
    .eq('id', item.id)

  if (error) {
    errorMessage.value = 'Бағаны сақтау мүмкін болмады: ' + error.message
    return
  }

  await finalizeAttemptIfComplete(item.attempt_id)

  const index = submissions.value.findIndex((s) => s.id === item.id)
  submissions.value.splice(index, 1)
  selectedId.value = submissions.value[0]?.id ?? null
}
</script>

<template>
  <div class="grading">
    <h1>Бағалау</h1>

    <p v-if="errorMessage" class="grading__error">{{ errorMessage }}</p>
    <p v-if="loading" class="grading__loading">Жүктелуде...</p>

    <div v-else class="grading__layout">
      <AppCard class="grading__list" :padded="false">
        <ul class="grading__list-items">
          <li
            v-for="item in submissions"
            :key="item.id"
            class="grading__list-item"
            :class="{ 'grading__list-item--active': item.id === selectedId }"
            @click="selectedId = item.id"
          >
            <strong>{{ item.student_name }}</strong>
            <span>{{ item.question_label }}</span>
          </li>
          <li v-if="!submissions.length" class="grading__empty">
            <i class="fa-solid fa-circle-check"></i> Бағалауды күтетін жұмыс жоқ
          </li>
        </ul>
      </AppCard>

      <AppCard v-if="selected" class="grading__detail">
        <h2>{{ selected.student_name }} — {{ selected.question_label }}</h2>

        <div v-if="selected.question_type !== 'audio_response'" class="grading__answer-text">
          {{ selected.content_text || '—' }}
        </div>
        <div v-else class="grading__answer-audio">
          <audio v-if="selected.audio_url" :src="selected.audio_url" controls></audio>
          <p v-else class="grading__no-audio">Дауыс жазбасы табылмады</p>
        </div>

        <div class="grading__form">
          <label>Балл (0 – {{ selected.max_points }})</label>
          <input
            v-model.number="selected.score"
            type="number"
            min="0"
            :max="selected.max_points"
            class="grading__score-input"
          />

          <label>Пікір</label>
          <textarea v-model="selected.feedback" class="grading__feedback" placeholder="Оқушыға пікір..."></textarea>

          <AppButton @click="saveScore">Сақтау</AppButton>
        </div>
      </AppCard>

      <AppCard v-else class="grading__detail grading__detail--empty">
        <p>Тексеру үшін жұмысты таңдаңыз</p>
      </AppCard>
    </div>
  </div>
</template>

<style scoped>
.grading {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.grading__error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 0.65rem 0.9rem;
  border-radius: var(--radius-control);
  font-size: var(--fs-label);
}

.grading__loading {
  color: var(--color-text-secondary);
}

.grading__layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1.25rem;
  align-items: start;
}

.grading__list-items {
  list-style: none;
  margin: 0;
  padding: 0.5rem;
  max-height: 560px;
  overflow-y: auto;
}

.grading__list-item {
  display: flex;
  flex-direction: column;
  padding: 0.75rem 0.9rem;
  border-radius: var(--radius-control);
  cursor: pointer;
  font-size: var(--fs-body);
}

.grading__list-item span {
  font-size: var(--fs-label);
  color: var(--color-text-secondary);
}

.grading__list-item:hover {
  background: var(--color-input-bg);
}

.grading__list-item--active {
  background: rgba(15, 92, 90, 0.1);
}

.grading__empty {
  text-align: center;
  color: var(--color-text-secondary);
  padding: 2rem 1rem;
}

.grading__detail h2 {
  margin-bottom: 1.25rem;
}

.grading__answer-text {
  background: var(--color-input-bg);
  border-radius: var(--radius-control);
  padding: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  white-space: pre-wrap;
}

.grading__answer-audio {
  margin-bottom: 1.5rem;
}

.grading__no-audio {
  color: var(--color-text-secondary);
}

.grading__form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.grading__score-input {
  width: 120px;
  font-family: var(--font-body);
  font-size: var(--fs-body);
  border-radius: var(--radius-control);
  border: none;
  background: var(--color-input-bg);
  padding: 0.6rem 0.8rem;
  margin-bottom: 0.5rem;
}

.grading__feedback {
  min-height: 100px;
  font-family: var(--font-body);
  font-size: var(--fs-body);
  border-radius: var(--radius-control);
  border: none;
  background: var(--color-input-bg);
  padding: 0.7rem 0.9rem;
  resize: vertical;
  margin-bottom: 0.75rem;
}

.grading__detail--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  min-height: 200px;
}

@media (max-width: 1023px) {
  .grading__layout {
    grid-template-columns: 1fr;
  }
}
</style>
