<script setup>
import { ref, watch } from 'vue'
import { supabase } from '../../lib/supabase'
import AppInput from './AppInput.vue'
import AppButton from './AppButton.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  student: {
    type: Object,
    default: null, // { id, full_name }
  },
})

const emit = defineEmits(['close', 'reset'])

const newPassword = ref('')
const isSaving = ref(false)
const errorMessage = ref('')

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      newPassword.value = ''
      errorMessage.value = ''
    }
  }
)

async function resolveFunctionError(error, data) {
  if (data?.error) return data.error
  if (error?.context?.json) {
    try {
      const body = await error.context.json()
      if (body?.error) return body.error
    } catch {
      // context body wasn't JSON (e.g. function didn't deploy / crashed before responding) — fall through
    }
  }
  return error?.message || 'белгісіз қате'
}

function handleClose() {
  emit('close')
}

async function handleSubmit() {
  errorMessage.value = ''

  if (!newPassword.value || newPassword.value.length < 6) {
    errorMessage.value = 'Құпия сөз кемінде 6 таңбадан тұруы керек'
    return
  }

  isSaving.value = true
  const { data, error } = await supabase.functions.invoke('reset-student-password', {
    body: {
      student_id: props.student.id,
      new_password: newPassword.value,
    },
  })
  isSaving.value = false

  if (error || data?.error) {
    errorMessage.value = 'Ауыстыру мүмкін болмады: ' + (await resolveFunctionError(error, data))
    return
  }

  emit('reset', { studentId: props.student.id, newPassword: newPassword.value })
  emit('close')
}
</script>

<template>
  <div v-if="visible" class="reset-password-backdrop" @click.self="handleClose">
    <div class="reset-password-box">
      <h3>Құпия сөзді ауыстыру</h3>
      <p class="reset-password-subtitle">{{ student?.full_name }}</p>
      <form class="reset-password-form" @submit.prevent="handleSubmit">
        <AppInput v-model="newPassword" label="Жаңа құпия сөз" type="password" placeholder="••••••••" />

        <p v-if="errorMessage" class="reset-password-error">{{ errorMessage }}</p>

        <div class="reset-password-actions">
          <AppButton variant="secondary" type="button" @click="handleClose">Бас тарту</AppButton>
          <AppButton type="submit" :disabled="isSaving">
            {{ isSaving ? 'Сақталуда...' : 'Сақтау' }}
          </AppButton>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.reset-password-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  padding: 1rem;
}

.reset-password-box {
  background: var(--color-card);
  border-radius: var(--radius-card);
  padding: 1.75rem;
  width: 100%;
  max-width: 420px;
  box-shadow: var(--shadow-card);
}

.reset-password-box h3 {
  margin-bottom: 0.25rem;
}

.reset-password-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--fs-label);
  margin-bottom: 1.25rem;
}

.reset-password-form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.reset-password-error {
  font-size: 12px;
  color: var(--color-accent-red);
  line-height: 1.5;
}

.reset-password-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 0.5rem;
}
</style>
