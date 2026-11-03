<script setup>
defineProps({
  sections: {
    type: Array,
    required: true,
    // [{ key, label, score, max, counts: { correct, wrong, empty, pending },
    //    rows: [{ id, number, text, statement, imageUrl, answer, audioPath, audioUrl,
    //             correctAnswer, feedback, points, maxPoints, status }] }]
  },
})

const statusMeta = {
  correct: { label: 'Дұрыс', icon: 'fa-circle-check' },
  wrong: { label: 'Қате', icon: 'fa-circle-xmark' },
  graded: { label: 'Бағаланды', icon: 'fa-pen-to-square' },
  pending: { label: 'Бағаланбаған', icon: 'fa-hourglass-half' },
  empty: { label: 'Жауап жоқ', icon: 'fa-circle-minus' },
}
</script>

<template>
  <div class="breakdown">
    <details v-for="section in sections" :key="section.key" class="breakdown__section" open>
      <summary class="breakdown__summary">
        <strong>{{ section.label }}</strong>
        <span class="breakdown__section-score">{{ section.score }} / {{ section.max }} балл</span>
        <span class="breakdown__counts">
          <span v-if="section.counts.correct" class="breakdown__count breakdown__count--correct">
            Дұрыс: {{ section.counts.correct }}
          </span>
          <span v-if="section.counts.wrong" class="breakdown__count breakdown__count--wrong">
            Қате: {{ section.counts.wrong }}
          </span>
          <span v-if="section.counts.empty" class="breakdown__count">
            Жауап жоқ: {{ section.counts.empty }}
          </span>
          <span v-if="section.counts.pending" class="breakdown__count breakdown__count--pending">
            Бағаланбаған: {{ section.counts.pending }}
          </span>
        </span>
      </summary>

      <div class="breakdown__table-wrap">
        <table class="breakdown__table">
          <thead>
            <tr>
              <th>№</th>
              <th>Сұрақ</th>
              <th>Оқушының жауабы</th>
              <th>Дұрыс жауап</th>
              <th>Балл</th>
              <th>Нәтиже</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in section.rows" :key="row.id">
              <td class="breakdown__number">{{ row.number }}</td>
              <td class="breakdown__question">
                <img v-if="row.imageUrl" :src="row.imageUrl" alt="" class="breakdown__image" />
                <p v-if="row.text">{{ row.text }}</p>
                <p v-if="row.statement" class="breakdown__statement">{{ row.statement }}</p>
              </td>
              <td class="breakdown__answer">
                <audio v-if="row.audioUrl" :src="row.audioUrl" controls preload="none"></audio>
                <p v-else-if="row.audioPath" class="breakdown__muted">Дауыс жазбасы ашылмады</p>
                <p v-else-if="row.answer" class="breakdown__answer-text">{{ row.answer }}</p>
                <p v-else class="breakdown__muted">—</p>
                <p v-if="row.feedback" class="breakdown__feedback">Пікір: {{ row.feedback }}</p>
              </td>
              <td>{{ row.correctAnswer || '—' }}</td>
              <td class="breakdown__points">{{ row.points ?? '—' }} / {{ row.maxPoints }}</td>
              <td>
                <span class="breakdown__status" :class="`breakdown__status--${row.status}`">
                  <i class="fa-solid" :class="statusMeta[row.status].icon"></i>
                  {{ statusMeta[row.status].label }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  </div>
</template>

<style scoped>
.breakdown {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.breakdown__section {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
}

.breakdown__summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem 0.9rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
}

.breakdown__section-score {
  font-weight: 600;
  color: var(--color-primary-dark);
}

.breakdown__counts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-left: auto;
  font-size: var(--fs-label);
}

.breakdown__count {
  color: var(--color-text-secondary);
}

.breakdown__count--correct {
  color: var(--color-accent-green);
}

.breakdown__count--wrong {
  color: var(--color-accent-red);
}

.breakdown__count--pending {
  color: #b45309;
}

.breakdown__table-wrap {
  overflow-x: auto;
  border-top: 1px solid var(--color-border);
}

.breakdown__table {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
  font-size: var(--fs-label);
}

.breakdown__table th {
  text-align: left;
  font-weight: 600;
  color: var(--color-text-secondary);
  padding: 0.6rem 0.75rem;
  white-space: nowrap;
}

.breakdown__table td {
  padding: 0.65rem 0.75rem;
  border-top: 1px solid var(--color-border);
  vertical-align: top;
  overflow-wrap: anywhere;
}

.breakdown__number,
.breakdown__points {
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.breakdown__points {
  font-weight: 600;
}

.breakdown__question {
  width: 36%;
}

.breakdown__image {
  display: block;
  max-width: 120px;
  max-height: 80px;
  object-fit: contain;
  margin-bottom: 0.35rem;
  border-radius: 4px;
}

.breakdown__statement {
  margin-top: 0.25rem;
  color: var(--color-text-secondary);
}

.breakdown__answer {
  width: 26%;
}

.breakdown__answer audio {
  width: 100%;
  min-width: 200px;
}

.breakdown__answer-text {
  white-space: pre-wrap;
  max-height: 220px;
  overflow-y: auto;
}

.breakdown__muted {
  color: var(--color-text-secondary);
}

.breakdown__feedback {
  margin-top: 0.4rem;
  color: var(--color-text-secondary);
  font-style: italic;
}

.breakdown__status {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 600;
  white-space: nowrap;
  color: var(--color-text-secondary);
}

.breakdown__status--correct {
  color: var(--color-accent-green);
}

.breakdown__status--wrong {
  color: var(--color-accent-red);
}

.breakdown__status--graded {
  color: var(--color-primary-dark);
}

.breakdown__status--pending {
  color: #b45309;
}
</style>
