import { createRouter, createWebHistory } from 'vue-router'


import WorkoutsPage from '../pages/WorkoutsPage.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/workouts',
      name: 'Workouts',
      component: WorkoutsPage,
    },
  ],
})

export default router
