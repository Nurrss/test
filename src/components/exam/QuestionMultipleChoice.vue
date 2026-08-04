<script setup>
import AudioPlayer from '../shared/AudioPlayer.vue'
import DecorZone from '../shared/DecorZone.vue'

defineProps({
  question: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: String,
    default: null,
  },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="mc-question">
    <p class="mc-question__text">{{ question.content.text }}</p>
    <AudioPlayer v-if="question.media_url" :src="question.media_url" />

    <div v-if="question.question_type === 'true_false'" class="mc-question__tf-row">
      <DecorZone
        v-if="question.content.image_decor_zone"
        :zone="question.content.image_decor_zone"
        class="mc-question__image"
        min-height="180px"
      />
      <img v-else-if="question.content.image_url" :src="question.content.image_url" class="mc-question__image" />
      <div class="mc-question__tf-panel">
        <p v-if="question.content.statement" class="mc-question__statement">
          {{ question.content.statement }}
        </p>
        <div class="mc-question__tf-options">
          <button
            v-for="option in question.content.options"
            :key="option.id"
            class="mc-question__tf-btn"
            :class="[
              option.id === 'true' ? 'mc-question__tf-btn--true' : 'mc-question__tf-btn--false',
              { 'mc-question__tf-btn--selected': modelValue === option.id },
            ]"
            @click="$emit('update:modelValue', option.id)"
          >
            <i class="fa-solid" :class="option.id === 'true' ? 'fa-check' : 'fa-xmark'"></i> {{ option.label }}
          </button>
        </div>
      </div>
    </div>

    <template v-else>
      <DecorZone
        v-if="question.content.image_decor_zone"
        :zone="question.content.image_decor_zone"
        class="mc-question__image"
        min-height="180px"
      />
      <img v-else-if="question.content.image_url" :src="question.content.image_url" class="mc-question__image" />
      <div class="mc-question__options">
        <button
          v-for="option in question.content.options"
          :key="option.id"
          class="mc-question__option"
          :class="{ 'mc-question__option--selected': modelValue === option.id }"
          @click="$emit('update:modelValue', option.id)"
        >
          {{ option.label }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.mc-question {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.mc-question__image {
  max-width: 100%;
  border-radius: var(--radius-control);
}

.mc-question__text {
  font-size: 16px;
  font-weight: 600;
}

.mc-question__options {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.mc-question__option {
  text-align: left;
  padding: 0.8rem 1rem;
  border-radius: var(--radius-control);
  border: 1.5px solid var(--color-border);
  background: var(--color-card);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: var(--fs-body);
}

.mc-question__option:hover {
  border-color: var(--color-primary-dark);
}

.mc-question__option--selected {
  border-color: var(--color-primary-dark);
  background: rgba(31, 78, 74, 0.08);
  font-weight: 700;
}

.mc-question__tf-row {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.mc-question__tf-row .mc-question__image {
  flex: 1;
  min-width: 220px;
  max-width: 320px;
}

.mc-question__tf-panel {
  flex: 1;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mc-question__statement {
  font-size: 16px;
  font-weight: 600;
}

.mc-question__tf-options {
  display: flex;
  gap: 0.75rem;
}

.mc-question__tf-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  border-radius: 999px;
  border: 2px solid transparent;
  font-family: var(--font-body);
  font-weight: 700;
  font-size: var(--fs-body);
  cursor: pointer;
}

.mc-question__tf-btn--true {
  background: rgba(95, 160, 90, 0.15);
  color: var(--color-accent-green);
}

.mc-question__tf-btn--false {
  background: rgba(217, 119, 107, 0.15);
  color: var(--color-accent-red);
}

.mc-question__tf-btn--selected.mc-question__tf-btn--true {
  border-color: var(--color-accent-green);
}

.mc-question__tf-btn--selected.mc-question__tf-btn--false {
  border-color: var(--color-accent-red);
}
</style>
