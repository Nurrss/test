<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '../shared/AppButton.vue'
import VariantFormModal from './VariantFormModal.vue'

const props = defineProps({
  variants: {
    type: Array,
    required: true, // [{ id, name, level, is_active, question_count }]
  },
})

const router = useRouter()
const levels = computed(() => ['Барлығы', ...new Set(props.variants.map((v) => v.level))])
const selectedLevel = ref('Барлығы')
const showCreate = ref(false)

const filteredVariants = computed(() => {
  if (selectedLevel.value === 'Барлығы') return props.variants
  return props.variants.filter((v) => v.level === selectedLevel.value)
})

function openVariant(variant) {
  router.push({ name: 'variant-editor', params: { id: variant.id } })
}

function handleCreated(id) {
  router.push({ name: 'variant-editor', params: { id } })
}
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
      <li
        v-for="variant in filteredVariants"
        :key="variant.id"
        class="variants-panel__item"
        @click="openVariant(variant)"
      >
        <div>
          <strong>{{ variant.name }}</strong>
          <span class="variants-panel__count">{{ variant.question_count }} сұрақ</span>
          <span v-if="!variant.is_active" class="variants-panel__draft">Жоба</span>
        </div>
        <span class="variants-panel__level">{{ variant.level }}</span>
      </li>
      <li v-if="!filteredVariants.length" class="variants-panel__empty">Нұсқалар жоқ</li>
    </ul>

    <AppButton variant="primary" full-width @click="showCreate = true">+ Жаңа нұсқа қосу</AppButton>

    <VariantFormModal :visible="showCreate" :variant="null" @close="showCreate = false" @saved="handleCreated" />
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
  cursor: pointer;
}

.variants-panel__item:hover {
  background: var(--color-border);
}

.variants-panel__count {
  margin-left: 0.6rem;
  color: var(--color-text-secondary);
  font-size: var(--fs-label);
}

.variants-panel__draft {
  margin-left: 0.6rem;
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 700;
  background: var(--color-card);
  border-radius: 999px;
  padding: 0.1rem 0.5rem;
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
