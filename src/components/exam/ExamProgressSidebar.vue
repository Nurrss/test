<script setup>
defineProps({
  sections: {
    // [{ key, label, points, status: 'done' | 'active' | 'upcoming' }]
    type: Array,
    required: true,
  },
})
</script>

<template>
  <aside class="exam-progress">
    <h3 class="exam-progress__title">Емтихан барысы</h3>

    <ol class="exam-progress__list">
      <li
        v-for="(section, index) in sections"
        :key="section.key"
        class="exam-progress__item"
        :class="`exam-progress__item--${section.status}`"
      >
        <span class="exam-progress__number">
          <i v-if="section.status === 'done'" class="fa-solid fa-check"></i>
          <template v-else>{{ index + 1 }}</template>
        </span>
        <span class="exam-progress__text">
          <strong>{{ section.label }}</strong>
          <small>({{ section.points }} ұпай)</small>
        </span>
      </li>
    </ol>
  </aside>
</template>

<style scoped>
.exam-progress {
  width: 220px;
  flex-shrink: 0;
}

.exam-progress__title {
  font-size: 15px;
  margin-bottom: 1.25rem;
  color: var(--color-text-secondary);
}

.exam-progress__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.exam-progress__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 0.85rem;
  border-radius: var(--radius-control);
}

.exam-progress__number {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
}

.exam-progress__text {
  display: flex;
  flex-direction: column;
  font-size: 13px;
}

.exam-progress__text small {
  color: var(--color-text-secondary);
}

.exam-progress__item--active {
  background: var(--color-primary-dark);
  color: #fff;
}

.exam-progress__item--active .exam-progress__number {
  background: rgba(255, 255, 255, 0.2);
}

.exam-progress__item--active .exam-progress__text small {
  color: rgba(255, 255, 255, 0.7);
}

.exam-progress__item--done .exam-progress__number {
  background: var(--color-accent-green);
  color: #fff;
}

.exam-progress__item--upcoming {
  opacity: 0.5;
}

.exam-progress__item--upcoming .exam-progress__number {
  background: var(--color-border);
}

@media (max-width: 1023px) {
  .exam-progress {
    width: 100%;
  }

  .exam-progress__list {
    flex-direction: row;
    overflow-x: auto;
  }

  .exam-progress__text small {
    display: none;
  }
}
</style>
