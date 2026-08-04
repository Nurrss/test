<script setup>
import { computed } from 'vue'

const props = defineProps({
  rows: {
    type: Array,
    required: true, // [{ name, score, maxScore, highlight }]
  },
})

const maxScore = computed(() => Math.max(...props.rows.map((r) => r.maxScore), 1))
</script>

<template>
  <div class="comparison-chart">
    <div v-for="row in rows" :key="row.name" class="comparison-chart__row">
      <span class="comparison-chart__name">{{ row.name }}</span>
      <div class="comparison-chart__track">
        <div
          class="comparison-chart__fill"
          :class="{ 'comparison-chart__fill--highlight': row.highlight }"
          :style="{ width: `${(row.score / maxScore) * 100}%` }"
        ></div>
      </div>
      <span class="comparison-chart__score">{{ row.score }}</span>
    </div>
  </div>
</template>

<style scoped>
.comparison-chart {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.comparison-chart__row {
  display: grid;
  grid-template-columns: 120px 1fr 40px;
  align-items: center;
  gap: 0.75rem;
  font-size: var(--fs-label);
}

.comparison-chart__name {
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comparison-chart__track {
  height: 14px;
  border-radius: 999px;
  background: var(--color-border);
  overflow: hidden;
}

.comparison-chart__fill {
  height: 100%;
  border-radius: 999px;
  background: var(--color-accent-blue);
  transition: width 0.4s ease;
}

.comparison-chart__fill--highlight {
  background: var(--color-primary-dark);
}

.comparison-chart__score {
  text-align: right;
  font-weight: 700;
}
</style>
