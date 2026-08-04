<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
})

const audioEl = ref(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0')
  return `${m}:${s}`
}

const progressRatio = computed(() => (duration.value ? currentTime.value / duration.value : 0))

function togglePlay() {
  if (!audioEl.value) return
  if (isPlaying.value) {
    audioEl.value.pause()
  } else {
    audioEl.value.play()
  }
}

function onTimeUpdate() {
  currentTime.value = audioEl.value.currentTime
}

function onLoadedMetadata() {
  duration.value = audioEl.value.duration
}

function seek(event) {
  if (!audioEl.value || !duration.value) return
  const rect = event.currentTarget.getBoundingClientRect()
  const ratio = (event.clientX - rect.left) / rect.width
  audioEl.value.currentTime = ratio * duration.value
}
</script>

<template>
  <div class="audio-player">
    <audio
      ref="audioEl"
      :src="src"
      @play="isPlaying = true"
      @pause="isPlaying = false"
      @ended="isPlaying = false"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
    ></audio>

    <button type="button" class="audio-player__toggle" @click="togglePlay">
      <i class="fa-solid" :class="isPlaying ? 'fa-pause' : 'fa-play'"></i>
    </button>

    <span class="audio-player__time">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>

    <div class="audio-player__track" @click="seek">
      <div class="audio-player__fill" :style="{ width: `${progressRatio * 100}%` }"></div>
    </div>

    <i class="fa-solid fa-volume-high audio-player__volume"></i>
  </div>
</template>

<style scoped>
.audio-player {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--color-input-bg);
  border-radius: 999px;
  padding: 0.5rem 1rem;
  max-width: 460px;
}

.audio-player__toggle {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--color-primary-dark);
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.audio-player__time {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}

.audio-player__track {
  flex: 1;
  height: 4px;
  border-radius: 999px;
  background: var(--color-border);
  cursor: pointer;
}

.audio-player__fill {
  height: 100%;
  border-radius: 999px;
  background: var(--color-primary-dark);
}

.audio-player__volume {
  flex-shrink: 0;
  font-size: 14px;
}
</style>
