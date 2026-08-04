<script setup>
defineProps({
  zone: {
    type: String,
    required: true,
  },
  minHeight: {
    type: String,
    default: '160px',
  },
})
</script>

<template>
  <div class="decor-zone" :data-decor-zone="zone" :style="{ minHeight }">
    <slot />
  </div>
</template>

<style scoped>
.decor-zone {
  width: 100%;
  border-radius: var(--radius-card);
}
</style>
