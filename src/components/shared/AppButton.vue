<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary', // primary | secondary | outline
  },
  fullWidth: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'button',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['click'])
</script>

<template>
  <button
    class="app-button"
    :class="[`app-button--${variant}`, { 'app-button--full': fullWidth }]"
    :type="type"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style scoped>
.app-button {
  font-family: var(--font-body);
  font-size: var(--fs-body);
  font-weight: 700;
  border: none;
  border-radius: var(--radius-control);
  padding: 0.7rem 1.4rem;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.app-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.app-button--full {
  width: 100%;
}

.app-button--primary {
  background: var(--color-primary-dark);
  color: #fff;
}

.app-button--primary:hover:not(:disabled) {
  background: var(--color-primary-dark-hover);
}

.app-button--secondary {
  background: var(--color-input-bg);
  color: var(--color-text);
}

.app-button--secondary:hover:not(:disabled) {
  background: #e8e2d2;
}

.app-button--outline {
  background: transparent;
  color: var(--color-primary-dark);
  border: 1.5px solid var(--color-primary-dark);
}

.app-button--outline:hover:not(:disabled) {
  background: rgba(31, 78, 74, 0.06);
}

</style>
