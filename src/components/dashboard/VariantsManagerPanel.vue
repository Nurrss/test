<script setup>
import { ref, computed } from 'vue'
import AppButton from '../shared/AppButton.vue'

const props = defineProps({
  variants: {
    type: Array,
    required: true, // [{ id, name, level, question_count }]
  },
})

const levels = computed(() => ['Барлығы', ...new Set(props.variants.map((v) => v.level))])
const selectedLevel = ref('Барлығы')

const filteredVariants = computed(() => {
  if (selectedLevel.value === 'Барлығы') return props.variants
  return props.variants.filter((v) => v.level === selectedLevel.value)
})
</script>

<template>
  <div class="variants-panel">
    <h2>Емтихан нұсқаларын басқару</h2>

    <div class="variants-panel__filter">
      <label>Деңгей таңдаңыз</label>
      <select v-model="selectedLevel" class="variants-panel__select">
        <option v-for="level in levels" :key="level" :value="level">{{ level }}</option>
      </select>
    </div>

    <ul class="variants-panel__list">
      <li v-for="variant in filteredVariants" :key="variant.id" class="variants-panel__item">
        <div>
          <strong>{{ variant.name }}</strong>
          <span class="variants-panel__count">{{ variant.question_count }} сұрақ</span>
        </div>
        <span class="variants-panel__level">{{ variant.level }}</span>
      </li>
      <li v-if="!filteredVariants.length" class="variants-panel__empty">Нұсқалар жоқ</li>
    </ul>

    <AppButton variant="primary" full-width>+ Жаңа нұсқа қосу</AppButton>
  </div>
</template>

<style scoped>
.variants-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.variants-panel__filter {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.variants-panel__select {
  font-family: var(--font-body);
  font-size: var(--fs-body);
  border-radius: var(--radius-control);
  border: none;
  background: var(--color-input-bg);
  padding: 0.6rem 0.8rem;
}

.variants-panel__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.variants-panel__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 0.85rem;
  border-radius: var(--radius-control);
  background: var(--color-input-bg);
  font-size: var(--fs-body);
}

.variants-panel__count {
  margin-left: 0.6rem;
  color: var(--color-text-secondary);
  font-size: var(--fs-label);
}

.variants-panel__level {
  font-size: var(--fs-label);
  color: var(--color-primary-dark);
  font-weight: 700;
}

.variants-panel__empty {
  text-align: center;
  color: var(--color-text-secondary);
  padding: 1rem 0;
}
</style>
