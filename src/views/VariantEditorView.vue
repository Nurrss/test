<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import AppCard from '../components/shared/AppCard.vue'
import AppButton from '../components/shared/AppButton.vue'
import VariantFormModal from '../components/dashboard/VariantFormModal.vue'
import QuestionEditorModal from '../components/exam-editor/QuestionEditorModal.vue'

const route = useRoute()
const router = useRouter()

const SECTION_ORDER = ['listening', 'reading', 'writing', 'speaking']
const SECTION_LABELS = { listening: 'Listening', reading: 'Reading', writing: 'Writing', speaking: 'Speaking' }
const TYPE_LABELS = {
  multiple_choice: 'Көп таңдау',
  true_false: 'Дұрыс/бұрыс',
  matching: 'Сәйкестендіру',
  short_answer: 'Қысқа жауап',
  open_text: 'Еркін мәтін',
  audio_response: 'Дауыстық жауап',
}

const loading = ref(true)
const errorMessage = ref('')
const variant = ref(null)
const questions = ref([])
const activeSection = ref('listening')
const showEditVariant = ref(false)
const editingQuestion = ref(null)
const showQuestionEditor = ref(false)

const variantId = computed(() => route.params.id)

async function loadVariant() {
  const { data, error } = await supabase.from('exam_variants').select('*').eq('id', variantId.value).single()
  if (error) {
    errorMessage.value = 'Нұсқа табылмады: ' + error.message
    return false
  }
  variant.value = data
  return true
}

async function loadQuestions() {
  const { data, error } = await supabase
    .from('questions')
    .select('*, question_answers(correct_answer)')
    .eq('variant_id', variantId.value)
    .order('section')
    .order('order_index')

  if (error) {
    errorMessage.value = 'Сұрақтарды жүктеу мүмкін болмады: ' + error.message
    return
  }

  questions.value = (data || []).map((q) => {
    const answer = Array.isArray(q.question_answers) ? q.question_answers[0] : q.question_answers
    return { ...q, correct_answer: answer?.correct_answer ?? null }
  })
}

async function loadAll() {
  loading.value = true
  errorMessage.value = ''
  const ok = await loadVariant()
  if (ok) await loadQuestions()
  loading.value = false
}

onMounted(loadAll)

const sections = computed(() =>
  SECTION_ORDER.map((key) => {
    const sectionQuestions = questions.value.filter((q) => q.section === key)
    return {
      key,
      label: SECTION_LABELS[key],
      questions: sectionQuestions,
      points: sectionQuestions.reduce((sum, q) => sum + Number(q.max_points || 0), 0),
    }
  })
)

const currentSectionQuestions = computed(
  () => sections.value.find((s) => s.key === activeSection.value)?.questions || []
)

// length + 1 would collide with an existing order_index after a mid-list
// delete (e.g. order_index 1,2,4 left after deleting #3 — length+1 = 3,
// which already exists). max(order_index) + 1 never collides.
const nextOrderIndex = computed(() =>
  currentSectionQuestions.value.reduce((max, q) => Math.max(max, q.order_index || 0), 0) + 1
)

function openCreateQuestion() {
  editingQuestion.value = null
  showQuestionEditor.value = true
}

function openEditQuestion(question) {
  editingQuestion.value = question
  showQuestionEditor.value = true
}

async function moveQuestion(question, direction) {
  const list = currentSectionQuestions.value
  const index = list.findIndex((q) => q.id === question.id)
  const swapWith = list[index + direction]
  if (!swapWith) return

  await Promise.all([
    supabase.from('questions').update({ order_index: swapWith.order_index }).eq('id', question.id),
    supabase.from('questions').update({ order_index: question.order_index }).eq('id', swapWith.id),
  ])
  await loadQuestions()
}

async function deleteQuestion(question) {
  if (!window.confirm('Бұл сұрақты жойғыңыз келе ме? Бұл әрекетті болдырмауға болмайды.')) return
  const { error } = await supabase.from('questions').delete().eq('id', question.id)
  if (error) {
    errorMessage.value = 'Жою мүмкін болмады: ' + error.message
    return
  }
  await loadQuestions()
}
</script>

<template>
  <div class="variant-editor">
    <button class="variant-editor__back" @click="router.push({ name: 'dashboard' })">← Артқа</button>

    <p v-if="errorMessage" class="variant-editor__error">{{ errorMessage }}</p>
    <p v-if="loading" class="variant-editor__loading">Жүктелуде...</p>

    <template v-else-if="variant">
      <div class="variant-editor__head">
        <div>
          <h1>{{ variant.name }}</h1>
          <div class="variant-editor__meta">
            <span class="variant-editor__level">{{ variant.level }}</span>
            <span :class="['variant-editor__status', variant.is_active ? '' : 'variant-editor__status--draft']">
              {{ variant.is_active ? 'Белсенді' : 'Жоба' }}
            </span>
          </div>
        </div>
        <AppButton variant="secondary" @click="showEditVariant = true">Өңдеу</AppButton>
      </div>

      <div class="variant-editor__tabs">
        <button
          v-for="section in sections"
          :key="section.key"
          class="variant-editor__tab"
          :class="{ 'variant-editor__tab--active': activeSection === section.key }"
          @click="activeSection = section.key"
        >
          {{ section.label }}
          <span class="variant-editor__tab-count">{{ section.questions.length }} · {{ section.points }} ұпай</span>
        </button>
      </div>

      <AppCard>
        <div class="variant-editor__section-head">
          <h2>{{ SECTION_LABELS[activeSection] }}</h2>
          <AppButton @click="openCreateQuestion">+ Сұрақ қосу</AppButton>
        </div>

        <ul class="variant-editor__list">
          <li v-for="(question, index) in currentSectionQuestions" :key="question.id" class="variant-editor__item">
            <div class="variant-editor__item-main">
              <span class="variant-editor__item-type">{{ TYPE_LABELS[question.question_type] }}</span>
              <p class="variant-editor__item-text">{{ question.content?.text }}</p>
              <span class="variant-editor__item-points">{{ question.max_points }} ұпай</span>
            </div>
            <div class="variant-editor__item-actions">
              <button :disabled="index === 0" @click="moveQuestion(question, -1)">▲</button>
              <button :disabled="index === currentSectionQuestions.length - 1" @click="moveQuestion(question, 1)">
                ▼
              </button>
              <button @click="openEditQuestion(question)">Өңдеу</button>
              <button class="variant-editor__item-delete" @click="deleteQuestion(question)">Жою</button>
            </div>
          </li>
          <li v-if="!currentSectionQuestions.length" class="variant-editor__empty">
            Бұл бөлімде әлі сұрақ жоқ
          </li>
        </ul>
      </AppCard>
    </template>

    <VariantFormModal :visible="showEditVariant" :variant="variant" @close="showEditVariant = false" @saved="loadVariant" />

    <QuestionEditorModal
      :visible="showQuestionEditor"
      :variant-id="variantId"
      :section="activeSection"
      :next-order-index="nextOrderIndex"
      :question="editingQuestion"
      @close="showQuestionEditor = false"
      @saved="loadQuestions"
    />
  </div>
</template>

<style scoped>
.variant-editor {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.variant-editor__back {
  align-self: flex-start;
  background: none;
  border: none;
  color: var(--color-primary-dark);
  font-weight: 700;
  cursor: pointer;
  font-size: var(--fs-label);
  padding: 0;
}

.variant-editor__error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 0.65rem 0.9rem;
  border-radius: var(--radius-control);
  font-size: var(--fs-label);
}

.variant-editor__loading {
  color: var(--color-text-secondary);
}

.variant-editor__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.variant-editor__meta {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.3rem;
}

.variant-editor__level {
  font-size: var(--fs-label);
  font-weight: 700;
  color: var(--color-primary-dark);
}

.variant-editor__status {
  font-size: var(--fs-label);
  color: var(--color-accent-green);
  font-weight: 700;
}

.variant-editor__status--draft {
  color: var(--color-text-secondary);
}

.variant-editor__tabs {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.variant-editor__tab {
  font-family: var(--font-body);
  font-size: var(--fs-body);
  font-weight: 700;
  background: var(--color-input-bg);
  border: none;
  border-radius: var(--radius-control);
  padding: 0.6rem 1rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.15rem;
}

.variant-editor__tab--active {
  background: var(--color-primary-dark);
  color: #fff;
}

.variant-editor__tab-count {
  font-size: 11px;
  font-weight: 500;
  opacity: 0.8;
}

.variant-editor__section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.variant-editor__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.variant-editor__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 0.9rem;
  border-radius: var(--radius-control);
  background: var(--color-input-bg);
  flex-wrap: wrap;
}

.variant-editor__item-main {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 220px;
}

.variant-editor__item-type {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-primary-dark);
  background: var(--color-card);
  border-radius: 999px;
  padding: 0.2rem 0.6rem;
  white-space: nowrap;
}

.variant-editor__item-text {
  flex: 1;
  font-size: var(--fs-body);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.variant-editor__item-points {
  font-size: var(--fs-label);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.variant-editor__item-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.variant-editor__item-actions button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--fs-label);
  font-weight: 700;
  color: var(--color-primary-dark);
  padding: 0.2rem 0.35rem;
}

.variant-editor__item-actions button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.variant-editor__item-delete {
  color: var(--color-accent-red) !important;
}

.variant-editor__empty {
  text-align: center;
  color: var(--color-text-secondary);
  padding: 1.5rem 0;
}
</style>
