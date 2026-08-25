<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabase'
import { cefrFromScore } from '../lib/cefr'
import AppCard from '../components/shared/AppCard.vue'
import ScoreDonut from '../components/shared/ScoreDonut.vue'
import CefrBadge from '../components/shared/CefrBadge.vue'
import cardCorner from '../assets/ornaments/card-frame.png'
import SectionScoreBars from '../components/results/SectionScoreBars.vue'
import CefrScaleTable from '../components/results/CefrScaleTable.vue'
import ProgressChart from '../components/results/ProgressChart.vue'
import ComparisonChart from '../components/results/ComparisonChart.vue'

const route = useRoute()

const loading = ref(true)
const errorMessage = ref('')
const student = ref(null)
const sectionScores = ref([])
const progressPoints = ref([])
const comparisonRows = ref([])
const allowingRetake = ref(false)
const retakeMessage = ref('')

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
const comment = computed(() => (student.value ? commentByLevel[student.value.cefr_level] : ''))

async function loadResults(attemptId) {
  if (!attemptId) {
    loading.value = false
    student.value = null
    return
  }

  loading.value = true
  errorMessage.value = ''

  const { data: attempt, error: attemptError } = await supabase
    .from('exam_attempts')
    .select(
      'id, student_id, variant_id, status, total_score, auto_score, created_at, profiles(full_name, group_name), exam_variants(name)'
    )
    .eq('id', attemptId)
    .single()

  if (attemptError || !attempt) {
    errorMessage.value = 'Попытка табылмады: ' + (attemptError?.message || 'белгісіз қате')
    loading.value = false
    return
  }

  const [{ data: questions }, { data: answers }] = await Promise.all([
    supabase.from('questions').select('section, max_points').eq('variant_id', attempt.variant_id),
    supabase
      .from('student_answers')
      .select('points_awarded, questions(section)')
      .eq('attempt_id', attemptId),
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

  student.value = {
    full_name: attempt.profiles?.full_name || '—',
    group_name: attempt.profiles?.group_name || '—',
    student_id: attempt.student_id,
    variant_id: attempt.variant_id,
    variant_name: attempt.exam_variants?.name || '—',
    total_score: displayScore,
    max_score: maxScore || 1,
    cefr_level: cefrLevel,
    graded: attempt.status === 'graded',
    status: attempt.status,
  }
  retakeMessage.value = ''

  const [{ data: history }, { data: groupmates }] = await Promise.all([
    supabase
      .from('exam_attempts')
      .select('total_score, auto_score, created_at')
      .eq('student_id', attempt.student_id)
      .order('created_at', { ascending: true }),
    attempt.profiles?.group_name
      ? supabase
          .from('profiles')
          .select('id, full_name, exam_attempts(total_score, auto_score, created_at)')
          .eq('role', 'student')
          .eq('group_name', attempt.profiles.group_name)
          .limit(8)
      : Promise.resolve({ data: [] }),
  ])

  progressPoints.value = (history || []).map((h) => ({
    label: h.created_at ? h.created_at.slice(0, 10) : '',
    score: h.total_score ?? h.auto_score ?? 0,
    maxScore: maxScore || 1,
  }))

  comparisonRows.value = (groupmates || [])
    .map((g) => {
      const latest = [...(g.exam_attempts || [])].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )[0]
      return {
        name: g.full_name,
        score: latest?.total_score ?? latest?.auto_score ?? 0,
        maxScore: maxScore || 1,
        highlight: g.id === attempt.student_id,
      }
    })
    .filter((row) => row.score > 0 || row.highlight)

  loading.value = false
}

async function allowRetake() {
  if (!student.value) return
  allowingRetake.value = true
  retakeMessage.value = ''

  const { data, error } = await supabase
    .from('exam_assignments')
    .update({ allow_retake: true })
    .eq('student_id', student.value.student_id)
    .eq('variant_id', student.value.variant_id)
    .select('id')

  allowingRetake.value = false
  if (error) {
    retakeMessage.value = 'Рұқсат беру мүмкін болмады: ' + error.message
  } else if (!data || data.length === 0) {
    // .update() қатесіз қайтады, бірақ ешбір жол сәйкес келмесе де data
    // бос болады — бұл жағдайды сәтсіздік ретінде көрсету керек, әйтпесе
    // мұғалім рұқсат берілді деп ойлайды, ал іс жүзінде ешнәрсе өзгермеген.
    retakeMessage.value = 'Тағайындау табылмады, рұқсат берілмеді'
  } else {
    retakeMessage.value = 'Қайта тапсыруға рұқсат берілді'
  }
}

onMounted(() => loadResults(route.params.attemptId))
watch(
  () => route.params.attemptId,
  (id) => loadResults(id)
)
</script>

<template>
  <div class="results">
    <p v-if="loading" class="results__status">Жүктелуде...</p>
    <p v-else-if="errorMessage" class="results__status results__status--error">{{ errorMessage }}</p>
    <p v-else-if="!student" class="results__status">
      Нәтижені көру үшін «Оқушылар» бетінен оқушыны таңдаңыз.
    </p>

    <template v-else>
      <div class="results__top-grid">
        <AppCard class="results__student">
          <img :src="cardCorner" alt="" class="results__student-corner" />
          <h2>{{ student.full_name }}</h2>
          <p class="results__group">{{ student.group_name }} · {{ student.variant_name }}</p>
          <ScoreDonut
            :score="student.total_score"
            :max-score="student.max_score"
            :segments="donutSegments"
            class="results__donut"
          />
          <CefrBadge :level="student.cefr_level" size="large" />
          <p class="results__level-caption">деңгейі</p>
          <p class="results__comment">{{ comment }}</p>
          <p v-if="!student.graded" class="results__pending-note">
            Writing/Speaking әлі толық бағаланбаған — балл алдын ала есептелген.
          </p>
          <button
            v-if="student.status !== 'in_progress'"
            class="results__retake-btn"
            :disabled="allowingRetake"
            @click="allowRetake"
          >
            {{ allowingRetake ? 'Берілуде...' : 'Қайта тапсыруға рұқсат беру' }}
          </button>
          <p v-if="retakeMessage" class="results__retake-message">{{ retakeMessage }}</p>
        </AppCard>

        <AppCard class="results__sections">
          <h2>Белгілер бойынша балл</h2>
          <SectionScoreBars :sections="sectionScores" />
        </AppCard>

        <AppCard class="results__scale">
          <h2>Деңгей шкаласы (CEFR)</h2>
          <CefrScaleTable :current-level="student.cefr_level" :max-score="student.max_score" />
        </AppCard>
      </div>

      <div class="results__bottom-grid">
        <AppCard>
          <h2>Уақыт бойынша прогресс</h2>
          <ProgressChart :points="progressPoints" />
        </AppCard>

        <AppCard>
          <h2>Оқушылар нәтижесін салыстыру</h2>
          <ComparisonChart :rows="comparisonRows" />
        </AppCard>
      </div>
    </template>
  </div>
</template>

<style scoped>
.results {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.results__status {
  color: var(--color-text-secondary);
  padding: 2rem 0;
  text-align: center;
}

.results__status--error {
  color: var(--color-accent-red);
}

.results__top-grid {
  display: grid;
  grid-template-columns: 1fr 1.4fr 1fr;
  gap: 1.25rem;
  align-items: start;
}

.results__bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.results__student {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.3rem;
}

.results__student-corner {
  position: absolute;
  top: 0;
  left: 0;
  width: 96px;
  height: auto;
  opacity: 0.6;
  pointer-events: none;
}

.results__group {
  color: var(--color-text-secondary);
}

.results__donut {
  margin: 1rem 0 0.5rem;
}

.results__level-caption {
  color: var(--color-text-secondary);
  font-size: var(--fs-label);
  margin-top: -0.4rem;
}

.results__comment {
  margin-top: 0.75rem;
  font-weight: 600;
  color: var(--color-accent-blue);
}

.results__pending-note {
  margin-top: 0.5rem;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.results__retake-btn {
  margin-top: 0.9rem;
  background: none;
  border: 1px solid var(--color-primary-dark);
  color: var(--color-primary-dark);
  border-radius: var(--radius-control);
  padding: 0.55rem 1rem;
  font-family: var(--font-body);
  font-size: var(--fs-label);
  font-weight: 700;
  cursor: pointer;
}

.results__retake-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.results__retake-message {
  margin-top: 0.5rem;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.results__sections h2,
.results__scale h2,
.results__bottom-grid h2 {
  margin-bottom: 1.25rem;
}

@media (max-width: 1279px) {
  .results__top-grid {
    grid-template-columns: 1fr 1fr;
  }

  .results__scale {
    grid-column: span 2;
  }
}

@media (max-width: 1023px) {
  .results__bottom-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .results__top-grid {
    grid-template-columns: 1fr;
  }

  .results__scale {
    grid-column: span 1;
  }
}
</style>
