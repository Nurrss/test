<script setup>
defineProps({
  recordings: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
})

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('ru-RU')
}

function formatDuration(seconds) {
  if (seconds === null || seconds === undefined) return '—'
  const total = Math.round(Number(seconds))
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, '0')
  const s = (total % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}
</script>

<template>
  <section>
    <h2>Сохранённые записи</h2>

    <p v-if="loading" class="status-line">Загрузка...</p>
    <p v-if="errorMessage" class="error-box">{{ errorMessage }}</p>

    <table v-if="recordings.length">
      <thead>
        <tr>
          <th>Дата и время</th>
          <th>Длительность</th>
          <th>Плеер</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="rec in recordings" :key="rec.id">
          <td>{{ formatDate(rec.created_at) }}</td>
          <td>{{ formatDuration(rec.duration_seconds) }}</td>
          <td>
            <audio v-if="rec.file_url" :src="rec.file_url" controls></audio>
            <span v-else>нет ссылки</span>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else-if="!loading">Пока нет ни одной записи.</p>
  </section>
</template>
