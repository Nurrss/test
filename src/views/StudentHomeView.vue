<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'
import AppCard from '../components/shared/AppCard.vue'
import AppButton from '../components/shared/AppButton.vue'
import CefrBadge from '../components/shared/CefrBadge.vue'

const auth = useAuthStore()
const router = useRouter()

const loading = ref(true)
const errorMessage = ref('')
const assignment = ref(null) // { variant_id, allow_retake, name, level }
const attempt = ref(null) // { status, total_score, cefr_level }

// Только чтение — resolve_attempt() имеет побочный эффект (создаёт попытку),
// поэтому его нельзя дёргать просто для показа статуса на главной странице.
async function loadStatus() {
  loading.value = true
  errorMessage.value = ''

  const studentId = auth.session?.user?.id

  // Иерархия resolve_attempt() (schema_patch_05) дәл қайталанады: allow_retake=true
  // жол бірінші кезекте, әйтпесе ең соңғы assigned_at. Бөлек ретті қолдансақ,
  // мұнда көрсетілген нұсқа мен экзамен басталғанда іс жүзінде ашылатын нұсқа
  // сәйкес келмей қалуы мүмкін (мысалы, ескі нұсқаға retake рұқсат етілген
  // соң оқушыға жаңа нұсқа тағайындалса).
  const { data: assignmentRow, error: assignmentError } = await supabase
    .from('exam_assignments')
    .select('variant_id, allow_retake, exam_variants(name, level)')
    .eq('student_id', studentId)
    .order('allow_retake', { ascending: false })
    .order('assigned_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (assignmentError) {
    errorMessage.value = 'Деректерді жүктеу мүмкін болмады: ' + assignmentError.message
    loading.value = false
    return
  }

  if (!assignmentRow) {
    assignment.value = null
    attempt.value = null
    loading.value = false
    return
  }

  assignment.value = {
    variant_id: assignmentRow.variant_id,
    allow_retake: assignmentRow.allow_retake,
    name: assignmentRow.exam_variants?.name || '—',
    level: assignmentRow.exam_variants?.level || '—',
  }

  const { data: attemptRow, error: attemptError } = await supabase
    .from('exam_attempts')
    .select('status, total_score, cefr_level')
    .eq('student_id', studentId)
    .eq('variant_id', assignmentRow.variant_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (attemptError) {
    errorMessage.value = 'Деректерді жүктеу мүмкін болмады: ' + attemptError.message
    loading.value = false
    return
  }

  attempt.value = attemptRow

  loading.value = false
}

function goToExam() {
  router.push({ name: 'exam' })
}

function goToResults() {
  router.push({ name: 'my-results' })
}

onMounted(loadStatus)
</script>

<template>
  <div class="student-home">
    <h1 class="student-home__title">Қош келдіңіз, {{ auth.profile?.full_name || 'Оқушы' }}!</h1>

    <p v-if="errorMessage" class="student-home__error">{{ errorMessage }}</p>
    <p v-else-if="loading" class="student-home__loading">Жүктелуде...</p>

    <AppCard v-else class="student-home__card">
      <template v-if="!assignment">
        <p>Сізге әлі емтихан тағайындалмаған. Мұғаліммен байланысыңыз.</p>
      </template>

      <template v-else-if="!attempt">
        <h2>{{ assignment.name }}</h2>
        <p class="student-home__level">Деңгей: {{ assignment.level }}</p>
        <AppButton @click="goToExam">Емтиханды бастау</AppButton>
      </template>

      <template v-else-if="attempt.status === 'in_progress'">
        <h2>{{ assignment.name }}</h2>
        <p>Сіз бұл емтиханды бастадыңыз, бірақ аяқтамадыңыз.</p>
        <AppButton @click="goToExam">Емтиханды жалғастыру</AppButton>
      </template>

      <template v-else>
        <h2>{{ assignment.name }}</h2>
        <div class="student-home__score">
          <span class="student-home__score-value">{{ attempt.total_score ?? '—' }}</span>
          <CefrBadge v-if="attempt.cefr_level" :level="attempt.cefr_level" size="large" />
        </div>
        <p v-if="!attempt.total_score" class="student-home__pending">
          Нәтижелер мұғалім тексергеннен кейін жарияланады.
        </p>
        <div class="student-home__actions">
          <AppButton variant="secondary" @click="goToResults">Нәтижемді көру</AppButton>
          <AppButton v-if="assignment.allow_retake" @click="goToExam">Қайта тапсыру</AppButton>
        </div>
      </template>
    </AppCard>
  </div>
</template>

<style scoped>
.student-home {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 520px;
}

.student-home__title {
  font-size: 24px;
}

.student-home__error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 0.65rem 0.9rem;
  border-radius: var(--radius-control);
  font-size: var(--fs-label);
}

.student-home__loading {
  color: var(--color-text-secondary);
  padding: 1rem 0;
}

.student-home__card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.student-home__level {
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
}

.student-home__score {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.student-home__score-value {
  font-family: var(--font-heading);
  font-size: 32px;
  font-weight: 700;
}

.student-home__pending {
  color: var(--color-text-secondary);
  font-size: 12px;
}

.student-home__actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}
</style>
