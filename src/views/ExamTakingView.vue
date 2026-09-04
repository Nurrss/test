<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import ExamProgressSidebar from '../components/exam/ExamProgressSidebar.vue'
import QuestionMultipleChoice from '../components/exam/QuestionMultipleChoice.vue'
import QuestionTextResponse from '../components/exam/QuestionTextResponse.vue'
import QuestionAudioResponse from '../components/exam/QuestionAudioResponse.vue'
import TabWarningModal from '../components/exam/TabWarningModal.vue'
import AppButton from '../components/shared/AppButton.vue'
import AppCard from '../components/shared/AppCard.vue'
import AudioPlayer from '../components/shared/AudioPlayer.vue'

const router = useRouter()

const SECTION_ORDER = ['listening', 'reading', 'writing', 'speaking']
const SECTION_LABELS = { listening: 'Listening', reading: 'Reading', writing: 'Writing', speaking: 'Speaking' }

const loading = ref(true)
const loadError = ref('')
const noAssignment = ref(false)
const alreadySubmitted = ref(false)

const variantName = ref('')
const sectionsData = ref([])
const attempt = ref(null)

const currentSectionIndex = ref(0)
const currentQuestionIndex = ref(0)
const answers = ref({})
const remainingSeconds = ref(0)
const examSubmitted = ref(false)
const showTabWarning = ref(false)
const isNavigating = ref(false)

let timerHandle = null
let hasLeftTab = false

const currentSection = computed(() => sectionsData.value[currentSectionIndex.value])
const currentQuestion = computed(() => currentSection.value?.questions[currentQuestionIndex.value])
const isLastQuestionInSection = computed(
  () => currentSection.value && currentQuestionIndex.value === currentSection.value.questions.length - 1
)
const isLastSection = computed(() => currentSectionIndex.value === sectionsData.value.length - 1)

const progressSections = computed(() =>
  sectionsData.value.map((section, index) => ({
    key: section.key,
    label: section.label,
    points: section.points,
    status: index < currentSectionIndex.value ? 'done' : index === currentSectionIndex.value ? 'active' : 'upcoming',
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

// ------- загрузка/создание попытки -------
// resolve_attempt() — атомарный RPC (SECURITY DEFINER): находит назначение,
// резюмирует активную попытку, начинает разрешённую пересдачу или создаёт
// первую попытку. Заменяет прежнюю последовательность из отдельных select+insert.
async function loadExam() {
  loading.value = true
  loadError.value = ''
  noAssignment.value = false
  alreadySubmitted.value = false

  const { data: resolved, error: resolveError } = await supabase.rpc('resolve_attempt')

  if (resolveError) {
    if (resolveError.message === 'NO_ASSIGNMENT') {
      noAssignment.value = true
    } else if (resolveError.message === 'ALREADY_SUBMITTED') {
      alreadySubmitted.value = true
    } else {
      loadError.value = 'Талпынысты бастау мүмкін болмады: ' + resolveError.message
    }
    loading.value = false
    return
  }

  attempt.value = resolved

  const [{ data: variant, error: variantError }, { data: questions, error: questionsError }] = await Promise.all([
    supabase.from('exam_variants').select('*').eq('id', resolved.variant_id).single(),
    supabase
      .from('questions')
      .select('*')
      .eq('variant_id', resolved.variant_id)
      .order('section')
      .order('order_index'),
  ])

  if (variantError || questionsError) {
    loadError.value = 'Емтихан деректерін жүктеу мүмкін болмады: ' + (variantError || questionsError).message
    loading.value = false
    return
  }

  variantName.value = variant.name
  const timeLimitBySection = {
    listening: variant.listening_time_limit_sec,
    reading: variant.reading_time_limit_sec,
    writing: variant.writing_time_limit_sec,
    speaking: variant.speaking_time_limit_sec,
  }

  sectionsData.value = SECTION_ORDER.filter((key) => (questions || []).some((q) => q.section === key)).map(
    (key) => {
      const sectionQuestions = questions.filter((q) => q.section === key)
      return {
        key,
        label: SECTION_LABELS[key],
        points: sectionQuestions.reduce((sum, q) => sum + Number(q.max_points), 0),
        timeLimitSec: timeLimitBySection[key],
        questions: sectionQuestions.map((q) => ({
          id: q.id,
          question_type: q.question_type,
          media_url: q.media_url,
          content: q.content,
          max_points: q.max_points,
        })),
      }
    }
  )

  const resumeIndex = sectionsData.value.findIndex((s) => s.key === resolved.current_section)
  currentSectionIndex.value = resumeIndex >= 0 ? resumeIndex : 0

  const { data: previousAnswers } = await supabase
    .from('student_answers')
    .select('question_id, answer')
    .eq('attempt_id', resolved.id)

  for (const row of previousAnswers || []) {
    if (row.answer !== null) answers.value[row.question_id] = row.answer
  }

  // Секцияны әрдайым 1-сұрақтан бастамай, оқушы қалдырған жерден
  // жалғастырамыз — бұл, атап айтқанда, Listening-те беттi жаңарту
  // арқылы бұрын өткен аудионы қайта тыңдауды болдырмайды (Алдыңғы
  // батырмасы өшірулі болса да, жаңарту currentQuestionIndex-ті 0-ге
  // қайтарып жіберер еді, ал сервер current_question_index сақтамайды).
  const resumedSection = sectionsData.value[currentSectionIndex.value]
  const firstUnanswered = resumedSection
    ? resumedSection.questions.findIndex((q) => answers.value[q.id] === undefined)
    : -1
  currentQuestionIndex.value =
    firstUnanswered >= 0 ? firstUnanswered : Math.max((resumedSection?.questions.length || 1) - 1, 0)

  loading.value = false
  startSectionTimer()
}

// ------- таймер -------
function startSectionTimer() {
  clearInterval(timerHandle)
  if (!currentSection.value) return
  remainingSeconds.value = currentSection.value.timeLimitSec
  timerHandle = setInterval(() => {
    remainingSeconds.value -= 1
    if (remainingSeconds.value <= 0) {
      clearInterval(timerHandle)
      handleSectionTimeout()
    }
  }, 1000)
}

// Уақыт таусылғанда — келесі секцияға өтпес бұрын ағымдағы жауапты сақтау
// міндетті, әйтпесе соңғы жауап (соның ішінде соңғы секциядан кейінгі
// finishExam-ға дейінгі жауап та) үнсіз жоғалады.
async function handleSectionTimeout() {
  await saveCurrentAnswer()
  await goToNextSection()
}

// ------- сохранение ответа -------
// Возвращает false при реальной ошибке сохранения — вызывающий код должен
// остановить переход к следующему вопросу/разделу, иначе ответ теряется молча.
async function saveCurrentAnswer() {
  const question = currentQuestion.value
  if (!question || !attempt.value) return true
  const value = answers.value[question.id]
  if (value === undefined) return true

  try {
    if (question.question_type === 'audio_response') {
      if (!value?.audioBlob) return true
      const path = `${attempt.value.id}/${question.id}.webm`
      const { error: uploadError } = await supabase.storage
        .from('speaking-recordings')
        .upload(path, value.audioBlob, { contentType: value.audioBlob.type || 'audio/webm', upsert: true })
      if (uploadError) throw uploadError

      const { error: rpcError } = await supabase.rpc('submit_answer', {
        p_attempt_id: attempt.value.id,
        p_question_id: question.id,
        p_answer: null,
        p_audio_path: path,
      })
      if (rpcError) throw rpcError
    } else {
      const { error: rpcError } = await supabase.rpc('submit_answer', {
        p_attempt_id: attempt.value.id,
        p_question_id: question.id,
        p_answer: value,
        p_audio_path: null,
      })
      if (rpcError) throw rpcError
    }
    loadError.value = ''
    return true
  } catch (err) {
    loadError.value = 'Жауапты сақтау мүмкін болмады: ' + (err?.message || err)
    return false
  }
}

// Секция индексі мен таймер тек сервер current_section-ды растағаннан кейін
// ғана жылжиды — әйтпесе жаңарту сәтсіз болса, клиент пен сервер күйі
// алшақтап кетеді (студент "келесі" секцияда жауап беріп жатады, ал
// resolve_attempt() қайта жүктегенде оны ескі секцияға қайтарады).
async function goToNextSection() {
  if (isLastSection.value) {
    await finishExam()
    return
  }
  const nextIndex = currentSectionIndex.value + 1
  const nextKey = sectionsData.value[nextIndex].key

  const { error } = await supabase
    .from('exam_attempts')
    .update({ current_section: nextKey })
    .eq('id', attempt.value.id)

  if (error) {
    loadError.value = 'Секцияны сақтау мүмкін болмады, интернет байланысын тексеріңіз: ' + error.message
    return
  }

  currentSectionIndex.value = nextIndex
  currentQuestionIndex.value = 0
  startSectionTimer()
}

// isNavigating қорғанысы қос басу/тез қайталанған шақыруларды блоктайды —
// әйтпесе екі қатар жүрген handleNext currentQuestionIndex-ті екі рет
// жылжытып, жауап берілмеген сұрақты үнсіз өткізіп жібереді.
async function handleNext() {
  if (isNavigating.value) return
  isNavigating.value = true
  try {
    const saved = await saveCurrentAnswer()
    if (!saved) return
    if (!isLastQuestionInSection.value) {
      currentQuestionIndex.value += 1
      return
    }
    await goToNextSection()
  } finally {
    isNavigating.value = false
  }
}

// Тыңдау бөлімінде алдыңғы сұраққа оралуға болмайды — солай болса, аудио
// (media_url бойынша key өзгеріп) қайта жүктеліп, оқушы оны шексіз қайта
// тыңдай алар еді. Батырма жасырылған, бірақ функцияны да қорғаймыз.
async function handlePrev() {
  if (isNavigating.value || currentSection.value?.key === 'listening') return
  isNavigating.value = true
  try {
    const saved = await saveCurrentAnswer()
    if (!saved) return
    if (currentQuestionIndex.value > 0) currentQuestionIndex.value -= 1
  } finally {
    isNavigating.value = false
  }
}

async function finishExam() {
  clearInterval(timerHandle)
  const { error } = await supabase.rpc('finalize_attempt', { p_attempt_id: attempt.value.id })
  if (error) {
    loadError.value = 'Емтиханды аяқтау мүмкін болмады: ' + error.message
    return
  }
  examSubmitted.value = true
}

function setAnswer(value) {
  answers.value[currentQuestion.value.id] = value
}

function goHome() {
  router.push({ name: 'student-home' })
}

// --- antileave: visibilitychange + window blur/focus, лог в tab_events ---
async function logTabEvent(eventType) {
  console.log('[tab-event]', eventType, new Date().toISOString())
  if (!attempt.value) return
  const { error } = await supabase.from('tab_events').insert({ attempt_id: attempt.value.id, event_type: eventType })
  if (error) console.error('[tab-event] insert failed', error)
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
  loadExam()
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
    <p v-if="loading" class="exam-taking__status">Жүктелуде...</p>

    <div v-else-if="noAssignment" class="exam-taking__submitted">
      <h1>Емтихан тағайындалмаған</h1>
      <p>Сізге әлі емтихан нұсқасы тағайындалмаған. Мұғаліммен байланысыңыз.</p>
      <AppButton class="exam-taking__home-btn" variant="secondary" @click="goHome">Басты бетке оралу</AppButton>
    </div>

    <div v-else-if="alreadySubmitted" class="exam-taking__submitted">
      <h1>Сіз бұл емтиханды тапсырдыңыз</h1>
      <p>Нәтижелер мұғалім тексергеннен кейін жарияланады.</p>
      <AppButton class="exam-taking__home-btn" variant="secondary" @click="goHome">Басты бетке оралу</AppButton>
    </div>

    <template v-else-if="!examSubmitted">
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

        <p v-if="loadError" class="exam-taking__error">{{ loadError }}</p>
        <p v-if="currentSection.key === 'listening'" class="exam-taking__listening-note">
          <i class="fa-solid fa-circle-info"></i> Тыңдау бөлімінде алдыңғы сұраққа оралу мүмкін емес — аудио бір рет
          беріледі.
        </p>

        <!-- key = media_url (not question id) — тыңдау бөлімінің бірнеше сұрағы
             бір аудионы бөлісе алады (мыс. matching-типті 5 сұрақ бір диалогке),
             сол жағдайда навигация кезінде плеер қайта құрылмай, ойнату күйі
             (уақыты, паузасы) сақталады. Әр түрлі аудио болса — key өзгеріп,
             плеер дұрыс қайта жүктеледі.
             locked — Listening секциясында ғана: аудио бір рет автоматты
             ойнайды, тоқтата/айналдыра алмайды — нақты емтихандағыдай. -->
        <AudioPlayer
          v-if="currentQuestion.media_url"
          :key="currentQuestion.media_url"
          :src="currentQuestion.media_url"
          :locked="currentSection.key === 'listening'"
        />

        <component
          :is="questionComponent(currentQuestion)"
          :key="currentQuestion.id"
          :question="currentQuestion"
          :model-value="answers[currentQuestion.id]"
          @update:modelValue="setAnswer"
          @update:answer="setAnswer"
        />

        <div class="exam-taking__nav">
          <AppButton
            v-if="currentSection.key !== 'listening'"
            variant="secondary"
            :disabled="currentQuestionIndex === 0 || isNavigating"
            @click="handlePrev"
          >
            Алдыңғы
          </AppButton>
          <span v-else class="exam-taking__nav-spacer"></span>
          <AppButton :disabled="isNavigating" @click="handleNext">
            {{ isLastQuestionInSection && isLastSection ? 'Аяқтау' : 'Келесі' }}
          </AppButton>
        </div>
      </div>
    </template>

    <div v-else class="exam-taking__submitted">
      <h1>Жіберілді</h1>
      <p>Емтихан жауаптарыңыз қабылданды. Нәтижелер мұғалім тексергеннен кейін жарияланады.</p>
      <AppButton class="exam-taking__home-btn" variant="secondary" @click="goHome">Басты бетке оралу</AppButton>
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

.exam-taking__status {
  margin: auto;
  color: var(--color-text-secondary);
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

.exam-taking__error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 0.65rem 0.9rem;
  border-radius: var(--radius-control);
  font-size: var(--fs-label);
}

.exam-taking__listening-note {
  color: var(--color-text-secondary);
  font-size: var(--fs-label);
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.exam-taking__home-btn {
  margin-top: 1.5rem;
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
