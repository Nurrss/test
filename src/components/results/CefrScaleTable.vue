<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentLevel: {
    type: String,
    required: true,
  },
  maxScore: {
    type: Number,
    default: 80,
  },
})

// Те же проценты, что и src/lib/cefr.js: 30% / 60% / 85% от максимального балла.
const ranges = computed(() => {
  const max = props.maxScore || 80
  const b1 = Math.round(max * 0.3)
  const b2 = Math.round(max * 0.6)
  const b3 = Math.round(max * 0.85)
  return [
    { level: 'Pre-A1', range: `0 – ${b1}` },
    { level: 'A1', range: `${b1 + 1} – ${b2}` },
    { level: 'A2', range: `${b2 + 1} – ${b3}` },
    { level: 'Above A2', range: `${b3 + 1} – ${max}` },
  ]
})
</script>

<template>
  <table class="cefr-scale">
    <thead>
      <tr>
        <th>Балл диапазоны</th>
        <th>Деңгей</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="row in ranges"
        :key="row.level"
        :class="{ 'cefr-scale__row--current': row.level === currentLevel }"
      >
        <td>{{ row.range }}</td>
        <td>{{ row.level }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.cefr-scale__row--current {
  background: rgba(15, 92, 90, 0.08);
  font-weight: 700;
}
</style>
