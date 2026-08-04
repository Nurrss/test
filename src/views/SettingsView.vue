<script setup>
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'
import AppCard from '../components/shared/AppCard.vue'
import AppInput from '../components/shared/AppInput.vue'
import AppButton from '../components/shared/AppButton.vue'

const auth = useAuthStore()

const fullName = ref(auth.profile?.full_name || '')
const orgName = ref('')
const newPassword = ref('')
const isSaving = ref(false)
const savedMessage = ref('')
const errorMessage = ref('')

async function handleSaveProfile() {
  errorMessage.value = ''
  savedMessage.value = ''

  const updates = []
  if (fullName.value !== auth.profile?.full_name) {
    updates.push(supabase.from('profiles').update({ full_name: fullName.value }).eq('id', auth.session.user.id))
  }
  if (newPassword.value) {
    updates.push(supabase.auth.updateUser({ password: newPassword.value }))
  }

  if (!updates.length) {
    savedMessage.value = 'Өзгеріс жоқ.'
    return
  }

  isSaving.value = true
  const results = await Promise.all(updates)
  isSaving.value = false

  const firstError = results.find((r) => r.error)?.error
  if (firstError) {
    errorMessage.value = 'Сақтау мүмкін болмады: ' + firstError.message
    return
  }

  await auth.loadProfile()
  newPassword.value = ''
  savedMessage.value = 'Сақталды.'
}

function handleSaveOrg() {
  savedMessage.value = 'Ұйым параметрлері үшін кесте әлі жоқ — келесі кезеңде қосылады.'
}
</script>

<template>
  <div class="settings">
    <h1>Параметрлер</h1>

    <AppCard class="settings__card">
      <h2>Мұғалім профилі</h2>
      <form class="settings__form" @submit.prevent="handleSaveProfile">
        <AppInput v-model="fullName" label="Аты-жөні" />
        <AppInput :model-value="auth.session?.user?.email || ''" label="Email" disabled />
        <AppInput v-model="newPassword" type="password" label="Жаңа құпия сөз" placeholder="••••••••" />
        <AppButton type="submit" :disabled="isSaving">{{ isSaving ? 'Сақталуда...' : 'Сақтау' }}</AppButton>
        <p v-if="savedMessage" class="settings__note">{{ savedMessage }}</p>
        <p v-if="errorMessage" class="settings__error">{{ errorMessage }}</p>
      </form>
    </AppCard>

    <AppCard class="settings__card">
      <h2>Ұйым параметрлері</h2>
      <form class="settings__form" @submit.prevent="handleSaveOrg">
        <AppInput v-model="orgName" label="Ұйым атауы" placeholder="Мектеп / орталық атауы" />
        <AppButton type="submit" variant="outline">Сақтау</AppButton>
      </form>
    </AppCard>
  </div>
</template>

<style scoped>
.settings {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 520px;
}

.settings__card h2 {
  margin-bottom: 1.25rem;
}

.settings__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.settings__note {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.settings__error {
  font-size: 12px;
  color: var(--color-accent-red);
}
</style>
