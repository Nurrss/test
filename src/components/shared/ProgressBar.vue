<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  max: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    default: 'var(--color-accent-blue)',
  },
})

const ratio = computed(() => Math.min(100, Math.max(0, (props.value / props.max) * 100)))
</script>

<template>
  <div class="progress-bar">
    <div class="progress-bar__head">
      <span class="progress-bar__label">{{ label }}</span>
      <span class="progress-bar__score">{{ value }}/{{ max }}</span>
    </div>
    <div class="progress-bar__track">
      <div class="progress-bar__fill" :style="{ width: `${ratio}%`, background: color }"></div>
    </div>
  </div>
</template>

<style scoped>
.progress-bar {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.progress-bar__head {
  display: flex;
  justify-content: space-between;
  font-size: var(--fs-body);
}

.progress-bar__label {
  font-weight: 600;
}

.progress-bar__score {
  color: var(--color-text-secondary);
}

.progress-bar__track {
  height: 10px;
  border-radius: 999px;
  background: var(--color-border);
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.4s ease;
}
</style>
