<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import AppCard from '../components/shared/AppCard.vue'
import AppButton from '../components/shared/AppButton.vue'
import StatCard from '../components/shared/StatCard.vue'
import RecentResultsTable from '../components/dashboard/RecentResultsTable.vue'
import VariantsManagerPanel from '../components/dashboard/VariantsManagerPanel.vue'
import AddStudentModal from '../components/shared/AddStudentModal.vue'

// TODO: заменить на реальные select() из exam_attempts / profiles / exam_variants,
// когда экран наполняется бизнес-логикой.
const auth = useAuthStore()
const showAddStudent = ref(false)

const stats = [
  { label: 'Барлық оқушылар', value: 128, to: { name: 'students' } },
  { label: 'Тағайындалған емтихандар', value: 34 },
  { label: 'Аяқталды', value: 21, to: { name: 'results' } },
  { label: 'Бағалау қажет', value: 6, to: { name: 'grading' } },
]

const recentResults = [
  {
    attempt_id: 'mock-1',
    student_name: 'Айдана Серікова',
    group_name: '10А',
    variant_name: 'A2 - Нұсқа 1',
    total_score: 62,
    cefr_level: 'A2',
    date: '2026-08-01',
  },
  {
    attempt_id: 'mock-2',
    student_name: 'Нұрлан Ахметов',
    group_name: '10Б',
    variant_name: 'A1 - Нұсқа 2',
    total_score: 41,
    cefr_level: 'A1',
    date: '2026-07-30',
  },
  {
    attempt_id: 'mock-3',
    student_name: 'Гүлнұр Қасымова',
    group_name: '10А',
    variant_name: 'Above A2 - Нұсқа 1',
    total_score: 74,
    cefr_level: 'Above A2',
    date: '2026-07-29',
  },
]

const variants = [
  { id: 'v1', name: 'A1 - Нұсқа 1', level: 'A1', question_count: 24 },
  { id: 'v2', name: 'A1 - Нұсқа 2', level: 'A1', question_count: 24 },
  { id: 'v3', name: 'A2 - Нұсқа 1', level: 'A2', question_count: 28 },
  { id: 'v4', name: 'Above A2 - Нұсқа 1', level: 'Above A2', question_count: 30 },
]

</script>

<template>
  <div class="dashboard">
    <div class="dashboard__greeting">
      <div>
        <h1 class="dashboard__title">Қош келдіңіз, {{ auth.profile?.full_name || 'Мұғалім' }}!</h1>
        <p class="dashboard__date">Бүгінгі күннің жалпы статистикасы</p>
      </div>
      <AppButton @click="showAddStudent = true">Оқушы қосу</AppButton>
    </div>

    <div class="dashboard__stats">
      <StatCard v-for="stat in stats" :key="stat.label" :value="stat.value" :label="stat.label" :to="stat.to" />
    </div>

    <div class="dashboard__grid">
      <AppCard class="dashboard__results">
        <h2>Соңғы емтихан нәтижелері</h2>
        <RecentResultsTable :rows="recentResults" />
      </AppCard>

      <AppCard class="dashboard__variants">
        <VariantsManagerPanel :variants="variants" />
      </AppCard>
    </div>

    <AddStudentModal :visible="showAddStudent" @close="showAddStudent = false" />
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.dashboard__greeting {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.dashboard__title {
  font-size: 24px;
}

.dashboard__date {
  color: var(--color-text-secondary);
  margin-top: 0.3rem;
}

.dashboard__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.dashboard__grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.25rem;
  align-items: start;
}

.dashboard__results h2 {
  margin-bottom: 1rem;
}

@media (max-width: 1279px) {
  .dashboard__stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .dashboard__stats {
    grid-template-columns: 1fr;
  }
}
</style>
