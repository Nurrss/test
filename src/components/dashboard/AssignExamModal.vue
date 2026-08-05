<script setup>
import { ref, watch } from 'vue'
import { supabase } from '../../lib/supabase'
import AppButton from '../shared/AppButton.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  student: { type: Object, default: null }, // { id, full_name }
})

const emit = defineEmits(['close', 'assigned'])

const variants = ref([])
const selectedVariantId = ref('')
const loading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')

async function loadVariants() {
  loading.value = true
  errorMessage.value = ''
  const { data, error } = await supabase
    .from('exam_variants')
    .select('id, name, level')
    .eq('is_active', true)
    .order('name')

  if (error) {
    errorMessage.value = 'Нұсқаларды жүктеу мүмкін болмады: ' + error.message
  } else {
    variants.value = data || []
    selectedVariantId.value = variants.value[0]?.id || ''
  }
  loading.value = false
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) loadVariants()
  }
)

function handleClose() {
  errorMessage.value = ''
  emit('close')
}

async function handleSubmit() {
  if (!selectedVariantId.value || !props.student) return
  errorMessage.value = ''
  isSaving.value = true

  const { error } = await supabase.from('exam_assignments').insert({
    student_id: props.student.id,
    variant_id: selectedVariantId.value,
  })

  isSaving.value = false

  if (error) {
    errorMessage.value =
      error.code === '23505'
        ? 'Бұл нұсқа оқушыға бұрын тағайындалған'
        : 'Тағайындау мүмкін болмады: ' + error.message
    return
  }

  emit('assigned')
  emit('close')
}
</script>

<template>
  <div v-if="visible" class="assign-exam-backdrop" @click.self="handleClose">
    <div class="assign-exam-box">
      <h3>Емтихан тағайындау</h3>
      <p class="assign-exam-student">{{ student?.full_name }}</p>

      <form class="assign-exam-form" @submit.prevent="handleSubmit">
        <label class="assign-exam-label">Емтихан нұсқасы</label>
        <p v-if="loading" class="assign-exam-loading">Жүктелуде...</p>
        <select v-else v-model="selectedVariantId" class="assign-exam-select">
          <option v-for="variant in variants" :key="variant.id" :value="variant.id">
            {{ variant.name }} ({{ variant.level }})
          </option>
        </select>
        <p v-if="!loading && !variants.length" class="assign-exam-empty">Белсенді нұсқалар жоқ</p>

        <p v-if="errorMessage" class="assign-exam-error">{{ errorMessage }}</p>

        <div class="assign-exam-actions">
          <AppButton variant="secondary" type="button" @click="handleClose">Бас тарту</AppButton>
          <AppButton type="submit" :disabled="isSaving || !selectedVariantId">
            {{ isSaving ? 'Тағайындалуда...' : 'Тағайындау' }}
          </AppButton>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.assign-exam-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  padding: 1rem;
}

.assign-exam-box {
  background: var(--color-card);
  border-radius: var(--radius-card);
  padding: 1.75rem;
  width: 100%;
  max-width: 420px;
  box-shadow: var(--shadow-card);
}

.assign-exam-box h3 {
  margin-bottom: 0.3rem;
}

.assign-exam-student {
  color: var(--color-text-secondary);
  font-size: var(--fs-label);
  margin-bottom: 1.25rem;
}

.assign-exam-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.assign-exam-label {
  font-size: var(--fs-label);
  font-weight: 700;
}

.assign-exam-select {
  font-family: var(--font-body);
  font-size: var(--fs-body);
  border-radius: var(--radius-control);
  border: none;
  background: var(--color-input-bg);
  padding: 0.7rem 0.9rem;
  width: 100%;
}

.assign-exam-loading,
.assign-exam-empty {
  color: var(--color-text-secondary);
  font-size: var(--fs-label);
}

.assign-exam-error {
  font-size: 12px;
  color: var(--color-accent-red);
  line-height: 1.5;
}

.assign-exam-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 0.9rem;
}
</style>
