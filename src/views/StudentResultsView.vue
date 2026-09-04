<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'
import { cefrFromScore } from '../lib/cefr'
import AppCard from '../components/shared/AppCard.vue'
import ScoreDonut from '../components/shared/ScoreDonut.vue'
import CefrBadge from '../components/shared/CefrBadge.vue'
import cardCorner from '../assets/ornaments/card-frame.png'
import SectionScoreBars from '../components/results/SectionScoreBars.vue'
import CefrScaleTable from '../components/results/CefrScaleTable.vue'
import ProgressChart from '../components/results/ProgressChart.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const loading = ref(true)
const errorMessage = ref('')
const result = ref(null)
const sectionScores = ref([])
const progressPoints = ref([])
const pastAttempts = ref([])
const feedbackItems = ref([])

const sectionMeta = {
  listening: { label: 'Listening', color: 'var(--color-accent-blue)' },
  reading: { label: 'Reading', color: 'var(--color-accent-green)' },
  writing: { label: 'Writing', color: 'var(--color-accent-orange)' },
  speaking: { label: 'Speaking', color: 'var(--color-accent-purple)' },
}

const commentByLevel = {
  'Above A2': 'Керемет нәтиже!',
  A2: 'Жақсы нәтиже!',
  A1: 'Жақсартуға болады.',
  'Pre-A1': 'Қосымша дайындық қажет.',
}

const donutSegments = computed(() =>
  sectionScores.value.map((section) => ({ value: section.value, color: section.color }))
)
const comment = computed(() => (result.value ? commentByLevel[result.value.cefr_level] : ''))

async function loadPastAttempts(studentId) {
  const { data } = await supabase
    .from('exam_attempts')
    .select('id, total_score, auto_score, cefr_level, status, created_at, exam_variants(name)')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })

  pastAttempts.value = (data || []).map((a) => ({
    id: a.id,
    variant_name: a.exam_variants?.name || '—',
    score: a.total_score ?? a.auto_score ?? null,
    cefr_level: a.cefr_level,
    status: a.status,
    date: a.created_at ? a.created_at.slice(0, 10) : '—',
  }))
}

async function loadResult(attemptId) {
  loading.value = true
  errorMessage.value = ''

  const studentId = auth.session?.user?.id
  await loadPastAttempts(studentId)

  let targetId = attemptId
  if (!targetId) {
    targetId = pastAttempts.value[0]?.id
  }

  if (!targetId) {
    result.value = null
    feedbackItems.value = []
    loading.value = false
    return
  }

  const { data: attempt, error: attemptError } = await supabase
    .from('exam_attempts')
    .select('id, variant_id, status, total_score, auto_score, created_at, exam_variants(name)')
    .eq('id', targetId)
    .single()

  if (attemptError || !attempt) {
    errorMessage.value = 'Талпыныс табылмады: ' + (attemptError?.message || 'белгісіз қате')
    loading.value = false
    return
  }

  const [{ data: questions }, { data: answers }] = await Promise.all([
    supabase.from('questions').select('section, max_points').eq('variant_id', attempt.variant_id),
    supabase
      .from('student_answers')
      .select('points_awarded, teacher_feedback, questions(section, order_index, content, max_points)')
      .eq('attempt_id', attempt.id),
  ])

  const maxBySection = (questions || []).reduce((map, q) => {
    map[q.section] = (map[q.section] || 0) + Number(q.max_points)
    return map
  }, {})
  const scoreBySection = (answers || []).reduce((map, a) => {
    const section = a.questions?.section
    if (!section) return map
    map[section] = (map[section] || 0) + Number(a.points_awarded || 0)
    return map
  }, {})

  sectionScores.value = Object.keys(sectionMeta)
    .filter((key) => maxBySection[key])
    .map((key) => ({
      key,
      label: sectionMeta[key].label,
      color: sectionMeta[key].color,
      value: scoreBySection[key] || 0,
      max: maxBySection[key],
    }))

  const maxScore = Object.values(maxBySection).reduce((sum, v) => sum + v, 0)
  const displayScore = attempt.total_score ?? attempt.auto_score ?? 0
  const cefrLevel = cefrFromScore(displayScore, maxScore)

  // Мұғалім GradingQueueView-де жазған пікір бұрын мұнда тіпті сұралмайтын —
  // оқушы оны ешқашан көре алмайтын. teacher_feedback бос жол болуы мүмкін
  // (мұғалім ештеңе жазбай сақтаса), сол жағдайда көрсетпейміз.
  feedbackItems.value = (answers || [])
    .filter((a) => a.teacher_feedback && a.teacher_feedback.trim())
    .sort((a, b) => (a.questions?.order_index ?? 0) - (b.questions?.order_index ?? 0))
    .map((a) => ({
      section: sectionMeta[a.questions?.section]?.label || a.questions?.section,
      question_text: a.questions?.content?.text || '',
      points_awarded: a.points_awarded,
      max_points: a.questions?.max_points,
      feedback: a.teacher_feedback,
    }))

  result.value = {
    variant_name: attempt.exam_variants?.name || '—',
    total_score: displayScore,
    max_score: maxScore || 1,
    cefr_level: cefrLevel,
    graded: attempt.status === 'graded',
  }

  progressPoints.value = pastAttempts.value
    .filter((a) => a.score !== null)
    .slice()
    .reverse()
    .map((a) => ({ label: a.date, score: a.score, maxScore: maxScore || 1 }))

  loading.value = false
}

function openAttempt(attemptId) {
  router.push({ name: 'my-results', params: { attemptId } })
}

onMounted(() => loadResult(route.params.attemptId))
watch(
  () => route.params.attemptId,
  (id) => loadResult(id)
)
</script>

<template>
  <div class="my-results">
    <p v-if="loading" class="my-results__status">Жүктелуде...</p>
    <p v-else-if="errorMessage" class="my-results__status my-results__status--error">{{ errorMessage }}</p>
    <p v-else-if="!result" class="my-results__status">Сізде әлі тапсырылған емтихан жоқ.</p>

    <template v-else>
      <div class="my-results__grid">
        <AppCard class="my-results__score">
          <img :src="cardCorner" alt="" class="my-results__score-corner" />
          <h2>{{ result.variant_name }}</h2>
          <ScoreDonut
            :score="result.total_score"
            :max-score="result.max_score"
            :segments="donutSegments"
            class="my-results__donut"
          />
          <CefrBadge :level="result.cefr_level" size="large" />
          <p class="my-results__level-caption">деңгейі</p>
          <p class="my-results__comment">{{ comment }}</p>
          <p v-if="!result.graded" class="my-results__pending-note">
            Writing/Speaking әлі толық бағаланбаған — балл алдын ала есептелген.
          </p>
        </AppCard>

        <AppCard class="my-results__sections">
          <h2>Белгілер бойынша балл</h2>
          <SectionScoreBars :sections="sectionScores" />
        </AppCard>

        <AppCard class="my-results__scale">
          <h2>Деңгей шкаласы (CEFR)</h2>
          <CefrScaleTable :current-level="result.cefr_level" :max-score="result.max_score" />
        </AppCard>
      </div>

      <AppCard v-if="feedbackItems.length">
        <h2>Мұғалімнің пікірі</h2>
        <ul class="my-results__feedback">
          <li v-for="(item, index) in feedbackItems" :key="index" class="my-results__feedback-item">
            <div class="my-results__feedback-head">
              <span class="my-results__feedback-section">{{ item.section }}</span>
              <span v-if="item.max_points != null" class="my-results__feedback-score">
                {{ item.points_awarded ?? '—' }} / {{ item.max_points }}
              </span>
            </div>
            <p v-if="item.question_text" class="my-results__feedback-question">{{ item.question_text }}</p>
            <p class="my-results__feedback-text">{{ item.feedback }}</p>
          </li>
        </ul>
      </AppCard>

      <AppCard v-if="progressPoints.length > 1">
        <h2>Уақыт бойынша прогресс</h2>
        <ProgressChart :points="progressPoints" />
      </AppCard>

      <AppCard v-if="pastAttempts.length > 1">
        <h2>Бұрынғы талпыныстар</h2>
        <ul class="my-results__history">
          <li
            v-for="a in pastAttempts"
            :key="a.id"
            class="my-results__history-item"
            :class="{ 'my-results__history-item--active': a.id === route.params.attemptId || (!route.params.attemptId && a === pastAttempts[0]) }"
            @click="openAttempt(a.id)"
          >
            <span>{{ a.date }}</span>
            <span>{{ a.variant_name }}</span>
            <span>{{ a.score ?? '—' }}</span>
            <CefrBadge v-if="a.cefr_level" :level="a.cefr_level" />
            <span v-else>—</span>
          </li>
        </ul>
      </AppCard>
    </template>
  </div>
</template>

<style scoped>
.my-results {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.my-results__status {
  color: var(--color-text-secondary);
  padding: 2rem 0;
  text-align: center;
}

.my-results__status--error {
  color: var(--color-accent-red);
}

.my-results__grid {
  display: grid;
  grid-template-columns: 1fr 1.4fr 1fr;
  gap: 1.25rem;
  align-items: start;
}

.my-results__score {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.3rem;
}

.my-results__score-corner {
  position: absolute;
  top: 0;
  left: 0;
  width: 96px;
  height: auto;
  opacity: 0.6;
  pointer-events: none;
}

.my-results__donut {
  margin: 1rem 0 0.5rem;
}

.my-results__level-caption {
  color: var(--color-text-secondary);
  font-size: var(--fs-label);
  margin-top: -0.4rem;
}

.my-results__comment {
  margin-top: 0.75rem;
  font-weight: 600;
  color: var(--color-accent-blue);
}

.my-results__pending-note {
  margin-top: 0.5rem;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.my-results__sections h2,
.my-results__scale h2 {
  margin-bottom: 1.25rem;
}

.my-results__history {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.my-results__history-item {
  display: grid;
  grid-template-columns: 1fr 1.5fr 0.6fr 0.6fr;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.85rem;
  border-radius: var(--radius-control);
  background: var(--color-input-bg);
  font-size: var(--fs-label);
  cursor: pointer;
}

.my-results__history-item--active {
  outline: 2px solid var(--color-primary-dark);
}

.my-results__feedback {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.my-results__feedback-item {
  background: var(--color-input-bg);
  border-radius: var(--radius-control);
  padding: 0.9rem 1rem;
}

.my-results__feedback-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.4rem;
}

.my-results__feedback-section {
  font-weight: 700;
  font-size: var(--fs-label);
  color: var(--color-primary-dark);
}

.my-results__feedback-score {
  font-size: var(--fs-label);
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}

.my-results__feedback-question {
  font-size: var(--fs-label);
  color: var(--color-text-secondary);
  white-space: pre-wrap;
  margin-bottom: 0.5rem;
}

.my-results__feedback-text {
  line-height: 1.6;
  white-space: pre-wrap;
}

@media (max-width: 1279px) {
  .my-results__grid {
    grid-template-columns: 1fr 1fr;
  }

  .my-results__scale {
    grid-column: span 2;
  }
}

@media (max-width: 767px) {
  .my-results__grid {
    grid-template-columns: 1fr;
  }

  .my-results__scale {
    grid-column: span 1;
  }

  .my-results__history-item {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
