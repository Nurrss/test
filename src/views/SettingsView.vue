<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import AppCard from '../components/shared/AppCard.vue'
import AppInput from '../components/shared/AppInput.vue'
import AppButton from '../components/shared/AppButton.vue'

// TODO: сохранение требует policy на UPDATE в profiles (сейчас есть только SELECT) —
// добавляется вместе с бизнес-логикой этого экрана.
const auth = useAuthStore()

const fullName = ref(auth.profile?.full_name || '')
const orgName = ref('')
const newPassword = ref('')
const savedMessage = ref('')

function handleSave() {
  savedMessage.value = 'Сақтау Edge Function/RLS policy қосылған соң жұмыс істейді.'
}
</script>

<template>
  <div class="settings">
    <h1>Параметрлер</h1>

    <AppCard class="settings__card">
      <h2>Мұғалім профилі</h2>
      <form class="settings__form" @submit.prevent="handleSave">
        <AppInput v-model="fullName" label="Аты-жөні" />
        <AppInput :model-value="auth.session?.user?.email || ''" label="Email" disabled />
        <AppInput v-model="newPassword" type="password" label="Жаңа құпия сөз" placeholder="••••••••" />
        <AppButton type="submit">Сақтау</AppButton>
        <p v-if="savedMessage" class="settings__note">{{ savedMessage }}</p>
      </form>
    </AppCard>

    <AppCard class="settings__card">
      <h2>Ұйым параметрлері</h2>
      <form class="settings__form" @submit.prevent="handleSave">
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
</style>
