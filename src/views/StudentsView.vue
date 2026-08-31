<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import AppCard from '../components/shared/AppCard.vue'
import AppButton from '../components/shared/AppButton.vue'
import AppInput from '../components/shared/AppInput.vue'
import StatCard from '../components/shared/StatCard.vue'
import DataTable from '../components/shared/DataTable.vue'
import CefrBadge from '../components/shared/CefrBadge.vue'
import AddStudentModal from '../components/shared/AddStudentModal.vue'
import ResetPasswordModal from '../components/shared/ResetPasswordModal.vue'
import AssignExamModal from '../components/dashboard/AssignExamModal.vue'
import GroupAssignModal from '../components/dashboard/GroupAssignModal.vue'

const router = useRouter()
const showAddStudent = ref(false)
const assignTarget = ref(null)
const resetTarget = ref(null)
const showGroupAssign = ref(false)
const search = ref('')
const groupFilter = ref('Барлығы')
const statusFilter = ref('Барлығы')
const loading = ref(true)
const errorMessage = ref('')
const students = ref([])
const revealedPasswords = ref(new Set())

function togglePassword(studentId) {
  const next = new Set(revealedPasswords.value)
  if (next.has(studentId)) next.delete(studentId)
  else next.add(studentId)
  revealedPasswords.value = next
}

async function copyPassword(password) {
  try {
    await navigator.clipboard.writeText(password)
  } catch {
    // Clipboard API қолжетімсіз болса (http, ескі браузер) — үнсіз өткіземіз,
    // құпия сөз бәрібір экранда көрініп тұр, қолмен көшіруге болады.
  }
}

async function loadStudents() {
  loading.value = true
  errorMessage.value = ''

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, group_name, phone, password_plain')
    .eq('role', 'student')
    .order('full_name')

  if (profilesError) {
    errorMessage.value = 'Оқушыларды жүктеу мүмкін болмады: ' + profilesError.message
    loading.value = false
    return
  }

  const studentIds = (profiles || []).map((p) => p.id)
  let attemptsByStudent = new Map()

  if (studentIds.length) {
    const { data: attempts, error: attemptsError } = await supabase
      .from('exam_attempts')
      .select('id, student_id, status, total_score, cefr_level, created_at')
      .in('student_id', studentIds)
      .order('created_at', { ascending: false })

    if (attemptsError) {
      errorMessage.value = 'Емтихан деректерін жүктеу мүмкін болмады: ' + attemptsError.message
      loading.value = false
      return
    }

    attemptsByStudent = (attempts || []).reduce((map, attempt) => {
      const list = map.get(attempt.student_id) || []
      list.push(attempt)
      map.set(attempt.student_id, list)
      return map
    }, new Map())
  }

  students.value = (profiles || []).map((p) => {
    const attempts = attemptsByStudent.get(p.id) || []
    const latest = attempts[0]
    let status = 'Басталмаған'
    if (latest) status = latest.status === 'in_progress' ? 'Өтіп жатыр' : 'Аяқталды'

    return {
      id: p.id,
      full_name: p.full_name,
      group_name: p.group_name || '—',
      phone: p.phone || '—',
      password_plain: p.password_plain || null,
      attempts_count: attempts.length,
      last_score: latest?.total_score ?? null,
      cefr_level: latest?.cefr_level ?? null,
      last_attempt_id: latest?.id ?? null,
      status,
    }
  })

  loading.value = false
}

onMounted(loadStudents)

const groups = computed(() => ['Барлығы', ...new Set(students.value.map((s) => s.group_name))])
const statuses = ['Барлығы', 'Басталмаған', 'Өтіп жатыр', 'Аяқталды']

const filteredStudents = computed(() =>
  students.value.filter((s) => {
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
  { key: 'password_plain', label: 'Құпия сөз', sortable: false },
  { key: 'attempts_count', label: 'Тапсырған емтихан', sortable: true },
  { key: 'last_score', label: 'Соңғы балл', sortable: true },
  { key: 'cefr_level', label: 'Деңгей', sortable: false },
  { key: 'actions', label: '', sortable: false },
]

function openStudent(student) {
  if (!student.last_attempt_id) return
  router.push({ name: 'results', params: { attemptId: student.last_attempt_id } })
}

function openAssign(student) {
  assignTarget.value = student
}

function openReset(student) {
  resetTarget.value = student
}

function handlePasswordReset({ studentId, newPassword }) {
  const student = students.value.find((s) => s.id === studentId)
  if (student) student.password_plain = newPassword
  revealedPasswords.value = new Set(revealedPasswords.value).add(studentId)
}

const groupStudents = computed(() =>
  groupFilter.value === 'Барлығы' ? [] : students.value.filter((s) => s.group_name === groupFilter.value)
)
</script>

<template>
  <div class="students">
    <div class="students__head">
      <h1>Оқушылар</h1>
      <AppButton @click="showAddStudent = true">Оқушы қосу</AppButton>
    </div>

    <p v-if="errorMessage" class="students__error">{{ errorMessage }}</p>

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
        <AppButton
          variant="outline"
          :disabled="groupFilter === 'Барлығы' || !groupStudents.length"
          @click="showGroupAssign = true"
        >
          {{ groupFilter === 'Барлығы' ? 'Топты таңдаңыз' : `${groupFilter} тобын тағайындау` }}
        </AppButton>
      </div>

      <p v-if="loading" class="students__loading">Жүктелуде...</p>
      <DataTable v-else :columns="columns" :rows="filteredStudents" row-key="id">
        <template #cell-cefr_level="{ row }">
          <CefrBadge v-if="row.cefr_level" :level="row.cefr_level" />
          <span v-else>—</span>
        </template>
        <template #cell-last_score="{ row }">
          {{ row.last_score ?? '—' }}
        </template>
        <template #cell-password_plain="{ row }">
          <div v-if="row.password_plain" class="students__password">
            <code>{{ revealedPasswords.has(row.id) ? row.password_plain : '••••••••' }}</code>
            <button
              type="button"
              class="students__icon-btn"
              :aria-label="revealedPasswords.has(row.id) ? 'Жасыру' : 'Көрсету'"
              @click="togglePassword(row.id)"
            >
              <i class="fa-solid" :class="revealedPasswords.has(row.id) ? 'fa-eye-slash' : 'fa-eye'"></i>
            </button>
            <button
              type="button"
              class="students__icon-btn"
              aria-label="Көшіру"
              @click="copyPassword(row.password_plain)"
            >
              <i class="fa-solid fa-copy"></i>
            </button>
          </div>
          <span v-else class="students__password-missing">
            сақталмаған
            <button class="students__more" @click="openReset(row)">орнату</button>
          </span>
        </template>
        <template #cell-actions="{ row }">
          <div class="students__actions">
            <button
              v-if="row.last_attempt_id"
              class="students__more"
              @click="openStudent(row)"
            >
              Толығырақ
            </button>
            <button class="students__more" @click="openAssign(row)">Тағайындау</button>
            <button v-if="row.password_plain" class="students__more" @click="openReset(row)">Ауыстыру</button>
          </div>
        </template>
      </DataTable>
    </AppCard>

    <AddStudentModal
      :visible="showAddStudent"
      @close="showAddStudent = false"
      @created="loadStudents"
    />

    <AssignExamModal
      :visible="!!assignTarget"
      :student="assignTarget"
      @close="assignTarget = null"
      @assigned="loadStudents"
    />

    <ResetPasswordModal
      :visible="!!resetTarget"
      :student="resetTarget"
      @close="resetTarget = null"
      @reset="handlePasswordReset"
    />

    <GroupAssignModal
      :visible="showGroupAssign"
      :group-name="groupFilter"
      :students="groupStudents"
      @close="showGroupAssign = false"
      @assigned="loadStudents"
    />
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

.students__error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 0.65rem 0.9rem;
  border-radius: var(--radius-control);
  font-size: var(--fs-label);
}

.students__loading {
  color: var(--color-text-secondary);
  padding: 1rem 0;
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

.students__actions {
  display: flex;
  gap: 0.75rem;
}

.students__more {
  background: none;
  border: none;
  color: var(--color-primary-dark);
  font-weight: 700;
  cursor: pointer;
  font-size: var(--fs-label);
  white-space: nowrap;
}

.students__password {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.students__password code {
  font-family: var(--font-body);
  background: var(--color-input-bg);
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 13px;
}

.students__icon-btn {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0.2rem;
  display: flex;
  align-items: center;
}

.students__icon-btn:hover {
  color: var(--color-primary-dark);
}

.students__password-missing {
  color: var(--color-text-secondary);
  font-size: var(--fs-label);
  display: flex;
  align-items: center;
  gap: 0.4rem;
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
