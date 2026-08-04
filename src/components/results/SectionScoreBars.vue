<script setup>
import ProgressBar from '../shared/ProgressBar.vue'

defineProps({
  sections: {
    type: Array,
    required: true, // [{ key, label, value, max }]
  },
})

const colorByKey = {
  listening: 'var(--color-accent-blue)',
  reading: 'var(--color-accent-green)',
  writing: 'var(--color-accent-orange)',
  speaking: 'var(--color-accent-purple)',
}
</script>

<template>
  <div class="section-score-bars">
    <ProgressBar
      v-for="section in sections"
      :key="section.key"
      :label="section.label"
      :value="section.value"
      :max="section.max"
      :color="colorByKey[section.key]"
    />
  </div>
</template>

<style scoped>
.section-score-bars {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
</style>
