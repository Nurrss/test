<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

defineProps({
  title: {
    type: String,
    default: '',
  },
  pendingCount: {
    type: Number,
    default: 0,
  },
})

defineEmits(['toggle-menu'])

const auth = useAuthStore()
const router = useRouter()
const menuOpen = ref(false)

const roleLabel = {
  teacher: 'Мұғалім',
  student: 'Оқушы',
}

async function logout() {
  menuOpen.value = false
  await auth.signOut()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="header">
    <div class="header__left">
      <button class="header__burger" @click="$emit('toggle-menu')" aria-label="Меню">
        <i class="fa-solid fa-bars"></i>
      </button>
      <h2 class="header__title">{{ title }}</h2>
    </div>

    <div class="header__right">
      <button class="header__bell" aria-label="Хабарландырулар">
        <i class="fa-solid fa-bell"></i>
        <span v-if="pendingCount > 0" class="header__badge">{{ pendingCount }}</span>
      </button>

      <div class="header__profile">
        <button class="header__profile-btn" @click="menuOpen = !menuOpen">
          <span class="header__avatar">{{ (auth.profile?.full_name || '?')[0] }}</span>
          <span class="header__profile-info">
            <strong>{{ auth.profile?.full_name || '—' }}</strong>
            <small>{{ roleLabel[auth.role] || '' }}</small>
          </span>
        </button>

        <div v-if="menuOpen" class="header__dropdown">
          <router-link :to="{ name: 'settings' }" @click="menuOpen = false">
            Параметрлер
          </router-link>
          <button @click="logout">Шығу</button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: var(--color-card);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 20;
}

.header__left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header__burger {
  display: none;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.header__title {
  color: var(--color-text);
}

.header__right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header__bell {
  position: relative;
  background: var(--color-input-bg);
  border: none;
  border-radius: 999px;
  width: 38px;
  height: 38px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text);
}

.header__badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--color-accent-red);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  border-radius: 999px;
  padding: 1px 5px;
  min-width: 16px;
}

.header__profile {
  position: relative;
}

.header__profile-btn {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: none;
  border: none;
  cursor: pointer;
}

.header__avatar {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: var(--color-primary-dark);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  text-transform: uppercase;
}

.header__profile-info {
  display: flex;
  flex-direction: column;
  text-align: left;
  font-size: 13px;
}

.header__profile-info small {
  color: var(--color-text-secondary);
}

.header__dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  background: var(--color-card);
  box-shadow: var(--shadow-card);
  border-radius: var(--radius-control);
  padding: 0.4rem;
  display: flex;
  flex-direction: column;
  min-width: 160px;
}

.header__dropdown a,
.header__dropdown button {
  padding: 0.5rem 0.6rem;
  border-radius: 6px;
  text-align: left;
  background: none;
  border: none;
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text);
  text-decoration: none;
  cursor: pointer;
}

.header__dropdown a:hover,
.header__dropdown button:hover {
  background: var(--color-input-bg);
}

@media (max-width: 1279px) {
  .header__burger {
    display: block;
  }
}

@media (max-width: 767px) {
  .header__profile-info {
    display: none;
  }
}
</style>
