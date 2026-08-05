<script setup>
import { ref } from 'vue'
import { supabase } from '../../lib/supabase'
import AppInput from './AppInput.vue'
import AppButton from './AppButton.vue'

defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'created'])

const fullName = ref('')
const phone = ref('')
const groupName = ref('')
const password = ref('')
const isSaving = ref(false)
const errorMessage = ref('')

function resetForm() {
  fullName.value = ''
  phone.value = ''
  groupName.value = ''
  password.value = ''
  errorMessage.value = ''
}

function handleClose() {
  resetForm()
  emit('close')
}

async function handleSubmit() {
  errorMessage.value = ''

  if (!fullName.value || !phone.value || !password.value) {
    errorMessage.value = 'Аты-жөні, телефон және құпия сөз міндетті'
    return
  }

  isSaving.value = true
  const { data, error } = await supabase.functions.invoke('create-student', {
    body: {
      full_name: fullName.value,
      phone: phone.value,
      group_name: groupName.value,
      password: password.value,
    },
  })
  isSaving.value = false

  if (error || data?.error) {
    errorMessage.value = 'Қосу мүмкін болмады: ' + (data?.error || error.message)
    return
  }

  resetForm()
  emit('created')
  emit('close')
}
</script>

<template>
  <div v-if="visible" class="add-student-backdrop" @click.self="handleClose">
    <div class="add-student-box">
      <h3>Оқушы қосу</h3>
      <form class="add-student-form" @submit.prevent="handleSubmit">
        <AppInput v-model="fullName" label="Аты-жөні" placeholder="Асан Асанов" />
        <AppInput v-model="phone" label="Телефон нөмірі" type="tel" placeholder="+7 700 000 00 00" />
        <AppInput v-model="groupName" label="Топ" placeholder="10А" />
        <AppInput v-model="password" label="Бастапқы құпия сөз" type="password" placeholder="••••••••" />

        <p v-if="errorMessage" class="add-student-error">{{ errorMessage }}</p>

        <div class="add-student-actions">
          <AppButton variant="secondary" type="button" @click="handleClose">Бас тарту</AppButton>
          <AppButton type="submit" :disabled="isSaving">
            {{ isSaving ? 'Қосылуда...' : 'Сақтау' }}
          </AppButton>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.add-student-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  padding: 1rem;
}

.add-student-box {
  background: var(--color-card);
  border-radius: var(--radius-card);
  padding: 1.75rem;
  width: 100%;
  max-width: 420px;
  box-shadow: var(--shadow-card);
}

.add-student-box h3 {
  margin-bottom: 1.25rem;
}

.add-student-form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.add-student-error {
  font-size: 12px;
  color: var(--color-accent-red);
  line-height: 1.5;
}

.add-student-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 0.5rem;
}
</style>
