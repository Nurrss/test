<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import ExamProgressSidebar from '../components/exam/ExamProgressSidebar.vue'
import QuestionMultipleChoice from '../components/exam/QuestionMultipleChoice.vue'
import QuestionTextResponse from '../components/exam/QuestionTextResponse.vue'
import QuestionAudioResponse from '../components/exam/QuestionAudioResponse.vue'
import TabWarningModal from '../components/exam/TabWarningModal.vue'
import AppButton from '../components/shared/AppButton.vue'
import AppCard from '../components/shared/AppCard.vue'

// TODO: вопросы/варианты грузятся из questions по exam_assignments.variant_id,
// ответы пишутся в student_answers через Edge Function submit-answer,
// антилив-события — в tab_events с реальным attempt_id (сейчас его ещё нет,
// т.к. exam_attempts не создаётся на этом этапе).
const variantName = 'A2 — Нұсқа 1'

const sectionsData = [
  {
    key: 'listening',
    label: 'Listening',
    points: 20,
    timeLimitSec: 900,
    questions: [
      {
        id: 'l1',
        question_type: 'multiple_choice',
        media_url: null,
        content: {
          text: 'Listen to the audio and choose the correct answer: Where does the conversation take place?',
          options: [
            { id: 'a', label: 'At the airport' },
            { id: 'b', label: 'At the restaurant' },
            { id: 'c', label: 'At the hotel' },
          ],
        },
      },
      {
        id: 'l2',
        question_type: 'true_false',
        media_url: null,
        content: {
          text: 'Тыңдаңыз және сөйлемнің суретке сәйкес келетінін белгілеңіз.',
          statement: 'They are near the lake.',
          image_decor_zone: 'exam-listening-photo',
          options: [
            { id: 'true', label: 'Дұрыс' },
            { id: 'false', label: 'Бұрыс' },
          ],
        },
      },
    ],
  },
  {
    key: 'reading',
    label: 'Reading',
    points: 20,
    timeLimitSec: 1200,
    questions: [
      {
        id: 'r1',
        question_type: 'multiple_choice',
        content: {
          text: 'Read the text and choose the best title.',
          options: [
            { id: 'a', label: 'A Trip to the Mountains' },
            { id: 'b', label: 'How to Cook Pilaf' },
            { id: 'c', label: 'Learning a New Language' },
          ],
        },
      },
    ],
  },
  {
    key: 'writing',
    label: 'Writing',
    points: 20,
    timeLimitSec: 900,
    questions: [
      {
        id: 'w1',
        question_type: 'open_text',
        content: {
          text: 'Write a short paragraph (80–100 words) about your favorite season and why you like it.',
          placeholder: 'My favorite season is...',
        },
      },
    ],
  },
  {
    key: 'speaking',
    label: 'Speaking',
    points: 20,
    timeLimitSec: 420,
    questions: [
      {
        id: 'sp1',
        question_type: 'audio_response',
        content: {
          text: 'Describe your city. Speak for about one minute.',
        },
      },
    ],
  },
]

const currentSectionIndex = ref(0)
const currentQuestionIndex = ref(0)
const answers = ref({})
const remainingSeconds = ref(sectionsData[0].timeLimitSec)
const examSubmitted = ref(false)
const showTabWarning = ref(false)

let timerHandle = null
let hasLeftTab = false

const currentSection = computed(() => sectionsData[currentSectionIndex.value])
const currentQuestion = computed(() => currentSection.value.questions[currentQuestionIndex.value])
const isLastQuestionInSection = computed(
  () => currentQuestionIndex.value === currentSection.value.questions.length - 1
)
const isLastSection = computed(() => currentSectionIndex.value === sectionsData.length - 1)

const progressSections = computed(() =>
  sectionsData.map((section, index) => ({
    key: section.key,
    label: section.label,
    points: section.points,
    status:
      index < currentSectionIndex.value
        ? 'done'
        : index === currentSectionIndex.value
          ? 'active'
          : 'upcoming',
  }))
)

const formattedTimer = computed(() => {
  const m = Math.floor(remainingSeconds.value / 60).toString().padStart(2, '0')
  const s = Math.floor(remainingSeconds.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

function questionComponent(question) {
  if (question.question_type === 'audio_response') return QuestionAudioResponse
  if (['short_answer', 'open_text'].includes(question.question_type)) return QuestionTextResponse
  return QuestionMultipleChoice
}

function startSectionTimer() {
  clearInterval(timerHandle)
  remainingSeconds.value = currentSection.value.timeLimitSec
  timerHandle = setInterval(() => {
    remainingSeconds.value -= 1
    if (remainingSeconds.value <= 0) {
      clearInterval(timerHandle)
      goToNextSection()
    }
  }, 1000)
}

function goToNextSection() {
  if (isLastSection.value) {
    finishExam()
    return
  }
  currentSectionIndex.value += 1
  currentQuestionIndex.value = 0
  startSectionTimer()
}

function handleNext() {
  if (!isLastQuestionInSection.value) {
    currentQuestionIndex.value += 1
    return
  }
  goToNextSection()
}

function handlePrev() {
  if (currentQuestionIndex.value > 0) currentQuestionIndex.value -= 1
}

function finishExam() {
  clearInterval(timerHandle)
  examSubmitted.value = true
}

function setAnswer(value) {
  answers.value[currentQuestion.value.id] = value
}

// --- antileave: перенесено из прототипа (visibilitychange + window blur/focus) ---
function logTabEvent(eventType) {
  console.log('[tab-event]', eventType, new Date().toISOString(), '(attempt_id TODO)')
}

function handleVisibilityChange() {
  if (document.hidden) {
    hasLeftTab = true
    logTabEvent('tab_switch')
  } else if (hasLeftTab) {
    hasLeftTab = false
    showTabWarning.value = true
  }
}

function handleWindowBlur() {
  if (!document.hidden) {
    hasLeftTab = true
    logTabEvent('window_blur')
  }
}

function handleWindowFocus() {
  if (hasLeftTab) {
    hasLeftTab = false
    showTabWarning.value = true
  }
}

onMounted(() => {
  startSectionTimer()
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('blur', handleWindowBlur)
  window.addEventListener('focus', handleWindowFocus)
})

onBeforeUnmount(() => {
  clearInterval(timerHandle)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('blur', handleWindowBlur)
  window.removeEventListener('focus', handleWindowFocus)
})
</script>

<template>
  <div class="exam-taking">
    <template v-if="!examSubmitted">
      <AppCard class="exam-taking__progress-card">
        <ExamProgressSidebar :sections="progressSections" />
      </AppCard>

      <div class="exam-taking__content">
        <div class="exam-taking__header">
          <div>
            <h2>{{ currentSection.label }} — Part {{ currentQuestionIndex + 1 }}</h2>
          </div>
          <span class="exam-taking__variant">{{ variantName }}</span>
        </div>

        <div class="exam-taking__meta">
          <div class="exam-taking__section-progress">
            <span>{{ currentQuestionIndex + 1 }}/{{ currentSection.questions.length }}</span>
            <div class="exam-taking__bar">
              <div
                class="exam-taking__bar-fill"
                :style="{ width: `${((currentQuestionIndex + 1) / currentSection.questions.length) * 100}%` }"
              ></div>
            </div>
          </div>
          <span class="exam-taking__timer">{{ formattedTimer }}</span>
        </div>

        <component
          :is="questionComponent(currentQuestion)"
          :question="currentQuestion"
          :model-value="answers[currentQuestion.id]"
          @update:modelValue="setAnswer"
          @update:answer="setAnswer"
        />

        <div class="exam-taking__nav">
          <AppButton variant="secondary" :disabled="currentQuestionIndex === 0" @click="handlePrev">
            Алдыңғы
          </AppButton>
          <AppButton @click="handleNext">
            {{ isLastQuestionInSection && isLastSection ? 'Аяқтау' : 'Келесі' }}
          </AppButton>
        </div>
      </div>
    </template>

    <div v-else class="exam-taking__submitted">
      <h1>Жіберілді</h1>
      <p>Емтихан жауаптарыңыз қабылданды. Нәтижелер мұғалім тексергеннен кейін жарияланады.</p>
    </div>

    <TabWarningModal :visible="showTabWarning" @close="showTabWarning = false" />
  </div>
</template>

<style scoped>
.exam-taking {
  display: flex;
  gap: 2rem;
  padding: 2rem;
  min-height: 100vh;
  background: var(--color-bg);
}

.exam-taking__progress-card {
  flex-shrink: 0;
  align-self: flex-start;
}

.exam-taking__content {
  flex: 1;
  background: var(--color-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 1.75rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 760px;
}

.exam-taking__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.exam-taking__variant {
  color: var(--color-text-secondary);
  font-size: var(--fs-label);
  font-weight: 700;
}

.exam-taking__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.exam-taking__section-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  font-size: var(--fs-label);
  color: var(--color-text-secondary);
}

.exam-taking__bar {
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: var(--color-border);
  overflow: hidden;
}

.exam-taking__bar-fill {
  height: 100%;
  background: var(--color-accent-blue);
}

.exam-taking__timer {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  font-size: 18px;
  color: var(--color-primary-dark);
}

.exam-taking__nav {
  display: flex;
  justify-content: space-between;
  margin-top: auto;
}

.exam-taking__submitted {
  margin: auto;
  text-align: center;
  max-width: 420px;
}

.exam-taking__submitted p {
  margin-top: 0.75rem;
  color: var(--color-text-secondary);
}

@media (max-width: 1023px) {
  .exam-taking {
    flex-direction: column;
    padding: 1rem;
  }

  .exam-taking__content {
    max-width: 100%;
  }

  .exam-taking__progress-card {
    width: 100%;
  }
}
</style>
