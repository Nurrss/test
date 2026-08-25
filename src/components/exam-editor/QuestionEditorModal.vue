<script setup>
import { ref, computed, watch } from 'vue'
import { supabase } from '../../lib/supabase'
import AppInput from '../shared/AppInput.vue'
import AppButton from '../shared/AppButton.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  variantId: { type: String, required: true },
  section: { type: String, required: true }, // listening | reading | writing | speaking
  nextOrderIndex: { type: Number, default: 1 },
  question: { type: Object, default: null }, // null = create; includes correct_answer when editing
})

const emit = defineEmits(['close', 'saved'])

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Көп таңдау (multiple choice)' },
  { value: 'true_false', label: 'Дұрыс/бұрыс (true/false)' },
  { value: 'matching', label: 'Сәйкестендіру (matching)' },
  { value: 'short_answer', label: 'Қысқа жауап' },
  { value: 'open_text', label: 'Еркін мәтін (writing)' },
  { value: 'audio_response', label: 'Дауыстық жауап (speaking)' },
]

const OPTION_TYPES = ['multiple_choice', 'true_false', 'matching']
const OPTION_LETTERS = 'abcdefgh'.split('')

const id = ref('')
const questionType = ref('multiple_choice')
const text = ref('')
const statement = ref('')
const placeholder = ref('')
const options = ref([])
const correctOptionId = ref('')
const shortAnswerMode = ref('manual') // 'manual' | 'auto'
const shortAnswerCorrect = ref('')
const maxPoints = ref(10)
const imageUrl = ref('')
const mediaUrl = ref('')
const imageUploading = ref(false)
const audioUploading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')

const isOptionType = computed(() => OPTION_TYPES.includes(questionType.value))
const isManualType = computed(() => ['open_text', 'audio_response'].includes(questionType.value))

function applyTypeDefaults(type, opts = {}) {
  if (type === 'true_false') {
    options.value = [
      { id: 'true', label: 'Дұрыс' },
      { id: 'false', label: 'Бұрыс' },
    ]
    correctOptionId.value = opts.correctOptionId || 'true'
  } else if (OPTION_TYPES.includes(type)) {
    options.value = opts.options?.length
      ? opts.options.map((o) => ({ ...o }))
      : [
          { id: 'a', label: '' },
          { id: 'b', label: '' },
          { id: 'c', label: '' },
        ]
    correctOptionId.value = opts.correctOptionId || ''
  } else {
    options.value = []
    correctOptionId.value = ''
  }

  if (type === 'short_answer') {
    shortAnswerMode.value = opts.shortAnswerMode || 'manual'
    shortAnswerCorrect.value = opts.shortAnswerCorrect || ''
  } else {
    shortAnswerMode.value = 'manual'
    shortAnswerCorrect.value = ''
  }
}

function handleTypeChange(event) {
  questionType.value = event.target.value
  applyTypeDefaults(questionType.value)
}

function addOption() {
  const usedIds = new Set(options.value.map((o) => o.id))
  const nextLetter = OPTION_LETTERS.find((l) => !usedIds.has(l)) || `opt${options.value.length + 1}`
  options.value.push({ id: nextLetter, label: '' })
}

function removeOption(index) {
  const removed = options.value[index]
  options.value.splice(index, 1)
  if (correctOptionId.value === removed.id) correctOptionId.value = ''
}

watch(
  () => props.visible,
  (visible) => {
    if (!visible) return
    errorMessage.value = ''

    if (props.question) {
      const q = props.question
      id.value = q.id
      questionType.value = q.question_type
      text.value = q.content?.text || ''
      statement.value = q.content?.statement || ''
      placeholder.value = q.content?.placeholder || ''
      imageUrl.value = q.content?.image_url || ''
      mediaUrl.value = q.media_url || ''
      maxPoints.value = q.max_points
      applyTypeDefaults(q.question_type, {
        options: q.content?.options,
        correctOptionId: !q.requires_manual_grading ? q.correct_answer : '',
        shortAnswerMode: q.requires_manual_grading ? 'manual' : 'auto',
        shortAnswerCorrect: !q.requires_manual_grading ? q.correct_answer : '',
      })
    } else {
      id.value = crypto.randomUUID()
      questionType.value = 'multiple_choice'
      text.value = ''
      statement.value = ''
      placeholder.value = ''
      imageUrl.value = ''
      mediaUrl.value = ''
      maxPoints.value = 10
      applyTypeDefaults('multiple_choice')
    }
  }
)

async function handleImageChange(event) {
  const file = event.target.files[0]
  event.target.value = ''
  if (!file) return

  imageUploading.value = true
  errorMessage.value = ''
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'jpg'
  const path = `${props.variantId}/${id.value}.${ext}`

  const { error } = await supabase.storage
    .from('question-images')
    .upload(path, file, { contentType: file.type || 'image/jpeg', upsert: true })

  imageUploading.value = false
  if (error) {
    errorMessage.value = 'Сурет жүктелмеді: ' + error.message
    return
  }

  const { data } = supabase.storage.from('question-images').getPublicUrl(path)
  imageUrl.value = data.publicUrl
}

async function handleAudioChange(event) {
  const file = event.target.files[0]
  event.target.value = ''
  if (!file) return

  audioUploading.value = true
  errorMessage.value = ''
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'mp3'
  const path = `${props.variantId}/${id.value}.${ext}`

  const { error } = await supabase.storage
    .from('listening-audio')
    .upload(path, file, { contentType: file.type || 'audio/mpeg', upsert: true })

  audioUploading.value = false
  if (error) {
    errorMessage.value = 'Аудио жүктелмеді: ' + error.message
    return
  }

  const { data } = supabase.storage.from('listening-audio').getPublicUrl(path)
  mediaUrl.value = data.publicUrl
}

function handleClose() {
  errorMessage.value = ''
  emit('close')
}

async function handleSubmit() {
  errorMessage.value = ''

  if (!text.value.trim()) {
    errorMessage.value = 'Сұрақ мәтіні міндетті'
    return
  }
  if (isOptionType.value) {
    if (options.value.length < 2 || options.value.some((o) => !o.label.trim())) {
      errorMessage.value = 'Кемінде 2 нұсқа болу керек, барлығының мәтінін толтырыңыз'
      return
    }
    if (!correctOptionId.value) {
      errorMessage.value = 'Дұрыс жауапты таңдаңыз'
      return
    }
  }
  if (questionType.value === 'short_answer' && shortAnswerMode.value === 'auto' && !shortAnswerCorrect.value.trim()) {
    errorMessage.value = 'Дұрыс жауапты жазыңыз немесе қолмен тексеруге ауыстырыңыз'
    return
  }
  // AppInput is a custom component, so v-model.number doesn't auto-cast —
  // maxPoints is a string once the teacher edits it, cast explicitly.
  const maxPointsValue = Number(maxPoints.value)
  if (!Number.isFinite(maxPointsValue) || maxPointsValue <= 0) {
    errorMessage.value = 'Ұпай саны оң сан болу керек'
    return
  }

  isSaving.value = true

  const content = { text: text.value.trim() }
  if (questionType.value === 'true_false' && statement.value.trim()) content.statement = statement.value.trim()
  // Preserve any extra option fields (e.g. image_url on picture-matching
  // options, set only by the import pipeline) instead of rebuilding each
  // option from scratch — this editor has no UI to re-set them.
  if (isOptionType.value) content.options = options.value.map((o) => ({ ...o, label: o.label.trim() }))
  if (['short_answer', 'open_text'].includes(questionType.value) && placeholder.value.trim()) {
    content.placeholder = placeholder.value.trim()
  }
  if (imageUrl.value) content.image_url = imageUrl.value

  const requiresManualGrading =
    isManualType.value || (questionType.value === 'short_answer' && shortAnswerMode.value === 'manual')

  const { error: questionError } = await supabase.from('questions').upsert({
    id: id.value,
    variant_id: props.variantId,
    section: props.section,
    order_index: props.question?.order_index ?? props.nextOrderIndex,
    question_type: questionType.value,
    content,
    media_url: mediaUrl.value || null,
    max_points: maxPointsValue,
    requires_manual_grading: requiresManualGrading,
  })

  if (questionError) {
    isSaving.value = false
    errorMessage.value = 'Сақтау мүмкін болмады: ' + questionError.message
    return
  }

  if (requiresManualGrading) {
    await supabase.from('question_answers').delete().eq('question_id', id.value)
  } else {
    const correctAnswer = isOptionType.value ? correctOptionId.value : shortAnswerCorrect.value.trim()
    const { error: answerError } = await supabase
      .from('question_answers')
      .upsert({ question_id: id.value, correct_answer: correctAnswer })

    if (answerError) {
      isSaving.value = false
      errorMessage.value = 'Дұрыс жауапты сақтау мүмкін болмады: ' + answerError.message
      return
    }
  }

  isSaving.value = false
  emit('saved')
  emit('close')
}
</script>

<template>
  <div v-if="visible" class="qe-backdrop" @click.self="handleClose">
    <div class="qe-box">
      <h3>{{ question ? 'Сұрақты өңдеу' : 'Жаңа сұрақ' }}</h3>

      <form class="qe-form" @submit.prevent="handleSubmit">
        <div>
          <label class="qe-label">Сұрақ түрі</label>
          <select :value="questionType" class="qe-select" @change="handleTypeChange">
            <option v-for="t in QUESTION_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
        </div>

        <AppInput v-model="text" label="Сұрақ мәтіні" placeholder="Тыңдаңыз/оқыңыз және жауап беріңіз..." />

        <AppInput
          v-if="questionType === 'true_false'"
          v-model="statement"
          label="Тұжырым (statement)"
          placeholder="They are near the lake."
        />

        <div v-if="isOptionType" class="qe-options">
          <label class="qe-label">Жауап нұсқалары — дұрысын таңдаңыз</label>
          <div v-for="(option, index) in options" :key="option.id" class="qe-option-row">
            <input
              type="radio"
              :name="'correct-' + id"
              :value="option.id"
              v-model="correctOptionId"
              class="qe-option-radio"
            />
            <span class="qe-option-id">{{ option.id }}</span>
            <input v-model="option.label" type="text" class="qe-option-input" placeholder="Жауап мәтіні" />
            <button
              v-if="questionType !== 'true_false'"
              type="button"
              class="qe-option-remove"
              @click="removeOption(index)"
            >
              ×
            </button>
          </div>
          <AppButton v-if="questionType !== 'true_false'" variant="outline" type="button" @click="addOption">
            + Нұсқа қосу
          </AppButton>
        </div>

        <div v-if="['short_answer', 'open_text'].includes(questionType)">
          <AppInput v-model="placeholder" label="Placeholder (міндетті емес)" placeholder="Жауабыңызды осында..." />
        </div>

        <div v-if="questionType === 'short_answer'" class="qe-short-mode">
          <label class="qe-label">Тексеру түрі</label>
          <div class="qe-radio-row">
            <label><input type="radio" value="manual" v-model="shortAnswerMode" /> Қолмен (мұғалім)</label>
            <label><input type="radio" value="auto" v-model="shortAnswerMode" /> Автоматты (нақты сәйкестік)</label>
          </div>
          <AppInput
            v-if="shortAnswerMode === 'auto'"
            v-model="shortAnswerCorrect"
            label="Дұрыс жауап (әріптеп сәйкес болу керек)"
            placeholder="paris"
          />
        </div>

        <AppInput v-model="maxPoints" type="number" label="Ұпай саны" />

        <div class="qe-media">
          <label class="qe-label">Сурет (міндетті емес)</label>
          <input type="file" accept="image/*" :disabled="imageUploading" @change="handleImageChange" />
          <p v-if="imageUploading" class="qe-media-status">Жүктелуде...</p>
          <img v-if="imageUrl" :src="imageUrl" class="qe-media-preview" />
          <button v-if="imageUrl" type="button" class="qe-media-clear" @click="imageUrl = ''">Суретті өшіру</button>
        </div>

        <div v-if="section === 'listening'" class="qe-media">
          <label class="qe-label">Аудио (mp3, міндетті емес)</label>
          <input type="file" accept="audio/*" :disabled="audioUploading" @change="handleAudioChange" />
          <p v-if="audioUploading" class="qe-media-status">Жүктелуде...</p>
          <audio v-if="mediaUrl" :src="mediaUrl" controls class="qe-media-audio"></audio>
          <button v-if="mediaUrl" type="button" class="qe-media-clear" @click="mediaUrl = ''">Аудионы өшіру</button>
        </div>

        <p v-if="errorMessage" class="qe-error">{{ errorMessage }}</p>

        <div class="qe-actions">
          <AppButton variant="secondary" type="button" @click="handleClose">Бас тарту</AppButton>
          <AppButton type="submit" :disabled="isSaving || imageUploading || audioUploading">
            {{ isSaving ? 'Сақталуда...' : 'Сақтау' }}
          </AppButton>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.qe-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  padding: 1rem;
}

.qe-box {
  background: var(--color-card);
  border-radius: var(--radius-card);
  padding: 1.75rem;
  width: 100%;
  max-width: 560px;
  box-shadow: var(--shadow-card);
  max-height: 90vh;
  overflow-y: auto;
}

.qe-box h3 {
  margin-bottom: 1.25rem;
}

.qe-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.qe-label {
  font-size: var(--fs-label);
  font-weight: 700;
  display: block;
  margin-bottom: 0.4rem;
}

.qe-select {
  font-family: var(--font-body);
  font-size: var(--fs-body);
  border-radius: var(--radius-control);
  border: none;
  background: var(--color-input-bg);
  padding: 0.7rem 0.9rem;
  width: 100%;
}

.qe-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.qe-option-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.qe-option-id {
  font-size: var(--fs-label);
  font-weight: 700;
  color: var(--color-text-secondary);
  width: 1.2rem;
  text-transform: uppercase;
}

.qe-option-input {
  flex: 1;
  font-family: var(--font-body);
  font-size: var(--fs-body);
  border-radius: var(--radius-control);
  border: none;
  background: var(--color-input-bg);
  padding: 0.6rem 0.8rem;
}

.qe-option-remove {
  background: none;
  border: none;
  color: var(--color-accent-red);
  font-size: 18px;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  line-height: 1;
}

.qe-short-mode {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.qe-radio-row {
  display: flex;
  gap: 1.25rem;
  font-size: var(--fs-label);
}

.qe-radio-row label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.qe-media {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.qe-media-status {
  font-size: var(--fs-label);
  color: var(--color-text-secondary);
}

.qe-media-preview {
  max-width: 100%;
  max-height: 160px;
  border-radius: var(--radius-control);
  object-fit: cover;
}

.qe-media-audio {
  width: 100%;
}

.qe-media-clear {
  align-self: flex-start;
  background: none;
  border: none;
  color: var(--color-accent-red);
  font-size: var(--fs-label);
  cursor: pointer;
  padding: 0;
}

.qe-error {
  font-size: 12px;
  color: var(--color-accent-red);
  line-height: 1.5;
}

.qe-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 0.5rem;
}
</style>
