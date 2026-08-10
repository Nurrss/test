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
});

defineEmits(['click']);
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
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
}

.app-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.app-button--full {
  width: 100%;
}

.app-button--primary {
  position: relative;
  overflow: hidden;
  background: var(--color-primary-dark);
  color: #fff;
}

.app-button--primary:hover:not(:disabled) {
  background: var(--color-primary-dark-hover);
}

/* Vector.svg оюы — осы бес айнымалыны өзгерту арқылы реттеледі:
   size = ою мөлшері, offset = шеттен қашықтық (теріс мән — сыртқа шығады),
   rotate = бұрылу бұрышы. */
.app-button--primary {
  --ornament-size: 55px;
  --ornament-offset: -20px;
  --ornament-rotate: 90deg;
}

.app-button--primary::before,
.app-button--primary::after {
  content: '';
  position: absolute;
  top: 50%;
  width: var(--ornament-size);
  height: var(--ornament-size);
  -webkit-mask-image: url('../../assets/photos/vector.svg');
  mask-image: url('../../assets/photos/vector.svg');
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-size: contain;
  mask-size: contain;
  background-color: var(--color-gold);
  pointer-events: none;
}

.app-button--primary::before {
  left: var(--ornament-offset);
  transform: translateY(-50%) rotate(calc(-1 * var(--ornament-rotate)));
}

.app-button--primary::after {
  right: var(--ornament-offset);
  transform: translateY(-50%) rotate(var(--ornament-rotate));
}

.app-button--secondary {
  background: var(--color-input-bg);
  color: var(--color-text);
}

.app-button--secondary:hover:not(:disabled) {
  background: var(--color-border);
}

.app-button--outline {
  background: transparent;
  color: var(--color-primary-dark);
  border: 1.5px solid var(--color-primary-dark);
}

.app-button--outline:hover:not(:disabled) {
  background: rgba(15, 92, 90, 0.06);
}
</style>
