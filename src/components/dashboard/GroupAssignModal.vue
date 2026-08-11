<script setup>
import { ref, computed, watch } from 'vue'
import { supabase } from '../../lib/supabase'
import AppButton from '../shared/AppButton.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  groupName: { type: String, default: '' },
  students: { type: Array, default: () => [] }, // [{ id, full_name }]
})

const emit = defineEmits(['close', 'assigned'])

const variants = ref([])
const mode = ref('distribute') // 'distribute' = spread across all variants of a level, 'single' = one variant for everyone
const selectedVariantId = ref('')
const selectedLevel = ref('')
const loading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')
const resultMessage = ref('')

const levels = computed(() => [...new Set(variants.value.map((v) => v.level))])
const levelVariants = computed(() => variants.value.filter((v) => v.level === selectedLevel.value))

async function loadVariants() {
  loading.value = true
  errorMessage.value = ''
  resultMessage.value = ''
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
    selectedLevel.value = variants.value[0]?.level || ''
  }
  loading.value = false
}

watch(
  () => props.visible,
  (visible) => {
    if (!visible) return
    mode.value = 'distribute'
    loadVariants()
  }
)

function handleClose() {
  errorMessage.value = ''
  resultMessage.value = ''
  emit('close')
}

function shuffled(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

async function handleSubmit() {
  errorMessage.value = ''
  resultMessage.value = ''

  if (!props.students.length) return

  let rows = []
  if (mode.value === 'single') {
    if (!selectedVariantId.value) return
    rows = props.students.map((s) => ({ student_id: s.id, variant_id: selectedVariantId.value }))
  } else {
    if (!levelVariants.value.length) {
      errorMessage.value = 'Бұл деңгейде белсенді нұсқа жоқ'
      return
    }
    // Shuffle students first so the variant a student lands on doesn't
    // just track alphabetical/list order — round-robin over the level's
    // variants after that spreads them as evenly as possible.
    const pool = levelVariants.value
    rows = shuffled(props.students).map((s, i) => ({
      student_id: s.id,
      variant_id: pool[i % pool.length].id,
    }))
  }

  isSaving.value = true
  const { data, error } = await supabase
    .from('exam_assignments')
    .upsert(rows, { onConflict: 'student_id,variant_id', ignoreDuplicates: true })
    .select('id, variant_id')

  isSaving.value = false

  if (error) {
    errorMessage.value = 'Тағайындау мүмкін болмады: ' + error.message
    return
  }

  const assignedCount = data?.length ?? 0
  const skippedCount = props.students.length - assignedCount

  let breakdown = ''
  if (mode.value === 'distribute' && assignedCount) {
    const nameById = new Map(variants.value.map((v) => [v.id, v.name]))
    const counts = new Map()
    for (const row of data) {
      const name = nameById.get(row.variant_id) || row.variant_id
      counts.set(name, (counts.get(name) || 0) + 1)
    }
    breakdown = ' (' + Array.from(counts.entries()).map(([name, n]) => `${name}: ${n}`).join(', ') + ')'
  }

  resultMessage.value =
    `${assignedCount} оқушыға тағайындалды` +
    (skippedCount > 0 ? `, ${skippedCount} оқушыда бұрыннан бар` : '') +
    breakdown

  emit('assigned')
}
</script>

<template>
  <div v-if="visible" class="group-assign-backdrop" @click.self="handleClose">
    <div class="group-assign-box">
      <h3>Топқа тағайындау</h3>
      <p class="group-assign-group">{{ groupName }} — {{ students.length }} оқушы</p>

      <form class="group-assign-form" @submit.prevent="handleSubmit">
        <div class="group-assign-mode">
          <label>
            <input type="radio" value="distribute" v-model="mode" />
            Деңгей бойынша таратып беру (әр оқушыға басқа нұсқа)
          </label>
          <label>
            <input type="radio" value="single" v-model="mode" />
            Барлығына бір нұсқа
          </label>
        </div>

        <p v-if="loading" class="group-assign-loading">Жүктелуде...</p>

        <template v-else-if="mode === 'distribute'">
          <label class="group-assign-label">Деңгей</label>
          <select v-model="selectedLevel" class="group-assign-select">
            <option v-for="level in levels" :key="level" :value="level">{{ level }}</option>
          </select>
          <p v-if="selectedLevel" class="group-assign-hint">
            Бұл деңгейде {{ levelVariants.length }} белсенді нұсқа бар — оқушылар арасында кезекпен таратылады.
          </p>
          <p v-if="!levels.length" class="group-assign-empty">Белсенді нұсқалар жоқ</p>
        </template>

        <template v-else>
          <label class="group-assign-label">Емтихан нұсқасы</label>
          <select v-model="selectedVariantId" class="group-assign-select">
            <option v-for="variant in variants" :key="variant.id" :value="variant.id">
              {{ variant.name }} ({{ variant.level }})
            </option>
          </select>
          <p v-if="!variants.length" class="group-assign-empty">Белсенді нұсқалар жоқ</p>
        </template>

        <p v-if="errorMessage" class="group-assign-error">{{ errorMessage }}</p>
        <p v-if="resultMessage" class="group-assign-result">{{ resultMessage }}</p>

        <div class="group-assign-actions">
          <AppButton variant="secondary" type="button" @click="handleClose">Жабу</AppButton>
          <AppButton
            type="submit"
            :disabled="
              isSaving ||
              !students.length ||
              (mode === 'single' ? !selectedVariantId : !levelVariants.length)
            "
          >
            {{ isSaving ? 'Тағайындалуда...' : 'Тағайындау' }}
          </AppButton>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.group-assign-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  padding: 1rem;
}

.group-assign-box {
  background: var(--color-card);
  border-radius: var(--radius-card);
  padding: 1.75rem;
  width: 100%;
  max-width: 440px;
  box-shadow: var(--shadow-card);
}

.group-assign-box h3 {
  margin-bottom: 0.3rem;
}

.group-assign-group {
  color: var(--color-text-secondary);
  font-size: var(--fs-label);
  margin-bottom: 1.25rem;
}

.group-assign-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.group-assign-mode {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: var(--fs-label);
  margin-bottom: 0.5rem;
}

.group-assign-mode label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.group-assign-label {
  font-size: var(--fs-label);
  font-weight: 700;
}

.group-assign-select {
  font-family: var(--font-body);
  font-size: var(--fs-body);
  border-radius: var(--radius-control);
  border: none;
  background: var(--color-input-bg);
  padding: 0.7rem 0.9rem;
  width: 100%;
}

.group-assign-loading,
.group-assign-empty,
.group-assign-hint {
  color: var(--color-text-secondary);
  font-size: var(--fs-label);
}

.group-assign-error {
  font-size: 12px;
  color: var(--color-accent-red);
  line-height: 1.5;
}

.group-assign-result {
  font-size: 12px;
  color: var(--color-accent-green);
  line-height: 1.5;
}

.group-assign-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 0.9rem;
}
</style>
