<script setup>
import { computed } from 'vue'
import AppCard from '../components/shared/AppCard.vue'
import ScoreDonut from '../components/shared/ScoreDonut.vue'
import CefrBadge from '../components/shared/CefrBadge.vue'
import SectionScoreBars from '../components/results/SectionScoreBars.vue'
import CefrScaleTable from '../components/results/CefrScaleTable.vue'
import ProgressChart from '../components/results/ProgressChart.vue'
import ComparisonChart from '../components/results/ComparisonChart.vue'

// TODO: заменить mock на select() из exam_attempts + student_answers по route.params.attemptId.
const student = {
  full_name: 'Айдана Серікова',
  group_name: '10А',
  total_score: 62,
  max_score: 80,
  cefr_level: 'A2',
}

const sectionScores = [
  { key: 'listening', label: 'Listening', value: 16, max: 20, color: 'var(--color-accent-blue)' },
  { key: 'reading', label: 'Reading', value: 15, max: 20, color: 'var(--color-accent-green)' },
  { key: 'writing', label: 'Writing', value: 14, max: 20, color: 'var(--color-accent-orange)' },
  { key: 'speaking', label: 'Speaking', value: 17, max: 20, color: 'var(--color-accent-purple)' },
]

const donutSegments = computed(() =>
  sectionScores.map((section) => ({ value: section.value, color: section.color }))
)

const progressPoints = [
  { label: '2026-05', score: 41, maxScore: 80 },
  { label: '2026-06', score: 49, maxScore: 80 },
  { label: '2026-07', score: 55, maxScore: 80 },
  { label: '2026-08', score: 62, maxScore: 80 },
]

const comparisonRows = [
  { name: 'Айдана С.', score: 62, maxScore: 80, highlight: true },
  { name: 'Нұрлан А.', score: 41, maxScore: 80 },
  { name: 'Гүлнұр Қ.', score: 74, maxScore: 80 },
  { name: 'Дәулет Ж.', score: 30, maxScore: 80 },
]

const comment = computed(() => {
  if (student.total_score >= 69) return 'Керемет нәтиже!'
  if (student.total_score >= 49) return 'Жақсы нәтиже!'
  if (student.total_score >= 25) return 'Жақсартуға болады.'
  return 'Қосымша дайындық қажет.'
})
</script>

<template>
  <div class="results">
    <div class="results__top-grid">
      <AppCard class="results__student">
        <h2>{{ student.full_name }}</h2>
        <p class="results__group">{{ student.group_name }}</p>
        <ScoreDonut
          :score="student.total_score"
          :max-score="student.max_score"
          :segments="donutSegments"
          class="results__donut"
        />
        <CefrBadge :level="student.cefr_level" size="large" />
        <p class="results__level-caption">деңгейі</p>
        <p class="results__comment">{{ comment }}</p>
      </AppCard>

      <AppCard class="results__sections">
        <h2>Белгілер бойынша балл</h2>
        <SectionScoreBars :sections="sectionScores" />
      </AppCard>

      <AppCard class="results__scale">
        <h2>Деңгей шкаласы (CEFR)</h2>
        <CefrScaleTable :current-level="student.cefr_level" />
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
  </div>
</template>

<style scoped>
.results {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.3rem;
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
