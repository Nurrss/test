<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:modelValue'])

const showPassword = ref(false)
const isPassword = computed(() => props.type === 'password')
const resolvedType = computed(() => {
  if (!isPassword.value) return props.type
  return showPassword.value ? 'text' : 'password'
})
</script>

<template>
  <div class="app-input">
    <label v-if="label">{{ label }}</label>
    <div class="app-input__field">
      <input
        :type="resolvedType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <button
        v-if="isPassword"
        type="button"
        class="app-input__toggle"
        :aria-label="showPassword ? 'Құпия сөзді жасыру' : 'Құпия сөзді көрсету'"
        @click="showPassword = !showPassword"
      >
        <i class="fa-solid" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
      </button>
    </div>
    <p v-if="error" class="app-input__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.app-input {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.app-input__field {
  position: relative;
  display: flex;
  align-items: center;
}

input {
  width: 100%;
  font-family: var(--font-body);
  font-size: var(--fs-body);
  background: var(--color-input-bg);
  border: 1px solid transparent;
  border-radius: var(--radius-control);
  padding: 0.7rem 0.9rem;
  color: var(--color-text);
}

input:focus {
  outline: none;
  border-color: var(--color-primary-dark);
}

input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.app-input__toggle {
  position: absolute;
  right: 0.8rem;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: 15px;
  cursor: pointer;
  padding: 0.2rem 0.3rem;
  display: flex;
  align-items: center;
}

.app-input__error {
  color: var(--color-accent-red);
  font-size: var(--fs-label);
  margin: 0;
}
</style>
