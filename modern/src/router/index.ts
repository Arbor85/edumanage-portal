import { createRouter, createWebHistory } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import { useAuthStore } from '../stores/authStore'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ── Public ──────────────────────────────────────────────────────────
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
    {
      path: '/join/:code',
      name: 'Join',
      component: () => import('../pages/JoinPage.vue'),
    },

    // ── Onboarding ───────────────────────────────────────────────────────
    {
      path: '/onboarding',
      name: 'Onboarding',
      component: () => import('../pages/OnboardingPage.vue'),
      meta: { requiresAuth: true },
    },

    // ── Client routes (all authenticated users) ──────────────────────────
    {
      path: '/',
      name: 'Today',
      component: () => import('../pages/TodayPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/train',
      name: 'Train',
      // Phase 7 will introduce TrainPage; using RoutinesPage as placeholder
      component: () => import('../pages/RoutinesPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/progress',
      name: 'Progress',
      component: () => import('../pages/ProgressPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/explore',
      name: 'Explore',
      // Phase 7 will introduce ExplorePage; using ExercisesPage as placeholder
      component: () => import('../pages/ExercisesPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/workout/active',
      name: 'ActiveWorkout',
      component: () => import('../pages/ActiveWorkoutPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../pages/ProfilePage.vue'),
      meta: { requiresAuth: true },
    },

    // ── Coach routes (trainers only) ──────────────────────────────────────
    {
      path: '/coach/clients',
      name: 'CoachClients',
      component: () => import('../pages/ClientsPage.vue'),
      meta: { requiresAuth: true, requiresTrainer: true },
    },
    {
      path: '/coach/plans',
      name: 'CoachPlans',
      component: () => import('../pages/PlansPage.vue'),
      meta: { requiresAuth: true, requiresTrainer: true },
    },
    {
      path: '/coach/meetings',
      name: 'CoachMeetings',
      component: () => import('../pages/MeetingsPage.vue'),
      meta: { requiresAuth: true, requiresTrainer: true },
    },
    {
      path: '/coach/courses',
      name: 'CoachCourses',
      component: () => import('../pages/CoursesPage.vue'),
      meta: { requiresAuth: true, requiresTrainer: true },
    },
    {
      path: '/coach/equipment',
      name: 'CoachEquipment',
      component: () => import('../pages/EquipmentPage.vue'),
      meta: { requiresAuth: true, requiresTrainer: true },
    },

    // ── Legacy redirects (old routes → new routes) ───────────────────────
    { path: '/dashboard', redirect: '/' },
    { path: '/exercises', redirect: '/explore' },
    { path: '/routines', redirect: '/train' },
    { path: '/history', redirect: '/progress' },
    { path: '/clients', redirect: '/coach/clients' },
    { path: '/plans', redirect: '/coach/plans' },
    { path: '/meetings', redirect: '/coach/meetings' },
    { path: '/courses', redirect: '/coach/courses' },
    { path: '/equipment', redirect: '/coach/equipment' },
  ],
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true

  const { isAuthenticated, isLoading } = useAuth0()

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

  const authStore = useAuthStore()

  if (to.meta.requiresTrainer && !authStore.isTrainer) {
    return { path: '/' }
  }

  // Onboarding gate — skip for the onboarding route itself
  if (to.name !== 'Onboarding' && !authStore.onboardingComplete) {
    // Wait briefly for profile to load (it fetches async on auth)
    if (authStore.userProfile === null) {
      await new Promise<void>((resolve) => {
        const stop = setInterval(() => {
          if (authStore.userProfile !== null || !authStore.isAuthenticated) {
            clearInterval(stop)
            resolve()
          }
        }, 50)
        // Timeout after 2s — if profile still null, assume new user → onboarding
        setTimeout(() => { clearInterval(stop); resolve() }, 2000)
      })
    }
    if (!authStore.onboardingComplete) {
      return { name: 'Onboarding' }
    }
  }

  return true
})

export default router
