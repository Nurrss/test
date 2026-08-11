<script setup>
import { ref, watch } from 'vue'
import { supabase } from '../../lib/supabase'
import AppInput from '../shared/AppInput.vue'
import AppButton from '../shared/AppButton.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  variant: { type: Object, default: null }, // null = create, object = edit
})

const emit = defineEmits(['close', 'saved'])

const LEVELS = ['Pre-A1', 'A1', 'A2', 'Above A2']

const id = ref('')
const name = ref('')
const level = ref(LEVELS[2])
const listeningTimeLimitSec = ref(900)
const readingTimeLimitSec = ref(1200)
const writingTimeLimitSec = ref(900)
const speakingTimeLimitSec = ref(420)
const isActive = ref(true)
const isSaving = ref(false)
const errorMessage = ref('')

function resetForm() {
  id.value = crypto.randomUUID()
  name.value = ''
  level.value = LEVELS[2]
  listeningTimeLimitSec.value = 900
  readingTimeLimitSec.value = 1200
  writingTimeLimitSec.value = 900
  speakingTimeLimitSec.value = 420
  isActive.value = true
  errorMessage.value = ''
}

watch(
  () => props.visible,
  (visible) => {
    if (!visible) return
    errorMessage.value = ''
    if (props.variant) {
      id.value = props.variant.id
      name.value = props.variant.name
      level.value = props.variant.level
      listeningTimeLimitSec.value = props.variant.listening_time_limit_sec
      readingTimeLimitSec.value = props.variant.reading_time_limit_sec
      writingTimeLimitSec.value = props.variant.writing_time_limit_sec
      speakingTimeLimitSec.value = props.variant.speaking_time_limit_sec
      isActive.value = props.variant.is_active
    } else {
      resetForm()
    }
  }
)

function handleClose() {
  errorMessage.value = ''
  emit('close')
}

async function handleSubmit() {
  errorMessage.value = ''

  if (!name.value.trim()) {
    errorMessage.value = 'Нұсқа атауы міндетті'
    return
  }

  // AppInput is a custom component, so v-model.number's auto-cast doesn't
  // apply (Vue only casts for native <input> or components that declare
  // modelModifiers) — these refs hold strings once the teacher edits them,
  // so cast explicitly here rather than trusting the modifier.
  const times = {
    listening_time_limit_sec: Number(listeningTimeLimitSec.value),
    reading_time_limit_sec: Number(readingTimeLimitSec.value),
    writing_time_limit_sec: Number(writingTimeLimitSec.value),
    speaking_time_limit_sec: Number(speakingTimeLimitSec.value),
  }
  if (Object.values(times).some((n) => !Number.isFinite(n) || n <= 0)) {
    errorMessage.value = 'Уақыт лимиттері оң сан болу керек'
    return
  }

  isSaving.value = true
  const { error } = await supabase.from('exam_variants').upsert({
    id: id.value,
    name: name.value.trim(),
    level: level.value,
    ...times,
    is_active: isActive.value,
  })
  isSaving.value = false

  if (error) {
    errorMessage.value = 'Сақтау мүмкін болмады: ' + error.message
    return
  }

  emit('saved', id.value)
  emit('close')
}
</script>

<template>
  <div v-if="visible" class="variant-form-backdrop" @click.self="handleClose">
    <div class="variant-form-box">
      <h3>{{ variant ? 'Нұсқаны өңдеу' : 'Жаңа нұсқа' }}</h3>

      <form class="variant-form-form" @submit.prevent="handleSubmit">
        <AppInput v-model="name" label="Атауы" placeholder="A2 — Нұсқа 1" />

        <label class="variant-form-label">Деңгей</label>
        <select v-model="level" class="variant-form-select">
          <option v-for="l in LEVELS" :key="l" :value="l">{{ l }}</option>
        </select>

        <div class="variant-form-times">
          <AppInput v-model="listeningTimeLimitSec" type="number" label="Listening (сек)" />
          <AppInput v-model="readingTimeLimitSec" type="number" label="Reading (сек)" />
          <AppInput v-model="writingTimeLimitSec" type="number" label="Writing (сек)" />
          <AppInput v-model="speakingTimeLimitSec" type="number" label="Speaking (сек)" />
        </div>

        <label class="variant-form-checkbox">
          <input v-model="isActive" type="checkbox" />
          Белсенді (оқушыларға тағайындауға болады)
        </label>

        <p v-if="errorMessage" class="variant-form-error">{{ errorMessage }}</p>

        <div class="variant-form-actions">
          <AppButton variant="secondary" type="button" @click="handleClose">Бас тарту</AppButton>
          <AppButton type="submit" :disabled="isSaving">
            {{ isSaving ? 'Сақталуда...' : 'Сақтау' }}
          </AppButton>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.variant-form-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  padding: 1rem;
}

.variant-form-box {
  background: var(--color-card);
  border-radius: var(--radius-card);
  padding: 1.75rem;
  width: 100%;
  max-width: 480px;
  box-shadow: var(--shadow-card);
  max-height: 90vh;
  overflow-y: auto;
}

.variant-form-box h3 {
  margin-bottom: 1.25rem;
}

.variant-form-form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.variant-form-label {
  font-size: var(--fs-label);
  font-weight: 700;
}

.variant-form-select {
  font-family: var(--font-body);
  font-size: var(--fs-body);
  border-radius: var(--radius-control);
  border: none;
  background: var(--color-input-bg);
  padding: 0.7rem 0.9rem;
  width: 100%;
  margin-top: -0.4rem;
}

.variant-form-times {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.7rem;
}

.variant-form-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--fs-label);
  color: var(--color-text-secondary);
}

.variant-form-error {
  font-size: 12px;
  color: var(--color-accent-red);
  line-height: 1.5;
}

.variant-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 0.5rem;
}
</style>
