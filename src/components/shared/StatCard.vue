<script setup>
defineProps({
  value: {
    type: [String, Number],
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  to: {
    type: [String, Object],
    default: null,
  },
})
</script>

<template>
  <component
    :is="to ? 'router-link' : 'div'"
    :to="to"
    class="stat-card"
    :class="{ 'stat-card--clickable': Boolean(to) }"
  >
    <div class="stat-card__value">{{ value }}</div>
    <div class="stat-card__label">{{ label }}</div>
  </component>
</template>

<style scoped>
.stat-card {
  background: var(--color-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 1.25rem 1.4rem;
  display: block;
  text-decoration: none;
  color: inherit;
}

.stat-card--clickable {
  cursor: pointer;
  transition: transform 0.12s ease;
}

.stat-card--clickable:hover {
  transform: translateY(-2px);
}

.stat-card__value {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 700;
  color: var(--color-value-green);
}

.stat-card__label {
  margin-top: 0.35rem;
  font-size: var(--fs-label);
  color: var(--color-text);
}
</style>
