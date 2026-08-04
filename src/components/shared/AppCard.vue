<script setup>
defineProps({
  padded: {
    type: Boolean,
    default: true,
  },
})
</script>

<template>
  <div class="app-card" :class="{ 'app-card--padded': padded }">
    <slot />
  </div>
</template>

<style scoped>
.app-card {
  background: var(--color-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}

.app-card--padded {
  padding: 1.5rem;
}
</style>
