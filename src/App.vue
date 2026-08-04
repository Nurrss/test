<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import VoiceRecorder from './components/VoiceRecorder.vue'
import RecordingsTable from './components/RecordingsTable.vue'
import TabWarningModal from './components/TabWarningModal.vue'
import { supabase, isSupabaseConfigured } from './lib/supabase'

const recordings = ref([])
const recordingsLoading = ref(false)
const recordingsError = ref('')

const showTabWarning = ref(false)
let hasLeftTab = false

async function loadRecordings() {
  if (!isSupabaseConfigured) return
  recordingsLoading.value = true
  recordingsError.value = ''
  const { data, error } = await supabase
    .from('recordings')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    recordingsError.value = 'Не удалось загрузить записи: ' + error.message
  } else {
    recordings.value = data
  }
  recordingsLoading.value = false
}

function onRecordingSaved(newRecord) {
  if (newRecord) recordings.value.unshift(newRecord)
}

async function logTabEvent(eventType) {
  console.log('[tab-event]', eventType, new Date().toISOString())
  if (!isSupabaseConfigured) return
  const { error } = await supabase.from('tab_events').insert({ event_type: eventType })
  if (error) console.error('[tab-event] не удалось записать событие в Supabase:', error.message)
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
  loadRecordings()
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('blur', handleWindowBlur)
  window.addEventListener('focus', handleWindowFocus)
})

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('blur', handleWindowBlur)
  window.removeEventListener('focus', handleWindowFocus)
})
</script>

<template>
  <h1>Прототип: запись голоса + antileave</h1>
  <p class="subtitle">
    Технический прототип двух механик перед интеграцией в основную платформу: запись голоса
    в Supabase и отслеживание переключения вкладки/окна.
  </p>

  <VoiceRecorder @saved="onRecordingSaved" />
  <RecordingsTable :recordings="recordings" :loading="recordingsLoading" :error-message="recordingsError" />

  <TabWarningModal :visible="showTabWarning" @close="showTabWarning = false" />
</template>
