<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])
</script>

<template>
  <div v-if="visible" class="tab-warning-backdrop" @click.self="emit('close')">
    <div class="tab-warning-box">
      <h3>Сіз қойындыны/терезені тастап кеттіңіз</h3>
      <p>Бұл әрекет тіркелді.</p>
      <div class="tab-warning-actions">
        <button class="tab-warning-btn" @click="emit('close')">Түсінікті</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab-warning-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.tab-warning-box {
  background: var(--color-card);
  border-radius: var(--radius-card);
  padding: 1.75rem;
  max-width: 420px;
  width: 90%;
  box-shadow: var(--shadow-card);
}

.tab-warning-box h3 {
  margin-bottom: 0.5rem;
}

.tab-warning-actions {
  margin-top: 1.25rem;
  text-align: right;
}

.tab-warning-btn {
  background: var(--color-primary-dark);
  color: #fff;
  border: none;
  border-radius: var(--radius-control);
  padding: 0.6rem 1.2rem;
  font-weight: 700;
  cursor: pointer;
}
</style>
