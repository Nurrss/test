<script setup>
import { computed } from 'vue'

const props = defineProps({
  points: {
    type: Array,
    required: true, // [{ label, score, maxScore }]
  },
})

const width = 640
const height = 220
const padding = 32

const coords = computed(() => {
  if (!props.points.length) return []
  const maxScore = Math.max(...props.points.map((p) => p.maxScore))
  const step = props.points.length > 1 ? (width - padding * 2) / (props.points.length - 1) : 0

  return props.points.map((point, index) => {
    const x = padding + step * index
    const ratio = point.score / maxScore
    const y = height - padding - ratio * (height - padding * 2)
    return { ...point, x, y }
  })
})

const linePath = computed(() =>
  coords.value.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ')
)
</script>

<template>
  <div class="progress-chart">
    <svg v-if="coords.length" :viewBox="`0 0 ${width} ${height}`" class="progress-chart__svg">
      <line :x1="padding" :y1="height - padding" :x2="width - padding" :y2="height - padding" class="progress-chart__axis" />
      <path :d="linePath" class="progress-chart__line" fill="none" />
      <g v-for="(c, i) in coords" :key="i">
        <circle :cx="c.x" :cy="c.y" r="4.5" class="progress-chart__dot" />
        <text :x="c.x" :y="c.y - 12" text-anchor="middle" class="progress-chart__value">{{ c.score }}</text>
        <text :x="c.x" :y="height - padding + 18" text-anchor="middle" class="progress-chart__label">{{ c.label }}</text>
      </g>
    </svg>
    <p v-else class="progress-chart__empty">Деректер жеткіліксіз</p>
  </div>
</template>

<style scoped>
.progress-chart__svg {
  width: 100%;
  height: auto;
}

.progress-chart__axis {
  stroke: var(--color-border);
  stroke-width: 1;
}

.progress-chart__line {
  stroke: var(--color-accent-blue);
  stroke-width: 2.5;
}

.progress-chart__dot {
  fill: var(--color-accent-blue);
}

.progress-chart__value {
  font-size: 11px;
  fill: var(--color-text);
  font-weight: 700;
}

.progress-chart__label {
  font-size: 11px;
  fill: var(--color-text-secondary);
}

.progress-chart__empty {
  color: var(--color-text-secondary);
  text-align: center;
  padding: 2rem 0;
}
</style>
