<script setup>
import { computed } from 'vue'

const props = defineProps({
  level: {
    type: String,
    required: true, // 'Pre-A1' | 'A1' | 'A2' | 'Above A2'
  },
  size: {
    type: String,
    default: 'body', // 'body' | 'large'
  },
})

const colorVar = computed(() => {
  const map = {
    'Pre-A1': '--color-accent-red',
    A1: '--color-accent-orange',
    A2: '--color-accent-blue',
    'Above A2': '--color-accent-green',
  }
  return map[props.level] || '--color-text-secondary'
})
</script>

<template>
  <span class="cefr-badge" :class="`cefr-badge--${size}`" :style="{ color: `var(${colorVar})` }">
    {{ level }}
  </span>
</template>

<style scoped>
.cefr-badge {
  font-weight: 700;
  white-space: nowrap;
}

.cefr-badge--large {
  font-family: var(--font-heading);
  font-size: 20px;
}
</style>
