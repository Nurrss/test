<script setup>
defineProps({
  currentLevel: {
    type: String,
    required: true,
  },
})

const ranges = [
  { level: 'Pre-A1', range: '0 – 24' },
  { level: 'A1', range: '25 – 48' },
  { level: 'A2', range: '49 – 68' },
  { level: 'Above A2', range: '69 – 80' },
]
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
  background: rgba(31, 78, 74, 0.08);
  font-weight: 700;
}
</style>
