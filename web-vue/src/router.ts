import { createRouter, createWebHistory } from 'vue-router'
// import { authGuard } from '@auth0/auth0-vue'

import Home from './pages/Home.vue'
import Profile from './pages/Profile.vue'
import Login from './pages/Login.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    // beforeEnter: authGuard
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router