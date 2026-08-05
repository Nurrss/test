<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['close'])

const router = useRouter()
const auth = useAuthStore()

const teacherNavItems = [
  { to: { name: 'dashboard' }, label: 'Басты бет', icon: 'fa-solid fa-house' },
  { to: { name: 'students' }, label: 'Оқушылар', icon: 'fa-solid fa-user-graduate' },
  { to: { name: 'results' }, label: 'Нәтижелер', icon: 'fa-solid fa-chart-column' },
  { to: { name: 'grading' }, label: 'Бағалау', icon: 'fa-solid fa-square-check' },
  { to: { name: 'settings' }, label: 'Параметрлер', icon: 'fa-solid fa-gear' },
]

const studentNavItems = [
  { to: { name: 'student-home' }, label: 'Басты бет', icon: 'fa-solid fa-house' },
  { to: { name: 'my-results' }, label: 'Менің нәтижелерім', icon: 'fa-solid fa-chart-column' },
]

const navItems = computed(() => (auth.role === 'student' ? studentNavItems : teacherNavItems))

async function logout() {
  await auth.signOut()
  router.push({ name: 'login' })
}
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar--open': open }">
    <div class="sidebar__logo">
      <span class="sidebar__logo-mark">Ә</span>
    </div>

    <nav class="sidebar__nav">
      <router-link
        v-for="item in navItems"
        :key="item.label"
        :to="item.to"
        class="sidebar__item"
        @click="$emit('close')"
      >
        <i class="sidebar__item-icon" :class="item.icon"></i>
        <span class="sidebar__item-label">{{ item.label }}</span>
      </router-link>
    </nav>

    <button class="sidebar__logout" @click="logout">
      <i class="sidebar__item-icon fa-solid fa-right-from-bracket"></i>
      <span class="sidebar__item-label">Шығу</span>
    </button>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 260px;
  background: #1f4e4a;
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 40;
  transition: transform 0.2s ease;
}

.sidebar__logo {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.5rem 1.75rem;
}

.sidebar__logo-mark {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid var(--color-accent-orange);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 700;
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.sidebar__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.75rem;
  border-radius: var(--radius-control);
  color: #fff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
}

.sidebar__item:hover {
  background: var(--color-bg);
  color: var(--color-primary-dark);
}

.sidebar__item.router-link-active {
  background: var(--color-bg);
  color: var(--color-primary-dark);
}

.sidebar__item-icon {
  width: 20px;
  text-align: center;
}

.sidebar__logout {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.75rem;
  border-radius: var(--radius-control);
  background: none;
  border: none;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-body);
}

.sidebar__logout:hover {
  background: var(--color-bg);
  color: var(--color-primary-dark);
}

@media (max-width: 1279px) {
  .sidebar {
    transform: translateX(-100%);
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.2);
  }

  .sidebar--open {
    transform: translateX(0);
  }
}
</style>
