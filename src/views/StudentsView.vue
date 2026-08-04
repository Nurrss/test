<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppCard from '../components/shared/AppCard.vue'
import AppButton from '../components/shared/AppButton.vue'
import AppInput from '../components/shared/AppInput.vue'
import StatCard from '../components/shared/StatCard.vue'
import DataTable from '../components/shared/DataTable.vue'
import CefrBadge from '../components/shared/CefrBadge.vue'
import AddStudentModal from '../components/shared/AddStudentModal.vue'

// TODO: заменить на select() из profiles (role='student') + агрегаты по exam_attempts.
const router = useRouter()
const showAddStudent = ref(false)
const search = ref('')
const groupFilter = ref('Барлығы')
const statusFilter = ref('Барлығы')

const students = [
  { id: 's1', full_name: 'Айдана Серікова', group_name: '10А', phone: '+7 700 111 22 33', attempts_count: 2, last_score: 62, cefr_level: 'A2', status: 'Аяқталды' },
  { id: 's2', full_name: 'Нұрлан Ахметов', group_name: '10Б', phone: '+7 700 222 33 44', attempts_count: 1, last_score: 41, cefr_level: 'A1', status: 'Аяқталды' },
  { id: 's3', full_name: 'Гүлнұр Қасымова', group_name: '10А', phone: '+7 700 333 44 55', attempts_count: 3, last_score: 74, cefr_level: 'Above A2', status: 'Өтіп жатыр' },
  { id: 's4', full_name: 'Дәулет Жұманов', group_name: '10В', phone: '+7 700 444 55 66', attempts_count: 0, last_score: null, cefr_level: null, status: 'Басталмаған' },
]

const groups = computed(() => ['Барлығы', ...new Set(students.map((s) => s.group_name))])
const statuses = ['Барлығы', 'Басталмаған', 'Өтіп жатыр', 'Аяқталды']

const filteredStudents = computed(() =>
  students.filter((s) => {
    const matchesSearch = s.full_name.toLowerCase().includes(search.value.toLowerCase())
    const matchesGroup = groupFilter.value === 'Барлығы' || s.group_name === groupFilter.value
    const matchesStatus = statusFilter.value === 'Барлығы' || s.status === statusFilter.value
    return matchesSearch && matchesGroup && matchesStatus
  })
)

const columns = [
  { key: 'full_name', label: 'Аты', sortable: true },
  { key: 'group_name', label: 'Топ', sortable: true },
  { key: 'phone', label: 'Телефон', sortable: false },
  { key: 'attempts_count', label: 'Тапсырған емтихан', sortable: true },
  { key: 'last_score', label: 'Соңғы балл', sortable: true },
  { key: 'cefr_level', label: 'Деңгей', sortable: false },
  { key: 'actions', label: '', sortable: false },
]

function openStudent(student) {
  router.push({ name: 'results', params: { attemptId: student.id } })
}
</script>

<template>
  <div class="students">
    <div class="students__head">
      <h1>Оқушылар</h1>
      <AppButton @click="showAddStudent = true">Оқушы қосу</AppButton>
    </div>

    <div class="students__stats">
      <StatCard :value="students.length" label="Барлық оқушылар" />
      <StatCard :value="students.filter((s) => s.status === 'Өтіп жатыр').length" label="Өтіп жатыр" />
      <StatCard :value="students.filter((s) => s.status === 'Аяқталды').length" label="Аяқталды" />
      <StatCard :value="students.filter((s) => s.status === 'Басталмаған').length" label="Басталмаған" />
    </div>

    <AppCard>
      <div class="students__filters">
        <AppInput v-model="search" placeholder="Аты бойынша іздеу" />
        <select v-model="groupFilter" class="students__select">
          <option v-for="g in groups" :key="g" :value="g">{{ g }}</option>
        </select>
        <select v-model="statusFilter" class="students__select">
          <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>

      <DataTable :columns="columns" :rows="filteredStudents" row-key="id">
        <template #cell-cefr_level="{ row }">
          <CefrBadge v-if="row.cefr_level" :level="row.cefr_level" />
          <span v-else>—</span>
        </template>
        <template #cell-last_score="{ row }">
          {{ row.last_score ?? '—' }}
        </template>
        <template #cell-actions="{ row }">
          <button class="students__more" @click="openStudent(row)">Толығырақ</button>
        </template>
      </DataTable>
    </AppCard>

    <AddStudentModal :visible="showAddStudent" @close="showAddStudent = false" />
  </div>
</template>

<style scoped>
.students {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.students__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.students__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.students__filters {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.students__filters :deep(.app-input) {
  flex: 1;
  min-width: 200px;
}

.students__select {
  font-family: var(--font-body);
  font-size: var(--fs-body);
  border-radius: var(--radius-control);
  border: none;
  background: var(--color-input-bg);
  padding: 0.7rem 0.9rem;
}

.students__more {
  background: none;
  border: none;
  color: var(--color-primary-dark);
  font-weight: 700;
  cursor: pointer;
  font-size: var(--fs-label);
}

@media (max-width: 1279px) {
  .students__stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767px) {
  .students__stats {
    grid-template-columns: 1fr;
  }
}
</style>
