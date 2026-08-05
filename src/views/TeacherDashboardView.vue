<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'
import AppCard from '../components/shared/AppCard.vue'
import AppButton from '../components/shared/AppButton.vue'
import StatCard from '../components/shared/StatCard.vue'
import RecentResultsTable from '../components/dashboard/RecentResultsTable.vue'
import VariantsManagerPanel from '../components/dashboard/VariantsManagerPanel.vue'
import AddStudentModal from '../components/shared/AddStudentModal.vue'

const auth = useAuthStore()
const showAddStudent = ref(false)
const loading = ref(true)
const errorMessage = ref('')

const stats = ref([
  { label: 'Барлық оқушылар', value: '—', to: { name: 'students' } },
  { label: 'Тағайындалған емтихандар', value: '—' },
  { label: 'Аяқталды', value: '—', to: { name: 'results' } },
  { label: 'Бағалау қажет', value: '—', to: { name: 'grading' } },
])
const recentResults = ref([])
const variants = ref([])

async function loadDashboard() {
  loading.value = true
  errorMessage.value = ''

  const [studentsCount, assignmentsCount, completedCount, pendingGrading, recentRes, variantsRes] =
    await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('exam_assignments').select('id', { count: 'exact', head: true }),
      supabase.from('exam_attempts').select('id', { count: 'exact', head: true }).in('status', ['submitted', 'graded']),
      supabase
        .from('student_answers')
        .select('attempt_id, questions!inner(requires_manual_grading), exam_attempts!inner(status)')
        .is('points_awarded', null)
        .eq('questions.requires_manual_grading', true)
        .eq('exam_attempts.status', 'submitted'),
      supabase
        .from('exam_attempts')
        .select('id, total_score, cefr_level, created_at, profiles(full_name, group_name), exam_variants(name)')
        .in('status', ['submitted', 'graded'])
        .order('created_at', { ascending: false })
        .limit(5),
      supabase.from('exam_variants').select('id, name, level, questions(count)').eq('is_active', true),
    ])

  const firstError = [studentsCount, assignmentsCount, completedCount, pendingGrading, recentRes, variantsRes].find(
    (r) => r.error
  )?.error

  if (firstError) {
    errorMessage.value = 'Деректерді жүктеу мүмкін болмады: ' + firstError.message
    loading.value = false
    return
  }

  stats.value = [
    { label: 'Барлық оқушылар', value: studentsCount.count ?? 0, to: { name: 'students' } },
    { label: 'Тағайындалған емтихандар', value: assignmentsCount.count ?? 0 },
    { label: 'Аяқталды', value: completedCount.count ?? 0, to: { name: 'results' } },
    {
      label: 'Бағалау қажет',
      value: new Set((pendingGrading.data || []).map((r) => r.attempt_id)).size,
      to: { name: 'grading' },
    },
  ]

  recentResults.value = (recentRes.data || []).map((row) => ({
    attempt_id: row.id,
    student_name: row.profiles?.full_name || '—',
    group_name: row.profiles?.group_name || '—',
    variant_name: row.exam_variants?.name || '—',
    total_score: row.total_score ?? '—',
    cefr_level: row.cefr_level || '—',
    date: row.created_at ? row.created_at.slice(0, 10) : '—',
  }))

  variants.value = (variantsRes.data || []).map((v) => ({
    id: v.id,
    name: v.name,
    level: v.level,
    question_count: v.questions?.[0]?.count ?? 0,
  }))

  loading.value = false
}

onMounted(loadDashboard)
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

    <p v-if="errorMessage" class="dashboard__error">{{ errorMessage }}</p>

    <div class="dashboard__stats">
      <StatCard v-for="stat in stats" :key="stat.label" :value="stat.value" :label="stat.label" :to="stat.to" />
    </div>

    <div class="dashboard__grid">
      <AppCard class="dashboard__results">
        <h2>Соңғы емтихан нәтижелері</h2>
        <p v-if="loading" class="dashboard__loading">Жүктелуде...</p>
        <RecentResultsTable v-else :rows="recentResults" />
      </AppCard>

      <AppCard class="dashboard__variants">
        <VariantsManagerPanel :variants="variants" />
      </AppCard>
    </div>

    <AddStudentModal
      :visible="showAddStudent"
      @close="showAddStudent = false"
      @created="loadDashboard"
    />
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

.dashboard__error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 0.65rem 0.9rem;
  border-radius: var(--radius-control);
  font-size: var(--fs-label);
}

.dashboard__loading {
  color: var(--color-text-secondary);
  padding: 1rem 0;
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
