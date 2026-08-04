<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'

const route = useRoute()
const mobileMenuOpen = ref(false)

const pageTitle = computed(() => route.meta?.title || '')
</script>

<template>
  <div class="app-shell">
    <Sidebar :open="mobileMenuOpen" @close="mobileMenuOpen = false" />
    <div v-if="mobileMenuOpen" class="app-shell__backdrop" @click="mobileMenuOpen = false"></div>

    <div class="app-shell__main">
      <Header :title="pageTitle" @toggle-menu="mobileMenuOpen = !mobileMenuOpen" />
      <main class="app-shell__content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.app-shell__main {
  margin-left: 260px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-shell__content {
  padding: 1.75rem;
  flex: 1;
}

.app-shell__backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 30;
}

@media (max-width: 1279px) {
  .app-shell__main {
    margin-left: 0;
  }
}

@media (max-width: 767px) {
  .app-shell__content {
    padding: 1rem;
  }
}
</style>
