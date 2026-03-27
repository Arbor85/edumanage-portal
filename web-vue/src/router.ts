import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from '@auth0/auth0-vue'
import { hasCurrentUserPermission } from './services/permissionsService'
import { Permission } from './types/permission'

import Home from './pages/Home.vue'
import Profile from './pages/Profile.vue'
import Login from './pages/Login.vue'
import Clients from './pages/Clients/Clients.vue'
import Invite from './pages/Invite.vue'
import Excercises from './pages/Excercises/Excercises.vue'
import Routines from './pages/Routines/Routines.vue'
import Plans from './pages/Plans/Plans.vue'
import Meetings from './pages/Meetings/Meetings.vue'
import Courses from './pages/Courses/Courses.vue'

type RouteGuardPolicy = {
  requiresAuth: boolean
  requiredPermissions: Permission[]
}

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

const requireManageClientsPermission = async (to: { fullPath: string }) => {
  const canProceed = await authGuard(to as never)

  if (!canProceed) {
    return false
  }

  if (hasCurrentUserPermission(Permission.MANAGE_CLIENTS)) {
    return true
  }

  return {
    name: 'Home',
  }
}

const GUARD_POLICIES = new Map<unknown, RouteGuardPolicy>([
  [
    requireAuth,
    {
      requiresAuth: true,
      requiredPermissions: [],
    },
  ],
  [
    authGuard,
    {
      requiresAuth: true,
      requiredPermissions: [],
    },
  ],
  [
    requireManageClientsPermission,
    {
      requiresAuth: true,
      requiredPermissions: [Permission.MANAGE_CLIENTS],
    },
  ],
])

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
    beforeEnter: requireManageClientsPermission,
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
    path: '/meetings',
    name: 'Meetings',
    component: Meetings,
    beforeEnter: requireAuth,
  },
  {
    path: '/courses',
    name: 'Courses',
    component: Courses,
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

const getGuardPolicyForRecord = (beforeEnter: unknown): RouteGuardPolicy => {
  if (!beforeEnter) {
    return {
      requiresAuth: false,
      requiredPermissions: [],
    }
  }

  const guards = Array.isArray(beforeEnter) ? beforeEnter : [beforeEnter]
  const mergedPermissions = new Set<Permission>()
  let requiresAuth = false

  for (const guard of guards) {
    const policy = GUARD_POLICIES.get(guard)

    if (!policy) {
      continue
    }

    requiresAuth = requiresAuth || policy.requiresAuth

    for (const permission of policy.requiredPermissions) {
      mergedPermissions.add(permission)
    }
  }

  return {
    requiresAuth,
    requiredPermissions: Array.from(mergedPermissions),
  }
}

export const getRouteGuardPolicy = (path: string): RouteGuardPolicy => {
  const resolvedRoute = router.resolve(path)
  const mergedPermissions = new Set<Permission>()
  let requiresAuth = false

  for (const matchedRoute of resolvedRoute.matched) {
    const policy = getGuardPolicyForRecord(matchedRoute.beforeEnter)
    requiresAuth = requiresAuth || policy.requiresAuth

    for (const permission of policy.requiredPermissions) {
      mergedPermissions.add(permission)
    }
  }

  return {
    requiresAuth,
    requiredPermissions: Array.from(mergedPermissions),
  }
}

export default router