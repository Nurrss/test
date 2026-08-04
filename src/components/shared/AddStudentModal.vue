<script setup>
import AppInput from './AppInput.vue'
import AppButton from './AppButton.vue'

defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['close'])
</script>

<template>
  <div v-if="visible" class="add-student-backdrop" @click.self="$emit('close')">
    <div class="add-student-box">
      <h3>Оқушы қосу</h3>
      <form class="add-student-form" @submit.prevent="$emit('close')">
        <AppInput label="Аты-жөні" placeholder="Асан Асанов" />
        <AppInput label="Телефон нөмірі" type="tel" placeholder="+7 700 000 00 00" />
        <AppInput label="Топ" placeholder="10А" />
        <AppInput label="Бастапқы құпия сөз" type="password" placeholder="••••••••" />

        <p class="add-student-note">
          Оқушыны нақты тіркеу Supabase Admin API арқылы жасалады (келесі кезең) —
          бұл форма әзірге тек интерфейс.
        </p>

        <div class="add-student-actions">
          <AppButton variant="secondary" type="button" @click="$emit('close')">Бас тарту</AppButton>
          <AppButton type="submit" disabled>Сақтау</AppButton>
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

.add-student-note {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.add-student-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 0.5rem;
}
</style>
