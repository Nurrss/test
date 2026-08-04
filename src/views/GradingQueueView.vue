<script setup>
import { ref, computed } from 'vue'
import AppCard from '../components/shared/AppCard.vue'
import AppButton from '../components/shared/AppButton.vue'

// TODO: заменить на select() из student_answers, где attempt.status='submitted'
// и requires_manual_grading=true, points_awarded is null.
const submissions = ref([
  {
    id: 'g1',
    student_name: 'Айдана Серікова',
    section: 'Writing',
    question_label: 'Writing — Task 2',
    question_type: 'open_text',
    content_text:
      'My favorite season is summer because I can travel with my family and spend more time outside...',
    max_points: 10,
    score: null,
    feedback: '',
  },
  {
    id: 'g2',
    student_name: 'Нұрлан Ахметов',
    section: 'Speaking',
    question_label: 'Speaking — Part 1',
    question_type: 'audio_response',
    audio_url: null,
    max_points: 10,
    score: null,
    feedback: '',
  },
  {
    id: 'g3',
    student_name: 'Гүлнұр Қасымова',
    section: 'Writing',
    question_label: 'Writing — Task 1',
    question_type: 'open_text',
    content_text: 'Dear Sir or Madam, I am writing to complain about...',
    max_points: 10,
    score: null,
    feedback: '',
  },
])

const selectedId = ref(submissions.value[0]?.id ?? null)
const selected = computed(() => submissions.value.find((s) => s.id === selectedId.value))

function saveScore() {
  // TODO: update('student_answers').set({ points_awarded, teacher_feedback }) через Supabase.
  const index = submissions.value.findIndex((s) => s.id === selectedId.value)
  if (index === -1) return
  submissions.value.splice(index, 1)
  selectedId.value = submissions.value[0]?.id ?? null
}
</script>

<template>
  <div class="grading">
    <h1>Бағалау</h1>

    <div class="grading__layout">
      <AppCard class="grading__list" :padded="false">
        <ul class="grading__list-items">
          <li
            v-for="item in submissions"
            :key="item.id"
            class="grading__list-item"
            :class="{ 'grading__list-item--active': item.id === selectedId }"
            @click="selectedId = item.id"
          >
            <strong>{{ item.student_name }}</strong>
            <span>{{ item.question_label }}</span>
          </li>
          <li v-if="!submissions.length" class="grading__empty">
            <i class="fa-solid fa-circle-check"></i> Бағалауды күтетін жұмыс жоқ
          </li>
        </ul>
      </AppCard>

      <AppCard v-if="selected" class="grading__detail">
        <h2>{{ selected.student_name }} — {{ selected.question_label }}</h2>

        <div v-if="selected.question_type === 'open_text'" class="grading__answer-text">
          {{ selected.content_text }}
        </div>
        <div v-else class="grading__answer-audio">
          <audio v-if="selected.audio_url" :src="selected.audio_url" controls></audio>
          <p v-else class="grading__no-audio">Дауыс жазбасы жоқ (mock деректер)</p>
        </div>

        <div class="grading__form">
          <label>Балл (0 – {{ selected.max_points }})</label>
          <input v-model.number="selected.score" type="number" min="0" :max="selected.max_points" class="grading__score-input" />

          <label>Пікір</label>
          <textarea v-model="selected.feedback" class="grading__feedback" placeholder="Оқушыға пікір..."></textarea>

          <AppButton @click="saveScore">Сақтау</AppButton>
        </div>
      </AppCard>

      <AppCard v-else class="grading__detail grading__detail--empty">
        <p>Тексеру үшін жұмысты таңдаңыз</p>
      </AppCard>
    </div>
  </div>
</template>

<style scoped>
.grading {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.grading__layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1.25rem;
  align-items: start;
}

.grading__list-items {
  list-style: none;
  margin: 0;
  padding: 0.5rem;
  max-height: 560px;
  overflow-y: auto;
}

.grading__list-item {
  display: flex;
  flex-direction: column;
  padding: 0.75rem 0.9rem;
  border-radius: var(--radius-control);
  cursor: pointer;
  font-size: var(--fs-body);
}

.grading__list-item span {
  font-size: var(--fs-label);
  color: var(--color-text-secondary);
}

.grading__list-item:hover {
  background: var(--color-input-bg);
}

.grading__list-item--active {
  background: rgba(31, 78, 74, 0.1);
}

.grading__empty {
  text-align: center;
  color: var(--color-text-secondary);
  padding: 2rem 1rem;
}

.grading__detail h2 {
  margin-bottom: 1.25rem;
}

.grading__answer-text {
  background: var(--color-input-bg);
  border-radius: var(--radius-control);
  padding: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.grading__answer-audio {
  margin-bottom: 1.5rem;
}

.grading__no-audio {
  color: var(--color-text-secondary);
}

.grading__form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.grading__score-input {
  width: 120px;
  font-family: var(--font-body);
  font-size: var(--fs-body);
  border-radius: var(--radius-control);
  border: none;
  background: var(--color-input-bg);
  padding: 0.6rem 0.8rem;
  margin-bottom: 0.5rem;
}

.grading__feedback {
  min-height: 100px;
  font-family: var(--font-body);
  font-size: var(--fs-body);
  border-radius: var(--radius-control);
  border: none;
  background: var(--color-input-bg);
  padding: 0.7rem 0.9rem;
  resize: vertical;
  margin-bottom: 0.75rem;
}

.grading__detail--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  min-height: 200px;
}

@media (max-width: 1023px) {
  .grading__layout {
    grid-template-columns: 1fr;
  }
}
</style>
