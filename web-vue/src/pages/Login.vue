<template>
  <div class="auth-root">
    <!-- Ambient background orbs -->
    <div class="auth-orb auth-orb--1" />
    <div class="auth-orb auth-orb--2" />
    <div class="auth-orb auth-orb--3" />

    <!-- Mobile top toggle (hidden on md+) -->
    <div class="auth-mobile-toggle md:hidden">
      <button
        class="auth-mobile-tab"
        :class="{ 'auth-mobile-tab--active': mode === 'login' }"
        @click="mode = 'login'"
      >Sign In</button>
      <button
        class="auth-mobile-tab"
        :class="{ 'auth-mobile-tab--active': mode === 'register' }"
        @click="mode = 'register'"
      >Register</button>
      <div class="auth-mobile-indicator" :class="{ 'auth-mobile-indicator--right': mode === 'register' }" />
    </div>

    <!-- Split layout: left = login, right = register -->
    <div class="auth-split">
      <!-- LEFT — Login form -->
      <div class="auth-form-side">
        <Transition name="auth-form">
          <div v-if="mode === 'login'" key="login" class="auth-form-box">
            <div class="auth-form-header">
              <div class="auth-brand-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                  <path d="M11.7 2.805a.75.75 0 0 1 .6 0A60.65 60.65 0 0 1 22.83 8.72a.75.75 0 0 1-.231 1.337 49.948 49.948 0 0 0-9.902 3.912l-.003.002c-.114.06-.227.119-.34.18a.75.75 0 0 1-.707 0A50.88 50.88 0 0 0 7.5 12.173v-.224c0-.131.067-.248.172-.311a54.615 54.615 0 0 1 4.653-2.52.75.75 0 0 0-.65-1.352 56.123 56.123 0 0 0-4.78 2.589 1.858 1.858 0 0 0-.859 1.228 49.803 49.803 0 0 0-4.634-1.527.75.75 0 0 1-.231-1.337A60.653 60.653 0 0 1 11.7 2.805Z" />
                  <path d="M13.06 15.473a48.45 48.45 0 0 1 7.666-3.282c.134 1.414.22 2.843.255 4.284a.75.75 0 0 1-.46.71 47.87 47.87 0 0 0-8.105 4.342.75.75 0 0 1-.832 0 47.87 47.87 0 0 0-8.104-4.342.75.75 0 0 1-.461-.71c.035-1.442.121-2.87.255-4.286.921.304 1.83.634 2.726.99v1.27a1.5 1.5 0 0 0-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.66a6.727 6.727 0 0 0 .551-1.608 1.5 1.5 0 0 0 .14-2.67v-.645a48.549 48.549 0 0 1 3.44 1.667 2.25 2.25 0 0 0 2.12 0Z" />
                </svg>
              </div>
              <h1 class="auth-title">Welcome back</h1>
              <p class="auth-subtitle">Sign in to continue your journey</p>
            </div>

            <div
              v-if="authError"
              class="auth-error"
            >
              <p class="auth-error-label">Authentication Error</p>
              <h2 class="auth-error-title">{{ authError.title }}</h2>
              <p class="auth-error-message">{{ authError.message }}</p>
              <ul v-if="authError.details.length" class="auth-error-details">
                <li v-for="detail in authError.details" :key="detail">{{ detail }}</li>
              </ul>
            </div>

            <div class="auth-btn-group">
              <button @click="loginWith('google-oauth2')" class="auth-btn auth-btn--light">
                <img src="//cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="" class="w-5 h-5" />
                Continue with Google
              </button>
              <button @click="loginWith('github')" class="auth-btn auth-btn--dark">
                <img src="//cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="" class="w-5 h-5 rounded-full bg-white" />
                Continue with GitHub
              </button>
              <button @click="loginWith('facebook')" class="auth-btn auth-btn--blue">
                <img src="//cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg" alt="" class="w-5 h-5 rounded-full bg-white" />
                Continue with Facebook
              </button>
            </div>

            <p class="auth-toggle-link md:hidden">
              No account yet?
              <button @click="mode = 'register'" class="auth-toggle-btn">Create one</button>
            </p>
          </div>
        </Transition>
      </div>

      <!-- RIGHT — Register form -->
      <div class="auth-form-side">
        <Transition name="auth-form">
          <div v-if="mode === 'register'" key="register" class="auth-form-box">
            <div class="auth-form-header">
              <div class="auth-brand-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                  <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
                </svg>
              </div>
              <h1 class="auth-title">Get started</h1>
              <p class="auth-subtitle">Create your free account today</p>
            </div>

            <div class="auth-btn-group">
              <button @click="signUpWith('google-oauth2')" class="auth-btn auth-btn--light">
                <img src="//cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="" class="w-5 h-5" />
                Sign up with Google
              </button>
              <button @click="signUpWith('github')" class="auth-btn auth-btn--dark">
                <img src="//cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="" class="w-5 h-5 rounded-full bg-white" />
                Sign up with GitHub
              </button>
              <button @click="signUpWith('facebook')" class="auth-btn auth-btn--blue">
                <img src="//cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg" alt="" class="w-5 h-5 rounded-full bg-white" />
                Sign up with Facebook
              </button>
            </div>

            <p class="auth-agree">
              By signing up you agree to our
              <a href="#" class="text-violet-600 dark:text-violet-400 hover:underline">Terms of Service</a>
              and
              <a href="#" class="text-violet-600 dark:text-violet-400 hover:underline">Privacy Policy</a>.
            </p>

            <p class="auth-toggle-link md:hidden">
              Already have an account?
              <button @click="mode = 'login'" class="auth-toggle-btn">Sign in</button>
            </p>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Sliding decorative panel (desktop only) -->
    <div class="auth-deco" :class="{ 'auth-deco--shifted': mode === 'register' }">
      <!-- Inner decorative shapes -->
      <div class="auth-deco-blob auth-deco-blob--1" />
      <div class="auth-deco-blob auth-deco-blob--2" />
      <div class="auth-deco-blob auth-deco-blob--3" />

      <div class="auth-deco-inner">
        <Transition name="auth-deco-text" mode="out-in">
          <div v-if="mode === 'login'" key="deco-login" class="auth-deco-content">
            <div class="auth-deco-glyph">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-16 h-16 opacity-90">
                <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
              </svg>
            </div>
            <h2 class="auth-deco-heading">New here?</h2>
            <p class="auth-deco-body">
              Join EduManage and unlock a world of learning tools, personalised schedules, and progress tracking.
            </p>
            <button @click="mode = 'register'" class="auth-deco-cta">
              Create Account
            </button>
          </div>
          <div v-else key="deco-register" class="auth-deco-content">
            <div class="auth-deco-glyph">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-16 h-16 opacity-90">
                <path d="M11.7 2.805a.75.75 0 0 1 .6 0A60.65 60.65 0 0 1 22.83 8.72a.75.75 0 0 1-.231 1.337 49.948 49.948 0 0 0-9.902 3.912l-.003.002c-.114.06-.227.119-.34.18a.75.75 0 0 1-.707 0A50.88 50.88 0 0 0 7.5 12.173v-.224c0-.131.067-.248.172-.311a54.615 54.615 0 0 1 4.653-2.52.75.75 0 0 0-.65-1.352 56.123 56.123 0 0 0-4.78 2.589 1.858 1.858 0 0 0-.859 1.228 49.803 49.803 0 0 0-4.634-1.527.75.75 0 0 1-.231-1.337A60.653 60.653 0 0 1 11.7 2.805Z" />
                <path d="M13.06 15.473a48.45 48.45 0 0 1 7.666-3.282c.134 1.414.22 2.843.255 4.284a.75.75 0 0 1-.46.71 47.87 47.87 0 0 0-8.105 4.342.75.75 0 0 1-.832 0 47.87 47.87 0 0 0-8.104-4.342.75.75 0 0 1-.461-.71c.035-1.442.121-2.87.255-4.286.921.304 1.83.634 2.726.99v1.27a1.5 1.5 0 0 0-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.66a6.727 6.727 0 0 0 .551-1.608 1.5 1.5 0 0 0 .14-2.67v-.645a48.549 48.549 0 0 1 3.44 1.667 2.25 2.25 0 0 0 2.12 0Z" />
              </svg>
            </div>
            <h2 class="auth-deco-heading">Already a member?</h2>
            <p class="auth-deco-body">
              Welcome back. Your courses, schedule, and progress are waiting for you right where you left off.
            </p>
            <button @click="mode = 'login'" class="auth-deco-cta">
              Sign In
            </button>
          </div>
        </Transition>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import { usePageTitle } from '../composables/usePageTitle'

usePageTitle('Login')

type LoginErrorState = {
  code: string
  title: string
  message: string
  details: string[]
  hint?: string
  rawDescription: string
}

const { loginWithRedirect, isAuthenticated } = useAuth0()
const route = useRoute()
const router = useRouter()

const mode = ref<'login' | 'register'>('login')
const LOGIN_RETURN_TO_KEY = 'login:returnTo'

const formatErrorCode = (errorCode: string) =>
  errorCode
    .split('_')
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')

const authError = computed<LoginErrorState | null>(() => {
  const errorCode = route.query.error
  const errorDescription = route.query.error_description

  if (typeof errorCode !== 'string') return null

  const rawDescription =
    typeof errorDescription === 'string' ? errorDescription : 'Authentication request failed.'

  const match = rawDescription.match(
    /^Client "([^"]+)" is not authorized to access resource server "([^"]+)"\.?$/,
  )

  if (match) {
    const [, clientId, audience] = match
    return {
      code: errorCode,
      title: 'Application is not authorized',
      message: 'The sign-in request asked Auth0 for an API that this application is not allowed to use.',
      details: [`Client ID: ${clientId}`, `API audience: ${audience}`],
      hint: 'Allow this Auth0 application to access the API, or remove the audience from the authorization request.',
      rawDescription,
    }
  }

  return { code: errorCode, title: formatErrorCode(errorCode), message: rawDescription, details: [], rawDescription }
})

const returnToPath = computed(() => {
  const r = route.query.redirect
  return typeof r === 'string' && r.startsWith('/') ? r : '/'
})

const redirectAfterLogin = async () => {
  if (!isAuthenticated.value) return
  const stored = sessionStorage.getItem(LOGIN_RETURN_TO_KEY)
  const next = stored?.startsWith('/') ? stored : '/'
  sessionStorage.removeItem(LOGIN_RETURN_TO_KEY)
  await router.replace(next)
}

async function loginWith(connection: string) {
  sessionStorage.setItem(LOGIN_RETURN_TO_KEY, returnToPath.value)
  try {
    await loginWithRedirect({
      authorizationParams: {
        connection,
        scope: 'openid profile email',
        redirect_uri: `${window.location.origin}/login`,
      },
    })
  } catch (e) {
    console.error('Login failed:', e)
  }
}

async function signUpWith(connection: string) {
  sessionStorage.setItem(LOGIN_RETURN_TO_KEY, returnToPath.value)
  try {
    await loginWithRedirect({
      authorizationParams: {
        connection,
        scope: 'openid profile email',
        redirect_uri: `${window.location.origin}/login`,
        screen_hint: 'signup',
      },
    })
  } catch (e) {
    console.error('Sign up failed:', e)
  }
}

watch(() => isAuthenticated.value, redirectAfterLogin)
onMounted(redirectAfterLogin)
</script>

<style scoped>
/* ─── Root ─────────────────────────────────────────────── */
.auth-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #f8f6ff 0%, #eef2ff 50%, #f0f9ff 100%);
  display: flex;
  flex-direction: column;
}

:global(.dark) .auth-root {
  background: linear-gradient(135deg, #0f0a1e 0%, #1a1035 50%, #0c1628 100%);
}

/* ─── Ambient orbs ─────────────────────────────────────── */
.auth-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  animation: orb-float 8s ease-in-out infinite;
}

.auth-orb--1 {
  width: 500px;
  height: 500px;
  top: -150px;
  left: -100px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%);
  animation-delay: 0s;
}

.auth-orb--2 {
  width: 400px;
  height: 400px;
  bottom: -100px;
  right: 30%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%);
  animation-delay: -3s;
}

.auth-orb--3 {
  width: 300px;
  height: 300px;
  top: 40%;
  right: -80px;
  background: radial-gradient(circle, rgba(167, 139, 250, 0.18) 0%, transparent 70%);
  animation-delay: -5s;
}

@keyframes orb-float {
  0%, 100% { transform: translateY(0) scale(1); }
  33%       { transform: translateY(-30px) scale(1.05); }
  66%       { transform: translateY(20px) scale(0.97); }
}

/* ─── Split layout ─────────────────────────────────────── */
.auth-split {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
}

.auth-form-side {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  min-height: 60vh;
}

@media (min-width: 768px) {
  .auth-split {
    flex-direction: row;
    min-height: 100vh;
  }

  .auth-form-side {
    min-height: 100vh;
  }
}

/* ─── Form box ─────────────────────────────────────────── */
.auth-form-box {
  width: 100%;
  max-width: 380px;
}

.auth-form-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 2rem;
}

.auth-brand-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-bottom: 1.25rem;
  box-shadow: 0 8px 24px rgba(124, 58, 237, 0.35);
}

.auth-title {
  font-size: 1.875rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: #0f172a;
  margin-bottom: 0.375rem;
}

:global(.dark) .auth-title {
  color: #f1f5f9;
}

.auth-subtitle {
  font-size: 0.9375rem;
  color: #64748b;
}

:global(.dark) .auth-subtitle {
  color: #94a3b8;
}

/* ─── Error ────────────────────────────────────────────── */
.auth-error {
  margin-bottom: 1.25rem;
  padding: 1rem;
  border-radius: 0.875rem;
  border: 1px solid rgba(251, 191, 36, 0.4);
  background: rgba(254, 243, 199, 0.7);
  backdrop-filter: blur(8px);
}

:global(.dark) .auth-error {
  background: rgba(120, 53, 15, 0.3);
  border-color: rgba(251, 191, 36, 0.3);
}

.auth-error-label {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #92400e;
  margin-bottom: 0.25rem;
}

:global(.dark) .auth-error-label {
  color: #fcd34d;
}

.auth-error-title {
  font-size: 1rem;
  font-weight: 600;
  color: #451a03;
}

:global(.dark) .auth-error-title {
  color: #fef3c7;
}

.auth-error-message {
  font-size: 0.8125rem;
  color: #78350f;
  margin-top: 0.25rem;
  line-height: 1.5;
}

:global(.dark) .auth-error-message {
  color: #fde68a;
}

.auth-error-details {
  font-size: 0.75rem;
  color: #92400e;
  margin-top: 0.5rem;
  padding-left: 1rem;
  list-style: disc;
}

:global(.dark) .auth-error-details {
  color: #fcd34d;
}

/* ─── OAuth buttons ────────────────────────────────────── */
.auth-btn-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.auth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.9375rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.auth-btn--light {
  background: #ffffff;
  color: #1e293b;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.auth-btn--light:hover {
  background: #f8fafc;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-1px);
}

:global(.dark) .auth-btn--light {
  background: #1e293b;
  color: #f1f5f9;
  border-color: #334155;
}

:global(.dark) .auth-btn--light:hover {
  background: #253447;
}

.auth-btn--dark {
  background: #0f172a;
  color: #f1f5f9;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
}

.auth-btn--dark:hover {
  background: #1e293b;
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
  transform: translateY(-1px);
}

:global(.dark) .auth-btn--dark {
  background: #0f172a;
  border: 1px solid #1e293b;
}

.auth-btn--blue {
  background: #1877f2;
  color: #fff;
  box-shadow: 0 1px 3px rgba(24,119,242,0.3);
}

.auth-btn--blue:hover {
  background: #1464d8;
  box-shadow: 0 4px 12px rgba(24,119,242,0.4);
  transform: translateY(-1px);
}

/* ─── Agree text ───────────────────────────────────────── */
.auth-agree {
  margin-top: 1rem;
  font-size: 0.75rem;
  text-align: center;
  color: #94a3b8;
  line-height: 1.6;
}

/* ─── Toggle link (mobile) ─────────────────────────────── */
.auth-toggle-link {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: #64748b;
}

:global(.dark) .auth-toggle-link {
  color: #94a3b8;
}

.auth-toggle-btn {
  color: #7c3aed;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.auth-toggle-btn:hover {
  text-decoration: underline;
}

:global(.dark) .auth-toggle-btn {
  color: #a78bfa;
}

/* ─── Decorative sliding panel ─────────────────────────── */
.auth-deco {
  display: none;
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;
  height: 100%;
  background: linear-gradient(145deg, #7c3aed 0%, #6d28d9 40%, #4338ca 100%);
  overflow: hidden;
  transition: transform 0.72s cubic-bezier(0.65, 0, 0.35, 1);
  transform: translateX(0);
  z-index: 10;
}

.auth-deco--shifted {
  transform: translateX(-100%);
}

/* Decorative blobs inside the panel */
.auth-deco-blob {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.auth-deco-blob--1 {
  width: 350px;
  height: 350px;
  top: -100px;
  right: -100px;
  background: rgba(255,255,255,0.08);
  animation: deco-pulse 6s ease-in-out infinite;
}

.auth-deco-blob--2 {
  width: 250px;
  height: 250px;
  bottom: 50px;
  left: -80px;
  background: rgba(255,255,255,0.06);
  animation: deco-pulse 8s ease-in-out infinite reverse;
}

.auth-deco-blob--3 {
  width: 180px;
  height: 180px;
  bottom: 180px;
  right: 60px;
  background: rgba(255,255,255,0.05);
  animation: deco-pulse 5s ease-in-out infinite;
  animation-delay: -2s;
}

@keyframes deco-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%       { transform: scale(1.12); opacity: 0.7; }
}

.auth-deco-inner {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  z-index: 1;
}

.auth-deco-content {
  text-align: center;
  color: #fff;
  max-width: 320px;
}

.auth-deco-glyph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
  border-radius: 1.5rem;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(12px);
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}

.auth-deco-heading {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  margin-bottom: 1rem;
}

.auth-deco-body {
  font-size: 1rem;
  line-height: 1.7;
  color: rgba(255,255,255,0.78);
  margin-bottom: 2.5rem;
}

.auth-deco-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 2.5rem;
  border-radius: 999px;
  border: 2px solid rgba(255,255,255,0.8);
  background: transparent;
  color: #fff;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  letter-spacing: 0.025em;
}

.auth-deco-cta:hover {
  background: #fff;
  color: #6d28d9;
  border-color: #fff;
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
  transform: translateY(-2px);
}

/* ─── Mobile toggle ────────────────────────────────────── */
.auth-mobile-toggle {
  position: relative;
  display: flex;
  align-items: center;
  align-self: center;
  margin: 1.5rem auto 0;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 999px;
  padding: 0.25rem;
  z-index: 20;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

:global(.dark) .auth-mobile-toggle {
  background: rgba(15, 23, 42, 0.9);
  border-color: rgba(255,255,255,0.1);
}

.auth-mobile-tab {
  position: relative;
  z-index: 1;
  padding: 0.5rem 1.5rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.3s ease;
}

.auth-mobile-tab--active {
  color: #fff;
}

:global(.dark) .auth-mobile-tab {
  color: #94a3b8;
}

:global(.dark) .auth-mobile-tab--active {
  color: #fff;
}

.auth-mobile-indicator {
  position: absolute;
  top: 0.25rem;
  left: 0.25rem;
  width: calc(50% - 0.25rem);
  height: calc(100% - 0.5rem);
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  border-radius: 999px;
  transition: transform 0.35s cubic-bezier(0.65, 0, 0.35, 1);
  z-index: 0;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.4);
}

.auth-mobile-indicator--right {
  transform: translateX(100%);
}

/* ─── Vue transitions ──────────────────────────────────── */
.auth-form-enter-active,
.auth-form-leave-active {
  transition: opacity 0.35s ease, transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.auth-form-enter-from {
  opacity: 0;
  transform: translateY(28px) scale(0.97);
}

.auth-form-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.97);
}

.auth-deco-text-enter-active,
.auth-deco-text-leave-active {
  transition: opacity 0.3s ease, transform 0.4s ease;
}

.auth-deco-text-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.auth-deco-text-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}

/* ─── Desktop: show deco panel ─────────────────────────── */
@media (min-width: 768px) {
  .auth-deco {
    display: block;
  }
}
</style>
