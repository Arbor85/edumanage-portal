import { createRouter, createWebHistory } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Public routes
    {
      path: '/login',
      name: 'Login',
      component: () => import('../pages/LoginPage.vue'),
    },
    {
      path: '/auth/callback',
      name: 'AuthCallback',
      component: () => import('../pages/AuthCallbackPage.vue'),
    },
    {
      path: '/invite/:code',
      name: 'InviteAccept',
      component: () => import('../pages/InviteAcceptPage.vue'),
    },

    // Protected routes
    {
      path: '/',
      redirect: '/dashboard',
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../pages/DashboardPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/exercises',
      name: 'Exercises',
      component: () => import('../pages/ExercisesPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/routines',
      name: 'Routines',
      component: () => import('../pages/RoutinesPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/plans',
      name: 'Plans',
      component: () => import('../pages/PlansPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/workout/active',
      name: 'ActiveWorkout',
      component: () => import('../pages/ActiveWorkoutPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/history',
      name: 'History',
      component: () => import('../pages/HistoryPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/clients',
      name: 'Clients',
      component: () => import('../pages/ClientsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/meetings',
      name: 'Meetings',
      component: () => import('../pages/MeetingsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/courses',
      name: 'Courses',
      component: () => import('../pages/CoursesPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../pages/ProfilePage.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true

  const { isAuthenticated, isLoading } = useAuth0()

  // Wait for auth0 to finish loading
  if (isLoading.value) {
    await new Promise<void>((resolve) => {
      const stop = setInterval(() => {
        if (!isLoading.value) {
          clearInterval(stop)
          resolve()
        }
      }, 50)
    })
  }

  if (!isAuthenticated.value) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  return true
})

export default router
