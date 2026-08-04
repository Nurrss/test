import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AppShell from '../components/layout/AppShell.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/',
    component: AppShell,
    meta: { role: 'teacher' },
    children: [
      { path: '', redirect: { name: 'dashboard' } },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('../views/TeacherDashboardView.vue'),
        meta: { title: 'Мұғалімнің панелі' },
      },
      {
        path: 'students',
        name: 'students',
        component: () => import('../views/StudentsView.vue'),
        meta: { title: 'Оқушылар' },
      },
      {
        path: 'grading',
        name: 'grading',
        component: () => import('../views/GradingQueueView.vue'),
        meta: { title: 'Бағалау' },
      },
      {
        path: 'results/:attemptId?',
        name: 'results',
        component: () => import('../views/ResultsView.vue'),
        meta: { title: 'Нәтижелер және статистика' },
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('../views/SettingsView.vue'),
        meta: { title: 'Параметрлер' },
      },
    ],
  },
  {
    path: '/exam',
    name: 'exam',
    component: () => import('../views/ExamTakingView.vue'),
    meta: { role: 'student' },
  },
  { path: '/:pathMatch(.*)*', redirect: { name: 'login' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

function homeRouteForRole(role) {
  return role === 'student' ? { name: 'exam' } : { name: 'dashboard' }
}

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!auth.initialized) await auth.init()

  if (!auth.isAuthenticated) {
    return to.name === 'login' ? true : { name: 'login' }
  }

  if (to.name === 'login') {
    return homeRouteForRole(auth.role)
  }

  const requiredRole = to.matched.find((record) => record.meta?.role)?.meta?.role
  if (requiredRole && auth.role !== requiredRole) {
    const home = homeRouteForRole(auth.role)
    // Если профиль не подгрузился (role=null) и запасной роут совпадает с
    // текущим, редирект зациклится (см. infinite recursion в RLS-инциденте) —
    // в этом случае просто пропускаем навигацию, а не долбим тот же роут.
    return home.name === to.name ? true : home
  }

  return true
})

export default router
