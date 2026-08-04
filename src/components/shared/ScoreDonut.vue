<script setup>
import { computed } from 'vue'

const props = defineProps({
  score: {
    type: Number,
    required: true,
  },
  maxScore: {
    type: Number,
    required: true,
  },
  segments: {
    // [{ value, color }] — сумма value должна равняться maxScore
    type: Array,
    default: () => [],
  },
  size: {
    type: Number,
    default: 150,
  },
})

const strokeWidth = 14
const radius = computed(() => props.size / 2 - strokeWidth)
const circumference = computed(() => 2 * Math.PI * radius.value)

const arcs = computed(() => {
  let cumulative = 0
  return props.segments.map((segment) => {
    const length = (segment.value / props.maxScore) * circumference.value
    const arc = {
      color: segment.color,
      dasharray: `${length} ${circumference.value - length}`,
      dashoffset: -cumulative,
    }
    cumulative += length
    return arc
  })
})
</script>

<template>
  <div class="score-donut" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        stroke="var(--color-border)"
        :stroke-width="strokeWidth"
      />
      <circle
        v-for="(arc, index) in arcs"
        :key="index"
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke="arc.color"
        :stroke-width="strokeWidth"
        :stroke-dasharray="arc.dasharray"
        :stroke-dashoffset="arc.dashoffset"
        :transform="`rotate(-90 ${size / 2} ${size / 2})`"
      />
    </svg>
    <div class="score-donut__label">
      <strong>{{ score }}</strong>
      <span>/ {{ maxScore }}</span>
    </div>
  </div>
</template>

<style scoped>
.score-donut {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.score-donut__label {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--font-heading);
}

.score-donut__label strong {
  font-size: 28px;
  color: var(--color-text);
}

.score-donut__label span {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-family: var(--font-body);
}
</style>
