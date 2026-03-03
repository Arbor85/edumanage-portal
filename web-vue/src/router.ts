import { createRouter, createWebHistory } from 'vue-router'

import Home from './pages/Home.vue'
import Profile from './pages/Profile.vue'
import Login from './pages/Login.vue'
import Clients from './pages/Clients.vue'
import Invite from './pages/Invite.vue'
import Excercises from './pages/Excercises.vue'
import Routines from './pages/Routines.vue'
import Plans from './pages/Plans.vue'

const hasAuth0CacheEntries = () => {
  return Object.keys(localStorage).some((key) => key.startsWith('@@auth0spajs@@'))
}

const isUserAuthenticated = () => {
  return localStorage.getItem('auth0.is.authenticated') === 'true' || hasAuth0CacheEntries()
}

const requireAuth = (to: { fullPath: string }) => {
  if (isUserAuthenticated()) {
    return true
  }

  return {
    name: 'Login',
    query: {
      redirect: to.fullPath,
    },
  }
}

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
    path: '/clients',
    name: 'Clients',
    component: Clients,
    beforeEnter: requireAuth,
  },
  {
    path: '/excercises',
    name: 'Excercises',
    component: Excercises,
  },
  {
    path: '/routines',
    name: 'Routines',
    component: Routines,
    beforeEnter: requireAuth,
  },
  {
    path: '/plans',
    name: 'Plans',
    component: Plans,
    beforeEnter: requireAuth,
  },
  {
    path: '/invite/:invitationCode',
    name: 'Invite',
    component: Invite,
    beforeEnter: requireAuth,
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