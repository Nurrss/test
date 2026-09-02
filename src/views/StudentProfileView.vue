<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import AppCard from '../components/shared/AppCard.vue'
import AppButton from '../components/shared/AppButton.vue'
import CefrBadge from '../components/shared/CefrBadge.vue'
import ResetPasswordModal from '../components/shared/ResetPasswordModal.vue'
import AssignExamModal from '../components/dashboard/AssignExamModal.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const errorMessage = ref('')
const student = ref(null) // { id, full_name, group_name, phone, password_plain }
const attempts = ref([])
const passwordRevealed = ref(false)
const showReset = ref(false)
const showAssign = ref(false)

async function copyPassword() {
  try {
    await navigator.clipboard.writeText(student.value.password_plain)
  } catch {
    // Clipboard API қолжетімсіз болса — үнсіз өткіземіз, пароль бәрібір экранда көрініп тұр.
  }
}

async function loadStudent(id) {
  loading.value = true
  errorMessage.value = ''
  passwordRevealed.value = false

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, group_name, phone, password_plain')
    .eq('id', id)
    .eq('role', 'student')
    .single()

  if (profileError || !profile) {
    errorMessage.value = 'Оқушы табылмады: ' + (profileError?.message || 'белгісіз қате')
    loading.value = false
    return
  }

  student.value = profile

  const { data: attemptRows, error: attemptsError } = await supabase
    .from('exam_attempts')
    .select('id, status, total_score, cefr_level, created_at, exam_variants(name)')
    .eq('student_id', id)
    .order('created_at', { ascending: false })

  if (attemptsError) {
    errorMessage.value = 'Емтихан тарихын жүктеу мүмкін болмады: ' + attemptsError.message
    loading.value = false
    return
  }

  attempts.value = (attemptRows || []).map((a) => ({
    id: a.id,
    variant_name: a.exam_variants?.name || '—',
    status: a.status,
    total_score: a.total_score,
    cefr_level: a.cefr_level,
    created_at: a.created_at,
  }))

  loading.value = false
}

function handlePasswordReset({ newPassword }) {
  if (student.value) student.value.password_plain = newPassword
  passwordRevealed.value = true
}

function openResults(attemptId) {
  router.push({ name: 'results', params: { attemptId } })
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('ru-RU')
}

const statusLabels = {
  in_progress: 'Өтіп жатыр',
  submitted: 'Тексерілуде',
  graded: 'Аяқталды',
}

onMounted(() => loadStudent(route.params.id))
watch(
  () => route.params.id,
  (id) => loadStudent(id)
)
</script>

<template>
  <div class="student-profile">
    <button class="student-profile__back" @click="router.push({ name: 'students' })">
      <i class="fa-solid fa-arrow-left"></i> Оқушыларға оралу
    </button>

    <p v-if="loading" class="student-profile__status">Жүктелуде...</p>
    <p v-else-if="errorMessage" class="student-profile__status student-profile__status--error">
      {{ errorMessage }}
    </p>

    <template v-else>
      <div class="student-profile__grid">
        <AppCard class="student-profile__info">
          <h2>{{ student.full_name }}</h2>
          <p class="student-profile__row">
            <span class="student-profile__label">Топ:</span>
            <span>{{ student.group_name || '—' }}</span>
          </p>
          <p class="student-profile__row">
            <span class="student-profile__label">Телефон:</span>
            <span>{{ student.phone || '—' }}</span>
          </p>
          <AppButton variant="secondary" class="student-profile__assign-btn" @click="showAssign = true">
            Емтихан тағайындау
          </AppButton>
        </AppCard>

        <AppCard class="student-profile__credentials">
          <h2>Кіру деректері</h2>
          <p class="student-profile__row">
            <span class="student-profile__label">Телефон:</span>
            <span>{{ student.phone || '—' }}</span>
          </p>
          <p class="student-profile__row">
            <span class="student-profile__label">Құпия сөз:</span>
            <template v-if="student.password_plain">
              <code>{{ passwordRevealed ? student.password_plain : '••••••••' }}</code>
              <button
                type="button"
                class="student-profile__icon-btn"
                :aria-label="passwordRevealed ? 'Жасыру' : 'Көрсету'"
                @click="passwordRevealed = !passwordRevealed"
              >
                <i class="fa-solid" :class="passwordRevealed ? 'fa-eye-slash' : 'fa-eye'"></i>
              </button>
              <button type="button" class="student-profile__icon-btn" aria-label="Көшіру" @click="copyPassword">
                <i class="fa-solid fa-copy"></i>
              </button>
            </template>
            <span v-else class="student-profile__missing">сақталмаған</span>
          </p>
          <AppButton variant="outline" class="student-profile__reset-btn" @click="showReset = true">
            Ауыстыру
          </AppButton>
        </AppCard>
      </div>

      <AppCard>
        <h2>Емтихан тарихы</h2>
        <p v-if="!attempts.length" class="student-profile__empty">Әлі емтихан тапсырылмаған</p>
        <table v-else class="student-profile__table">
          <thead>
            <tr>
              <th>Нұсқа</th>
              <th>Күні</th>
              <th>Статус</th>
              <th>Балл</th>
              <th>Деңгей</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in attempts" :key="a.id">
              <td>{{ a.variant_name }}</td>
              <td>{{ formatDate(a.created_at) }}</td>
              <td>{{ statusLabels[a.status] || a.status }}</td>
              <td>{{ a.total_score ?? '—' }}</td>
              <td><CefrBadge v-if="a.cefr_level" :level="a.cefr_level" /><span v-else>—</span></td>
              <td>
                <button class="student-profile__link" @click="openResults(a.id)">Толығырақ</button>
              </td>
            </tr>
          </tbody>
        </table>
      </AppCard>
    </template>

    <ResetPasswordModal
      :visible="showReset"
      :student="student"
      @close="showReset = false"
      @reset="handlePasswordReset"
    />

    <AssignExamModal :visible="showAssign" :student="student" @close="showAssign = false" @assigned="() => {}" />
  </div>
</template>

<style scoped>
.student-profile {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.student-profile__back {
  align-self: flex-start;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-family: var(--font-body);
  font-size: var(--fs-label);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.student-profile__back:hover {
  color: var(--color-primary-dark);
}

.student-profile__status {
  color: var(--color-text-secondary);
  padding: 2rem 0;
  text-align: center;
}

.student-profile__status--error {
  color: var(--color-accent-red);
}

.student-profile__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.student-profile__info h2,
.student-profile__credentials h2 {
  margin-bottom: 1rem;
}

.student-profile__row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--fs-body);
  padding: 0.35rem 0;
}

.student-profile__label {
  color: var(--color-text-secondary);
  min-width: 90px;
}

.student-profile__row code {
  font-family: var(--font-body);
  background: var(--color-input-bg);
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
}

.student-profile__icon-btn {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0.2rem;
  display: flex;
  align-items: center;
}

.student-profile__icon-btn:hover {
  color: var(--color-primary-dark);
}

.student-profile__missing {
  color: var(--color-text-secondary);
  font-size: var(--fs-label);
}

.student-profile__assign-btn,
.student-profile__reset-btn {
  margin-top: 1rem;
}

.student-profile__empty {
  color: var(--color-text-secondary);
  padding: 1rem 0;
}

.student-profile__table {
  width: 100%;
  border-collapse: collapse;
}

.student-profile__table th {
  text-align: left;
  font-size: var(--fs-label);
  color: var(--color-text-secondary);
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.student-profile__table td {
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.student-profile__link {
  background: none;
  border: none;
  color: var(--color-primary-dark);
  font-weight: 700;
  cursor: pointer;
  font-size: var(--fs-label);
}

@media (max-width: 767px) {
  .student-profile__grid {
    grid-template-columns: 1fr;
  }
}
</style>
