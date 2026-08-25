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
    children: [
      { path: '', redirect: { name: 'dashboard' } },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('../views/TeacherDashboardView.vue'),
        meta: { title: 'Мұғалімнің панелі', role: 'teacher' },
      },
      {
        path: 'students',
        name: 'students',
        component: () => import('../views/StudentsView.vue'),
        meta: { title: 'Оқушылар', role: 'teacher' },
      },
      {
        path: 'variants/:id',
        name: 'variant-editor',
        component: () => import('../views/VariantEditorView.vue'),
        meta: { title: 'Нұсқаны өңдеу', role: 'teacher' },
      },
      {
        path: 'grading',
        name: 'grading',
        component: () => import('../views/GradingQueueView.vue'),
        meta: { title: 'Бағалау', role: 'teacher' },
      },
      {
        path: 'results/:attemptId?',
        name: 'results',
        component: () => import('../views/ResultsView.vue'),
        meta: { title: 'Нәтижелер және статистика', role: 'teacher' },
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('../views/SettingsView.vue'),
        meta: { title: 'Параметрлер', role: 'teacher' },
      },
      {
        path: 'home',
        name: 'student-home',
        component: () => import('../views/StudentHomeView.vue'),
        meta: { title: 'Басты бет', role: 'student' },
      },
      {
        path: 'my-results/:attemptId?',
        name: 'my-results',
        component: () => import('../views/StudentResultsView.vue'),
        meta: { title: 'Менің нәтижелерім', role: 'student' },
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
  if (role === 'student') return { name: 'student-home' }
  if (role === 'teacher') return { name: 'dashboard' }
  // role === null means the profile failed to load (see auth store loadProfile) —
  // there's no safe home route to send them to, so bounce to login rather than
  // falling back to the teacher dashboard.
  return { name: 'login' }
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

  const requiredRole = to.meta?.role
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
