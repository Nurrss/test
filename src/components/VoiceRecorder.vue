<script setup>
import { ref, onBeforeUnmount, computed } from 'vue'
import { supabase, isSupabaseConfigured, RECORDINGS_BUCKET } from '../lib/supabase'

const emit = defineEmits(['saved'])

const isRecording = ref(false)
const isSaving = ref(false)
const elapsedSeconds = ref(0)
const previewUrl = ref(null)
const errorMessage = ref('')
const statusMessage = ref('')

let mediaRecorder = null
let mediaStream = null
let chunks = []
let timerHandle = null
let startedAt = 0
let recordedBlob = null

const formattedTimer = computed(() => {
  const m = Math.floor(elapsedSeconds.value / 60)
    .toString()
    .padStart(2, '0')
  const s = Math.floor(elapsedSeconds.value % 60)
    .toString()
    .padStart(2, '0')
  return `${m}:${s}`
})

function pickMimeType() {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
  return candidates.find((type) => MediaRecorder.isTypeSupported?.(type)) || ''
}

async function startRecording() {
  errorMessage.value = ''
  statusMessage.value = ''
  discardPreview()

  if (!navigator.mediaDevices?.getUserMedia) {
    errorMessage.value = 'Браузер не поддерживает запись аудио (getUserMedia недоступен).'
    return
  }

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
  } catch (err) {
    errorMessage.value = 'Нет доступа к микрофону: ' + (err?.message || err)
    return
  }

  const mimeType = pickMimeType()
  chunks = []

  try {
    mediaRecorder = mimeType ? new MediaRecorder(mediaStream, { mimeType }) : new MediaRecorder(mediaStream)
  } catch (err) {
    errorMessage.value = 'Не удалось запустить MediaRecorder: ' + (err?.message || err)
    stopStream()
    return
  }

  mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) chunks.push(event.data)
  }

  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' })
    recordedBlob = blob
    previewUrl.value = URL.createObjectURL(blob)
    stopStream()
  }

  mediaRecorder.start()
  isRecording.value = true
  elapsedSeconds.value = 0
  startedAt = Date.now()
  timerHandle = setInterval(() => {
    elapsedSeconds.value = (Date.now() - startedAt) / 1000
  }, 200)
}

function stopRecording() {
  if (!mediaRecorder || mediaRecorder.state === 'inactive') return
  mediaRecorder.stop()
  isRecording.value = false
  clearInterval(timerHandle)
  timerHandle = null
}

function stopStream() {
  mediaStream?.getTracks().forEach((track) => track.stop())
  mediaStream = null
}

function discardPreview() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = null
  recordedBlob = null
  elapsedSeconds.value = 0
}

async function saveRecording() {
  if (!recordedBlob) return
  if (!isSupabaseConfigured) {
    errorMessage.value = 'Supabase не настроен: заполните .env (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).'
    return
  }

  isSaving.value = true
  errorMessage.value = ''
  statusMessage.value = 'Загрузка файла в хранилище...'

  const durationSeconds = Math.round(elapsedSeconds.value)
  const extension = recordedBlob.type.includes('mp4') ? 'mp4' : 'webm'
  const fileName = `${crypto.randomUUID()}.${extension}`
  const filePath = fileName

  try {
    const { error: uploadError } = await supabase.storage
      .from(RECORDINGS_BUCKET)
      .upload(filePath, recordedBlob, {
        contentType: recordedBlob.type || 'audio/webm',
        upsert: false,
      })

    if (uploadError) throw uploadError

    statusMessage.value = 'Файл загружен, сохраняем запись в базу...'

    const { data: publicUrlData } = supabase.storage.from(RECORDINGS_BUCKET).getPublicUrl(filePath)
    const fileUrl = publicUrlData?.publicUrl || null

    const { data: inserted, error: insertError } = await supabase
      .from('recordings')
      .insert({
        file_path: filePath,
        file_url: fileUrl,
        duration_seconds: durationSeconds,
      })
      .select()
      .single()

    if (insertError) throw insertError

    statusMessage.value = 'Запись сохранена.'
    emit('saved', inserted)
    discardPreview()
  } catch (err) {
    errorMessage.value = 'Ошибка при сохранении: ' + (err?.message || err)
    statusMessage.value = ''
  } finally {
    isSaving.value = false
  }
}

function cancelPreview() {
  discardPreview()
  statusMessage.value = ''
  errorMessage.value = ''
}

onBeforeUnmount(() => {
  clearInterval(timerHandle)
  stopStream()
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})
</script>

<template>
  <section>
    <h2>Запись голоса</h2>

    <p v-if="!isSupabaseConfigured" class="hint-box">
      Supabase не настроен. Запись и прослушивание будут работать локально, но сохранение
      в БД потребует переменных окружения VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY.
    </p>

    <div class="recorder-controls">
      <button v-if="!isRecording" class="btn-primary" @click="startRecording" :disabled="isSaving">
        Начать запись
      </button>
      <button v-else class="btn-danger" @click="stopRecording">Остановить запись</button>

      <span v-if="isRecording" class="timer">
        <span class="rec-dot"></span>{{ formattedTimer }}
      </span>
    </div>

    <div v-if="previewUrl" class="preview-row">
      <audio :src="previewUrl" controls></audio>
      <span>Длительность: {{ formattedTimer }}</span>
      <button class="btn-primary" @click="saveRecording" :disabled="isSaving">
        {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
      </button>
      <button class="btn-secondary" @click="cancelPreview" :disabled="isSaving">Отменить</button>
    </div>

    <p v-if="statusMessage" class="status-line">{{ statusMessage }}</p>
    <p v-if="errorMessage" class="error-box">{{ errorMessage }}</p>
  </section>
</template>
