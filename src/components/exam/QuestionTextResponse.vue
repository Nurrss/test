<script setup>
import { computed } from 'vue'

const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: String,
    default: '',
  },
})

defineEmits(['update:modelValue'])

const isLongForm = computed(() => props.question.question_type === 'open_text')
</script>

<template>
  <div class="text-question">
    <img v-if="question.content.image_url" :src="question.content.image_url" class="text-question__image" />
    <p class="text-question__text">{{ question.content.text }}</p>

    <textarea
      v-if="isLongForm"
      class="text-question__textarea"
      :value="modelValue"
      :placeholder="question.content.placeholder || 'Жауабыңызды осында жазыңыз...'"
      @input="$emit('update:modelValue', $event.target.value)"
    ></textarea>
    <input
      v-else
      class="text-question__input"
      type="text"
      :value="modelValue"
      :placeholder="question.content.placeholder || 'Жауап'"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>

<style scoped>
.text-question {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.text-question__image {
  max-width: 100%;
  border-radius: var(--radius-control);
}

.text-question__text {
  font-size: 16px;
  font-weight: 600;
}

.text-question__textarea {
  width: 100%;
  min-height: 220px;
  resize: vertical;
  font-family: var(--font-body);
  font-size: var(--fs-body);
  background: var(--color-input-bg);
  border: 1px solid transparent;
  border-radius: var(--radius-control);
  padding: 0.9rem;
}

.text-question__input {
  width: 100%;
  font-family: var(--font-body);
  font-size: var(--fs-body);
  background: var(--color-input-bg);
  border: 1px solid transparent;
  border-radius: var(--radius-control);
  padding: 0.75rem 0.9rem;
}

.text-question__textarea:focus,
.text-question__input:focus {
  outline: none;
  border-color: var(--color-primary-dark);
}
</style>
