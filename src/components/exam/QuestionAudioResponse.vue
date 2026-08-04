<script setup>
import { ref, onBeforeUnmount, computed } from 'vue'

defineProps({
  question: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:answer'])

const isRecording = ref(false)
const elapsedSeconds = ref(0)
const previewUrl = ref(null)
const errorMessage = ref('')

let mediaRecorder = null
let mediaStream = null
let chunks = []
let timerHandle = null
let startedAt = 0
let recordedBlob = null

const formattedTimer = computed(() => {
  const m = Math.floor(elapsedSeconds.value / 60).toString().padStart(2, '0')
  const s = Math.floor(elapsedSeconds.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

function pickMimeType() {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
  return candidates.find((type) => MediaRecorder.isTypeSupported?.(type)) || ''
}

async function startRecording() {
  errorMessage.value = ''
  discardPreview()

  if (!navigator.mediaDevices?.getUserMedia) {
    errorMessage.value = 'Браузер аудио жазуды қолдамайды.'
    return
  }

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
  } catch (err) {
    errorMessage.value = 'Микрофонға қатысым жоқ: ' + (err?.message || err)
    return
  }

  const mimeType = pickMimeType()
  chunks = []

  try {
    mediaRecorder = mimeType ? new MediaRecorder(mediaStream, { mimeType }) : new MediaRecorder(mediaStream)
  } catch (err) {
    errorMessage.value = 'MediaRecorder іске қосылмады: ' + (err?.message || err)
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
    emit('update:answer', { audioBlob: recordedBlob, durationSeconds: Math.round(elapsedSeconds.value) })
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
  emit('update:answer', null)
}

onBeforeUnmount(() => {
  clearInterval(timerHandle)
  stopStream()
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})
</script>

<template>
  <div class="audio-response">
    <p class="audio-response__text">{{ question.content.text }}</p>
    <div class="audio-response__controls">
      <button v-if="!isRecording" class="audio-response__btn audio-response__btn--record" @click="startRecording">
        {{ previewUrl ? 'Қайта жазу' : 'Жазуды бастау' }}
      </button>
      <button v-else class="audio-response__btn audio-response__btn--stop" @click="stopRecording">
        Жазуды тоқтату
      </button>

      <span v-if="isRecording" class="audio-response__timer">
        <span class="audio-response__dot"></span>{{ formattedTimer }}
      </span>
    </div>

    <div v-if="previewUrl" class="audio-response__preview">
      <audio :src="previewUrl" controls></audio>
      <span>Ұзақтығы: {{ formattedTimer }}</span>
    </div>

    <p v-if="errorMessage" class="audio-response__error">{{ errorMessage }}</p>
  </div>
</template>

<style scoped>
.audio-response {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.audio-response__text {
  font-size: 16px;
  font-weight: 600;
}

.audio-response__controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.audio-response__btn {
  border: none;
  border-radius: var(--radius-control);
  padding: 0.65rem 1.3rem;
  font-weight: 700;
  cursor: pointer;
  color: #fff;
}

.audio-response__btn--record {
  background: var(--color-primary-dark);
}

.audio-response__btn--stop {
  background: var(--color-accent-red);
}

.audio-response__timer {
  font-variant-numeric: tabular-nums;
  font-size: 1.2rem;
  font-weight: 700;
}

.audio-response__dot {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--color-accent-red);
  margin-right: 6px;
  animation: audio-response-pulse 1s infinite;
}

@keyframes audio-response-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

.audio-response__preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--color-text-secondary);
  font-size: var(--fs-label);
}

.audio-response__error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 0.6rem 0.85rem;
  border-radius: var(--radius-control);
  font-size: var(--fs-label);
}
</style>
