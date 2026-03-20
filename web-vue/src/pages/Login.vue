<template>
  <div class="flex flex-col items-center justify-center h-full text-slate-900 dark:text-slate-100">
    <h1 class="text-3xl font-bold mb-4">Login</h1>
    <p class="mb-6 text-slate-600 dark:text-slate-300">Please log in to access your account.</p>
    <div
      v-if="authError"
      class="w-full max-w-xl rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-left text-amber-950 shadow-sm dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100"
    >
      <p class="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">
        Authentication Error
      </p>
      <h2 class="mt-2 text-xl font-semibold">{{ authError.title }}</h2>
      <p class="mt-2 text-sm leading-6 text-amber-900/90 dark:text-amber-100/90">
        {{ authError.message }}
      </p>
      <ul
        v-if="authError.details.length"
        class="mt-3 space-y-1 text-sm text-amber-900/80 dark:text-amber-100/80"
      >
        <li v-for="detail in authError.details" :key="detail">{{ detail }}</li>
      </ul>
      <p
        v-if="authError.hint"
        class="mt-3 rounded-xl bg-white/70 px-3 py-2 text-sm text-amber-950 dark:bg-slate-950/30 dark:text-amber-50"
      >
        {{ authError.hint }}
      </p>
      <div class="mt-4 grid gap-2 text-xs text-amber-900/80 dark:text-amber-100/80 sm:grid-cols-[auto_1fr]">
        <span class="font-semibold">Error code</span>
        <span class="break-all">{{ authError.code }}</span>
        <span class="font-semibold">Details</span>
        <span class="break-words">{{ authError.rawDescription }}</span>
      </div>
    </div>
    <div class="mt-8 flex flex-col gap-3 w-64">
      <button @click="loginWith('google-oauth2')"
        class="bg-white text-gray-800 border border-gray-300 rounded px-4 py-2 flex items-center justify-center gap-2 hover:bg-gray-100 transition dark:border-slate-500 dark:bg-slate-100 dark:text-slate-800">
        <img src="//cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google"
          class="h-4 w-4" />
        Continue with Google
      </button>
      <button @click="loginWith('github')"
        class="bg-gray-900 text-white rounded px-4 py-2 flex items-center justify-center gap-2 hover:bg-gray-800 transition dark:bg-slate-950 dark:hover:bg-slate-900">
        <img src="//cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="GitHub"
          class="h-4 w-4 bg-white rounded-full" />
        Continue with GitHub
      </button>
      <button @click="loginWith('facebook')"
        class="bg-blue-600 text-white rounded px-4 py-2 flex items-center justify-center gap-2 hover:bg-blue-700 transition dark:bg-blue-700 dark:hover:bg-blue-600">
        <img src="//cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg" alt="Facebook"
          class="h-4 w-4 bg-white rounded-full" />
        Continue with Facebook
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue';
import { usePageTitle } from '../composables/usePageTitle';

usePageTitle('Login')

type LoginErrorState = {
  code: string
  title: string
  message: string
  details: string[]
  hint?: string
  rawDescription: string
}

const { loginWithRedirect, isAuthenticated } = useAuth0();
const route = useRoute()
const router = useRouter()

const LOGIN_RETURN_TO_KEY = 'login:returnTo'

const formatErrorCode = (errorCode: string) => {
  return errorCode
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const authError = computed<LoginErrorState | null>(() => {
  const errorCode = route.query.error
  const errorDescription = route.query.error_description

  if (typeof errorCode !== 'string') {
    return null
  }

  const rawDescription = typeof errorDescription === 'string'
    ? errorDescription
    : 'Authentication request failed.'

  const unauthorizedAudienceMatch = rawDescription.match(
    /^Client "([^"]+)" is not authorized to access resource server "([^"]+)"\.?$/,
  )

  if (unauthorizedAudienceMatch) {
    const [, clientId, audience] = unauthorizedAudienceMatch

    return {
      code: errorCode,
      title: 'Application is not authorized',
      message: 'The sign-in request asked Auth0 for an API that this application is not allowed to use.',
      details: [
        `Client ID: ${clientId}`,
        `API audience: ${audience}`,
      ],
      hint: 'Allow this Auth0 application to access the API, or remove the audience from the authorization request if the API is not needed for login.',
      rawDescription,
    }
  }

  return {
    code: errorCode,
    title: formatErrorCode(errorCode),
    message: rawDescription,
    details: [],
    rawDescription,
  }
})

const returnToPath = computed(() => {
  const redirectQuery = route.query.redirect

  if (typeof redirectQuery === 'string' && redirectQuery.startsWith('/')) {
    return redirectQuery
  }

  return '/'
})

const redirectAfterLogin = async () => {
  if (!isAuthenticated.value) {
    return
  }

  const storedReturnTo = sessionStorage.getItem(LOGIN_RETURN_TO_KEY)
  const nextPath = storedReturnTo && storedReturnTo.startsWith('/') ? storedReturnTo : '/'

  sessionStorage.removeItem(LOGIN_RETURN_TO_KEY)
  await router.replace(nextPath)
}

async function loginWith(connection: string) {
  sessionStorage.setItem(LOGIN_RETURN_TO_KEY, returnToPath.value)

  try {
    await loginWithRedirect({
      authorizationParams: {
        connection,
        scope: 'openid profile email',
        redirect_uri: `${window.location.origin}/login`,
      }
    })
  } catch (error) {
    console.error('Login failed:', error)
  }
}

watch(
  () => isAuthenticated.value,
  () => {
    redirectAfterLogin()
  },
)

onMounted(() => {
  redirectAfterLogin()
})
</script>
