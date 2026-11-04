<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import { usePasswordAuth } from '../composables/usePasswordAuth'
import AppLogo from '../components/AppLogo.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseInput from '../components/BaseInput.vue'
import { Users, CalendarDays, TrendingUp, Zap, Award, BarChart2, Eye, EyeOff, AlertCircle } from '@lucide/vue'

const route = useRoute()
const router = useRouter()
const { loginWithRedirect } = useAuth0()
const ropg = usePasswordAuth()

// Local mode ref — decoupled from routing so transition direction is set
// BEFORE v-if flips, avoiding the same-tick race with Vue's watch flush.
const isSignup = ref(route.name === 'Signup')
const transition = ref('auth-slide-left')

function goToSignup() {
  transition.value = 'auth-slide-left'
  isSignup.value = true
  router.replace('/signup')
}

function goToLogin() {
  transition.value = 'auth-slide-right'
  isSignup.value = false
  router.replace('/login')
}

watchEffect(() => {
  document.title = `ArborCoach — ${isSignup.value ? 'Create Account' : 'Sign In'}`
})

const PANEL_TRANSITION = 'flex-basis 0.7s cubic-bezier(0.32,0.72,0,1)'

const leftStyle = computed(() => ({
  flexBasis: isSignup.value ? '45%' : '55%',
  flexShrink: '0',
  flexGrow: '0',
  transition: PANEL_TRANSITION,
}))
const rightStyle = computed(() => ({
  flexBasis: isSignup.value ? '55%' : '45%',
  flexShrink: '0',
  flexGrow: '0',
  transition: PANEL_TRANSITION,
}))

// ── Login form state ──────────────────────────────────────────
const loginEmail = ref('')
const loginPassword = ref('')
const showLoginPw = ref(false)
const loginLoading = ref(false)
const loginError = ref<string | null>(null)

async function handleSignIn() {
  loginError.value = null
  loginLoading.value = true
  try {
    await ropg.login(loginEmail.value, loginPassword.value)
    router.replace((route.query.redirect as string) ?? '/')
  } catch (err) {
    loginError.value = err instanceof Error ? err.message : 'Sign in failed.'
  } finally {
    loginLoading.value = false
  }
}

// ── Signup form state ─────────────────────────────────────────
const signupEmail = ref('')
const signupUsername = ref('')
const signupPassword = ref('')
const showSignupPw = ref(false)
const signupLoading = ref(false)
const signupError = ref<string | null>(null)

async function handleSignUp() {
  signupError.value = null
  if (signupPassword.value.length < 8) {
    signupError.value = 'Password must be at least 8 characters.'
    return
  }
  signupLoading.value = true
  try {
    await ropg.signup(signupEmail.value, signupUsername.value, signupPassword.value)
    router.replace('/')
  } catch (err) {
    signupError.value = err instanceof Error ? err.message : 'Sign up failed.'
  } finally {
    signupLoading.value = false
  }
}

// ── Feature lists ─────────────────────────────────────────────
const loginFeatures = [
  { icon: Users,       title: 'Client management', description: 'Organize clients, track progress, and manage memberships in one place.' },
  { icon: CalendarDays, title: 'Schedule & plans',  description: 'Build workout plans and schedule sessions with a visual calendar.' },
  { icon: TrendingUp,  title: 'Progress tracking',  description: 'Monitor performance metrics and celebrate milestones with clients.' },
]
const signupFeatures = [
  { icon: Zap,        title: 'Up and running in minutes',   description: 'Set up your profile, add clients, and schedule your first session today.' },
  { icon: Award,      title: 'Professional coaching tools', description: 'Everything a modern coach needs — plans, sessions, progress, and analytics.' },
  { icon: BarChart2,  title: 'Grow your business',          description: 'Track revenue, manage memberships, and scale your practice with confidence.' },
]
</script>

<template>
  <!-- ── Mobile layout (single column) ───────────────────────── -->
  <div class="lg:hidden min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center p-6">
    <div class="mb-8"><AppLogo size="lg" /></div>

    <div class="w-full max-w-sm">
      <Transition :name="transition" mode="out-in">
        <!-- Mobile login -->
        <div v-if="!isSignup" key="mobile-login">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome back</h2>
            <p class="text-sm text-text-secondary">Sign in to your ArborCoach account</p>
          </div>
          <form class="flex flex-col gap-4" @submit.prevent="handleSignIn">
            <BaseInput v-model="loginEmail" label="Email" type="email" placeholder="you@example.com" :disabled="loginLoading" autocomplete="email" />
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <label class="text-sm font-semibold text-text-primary dark:text-white">Password</label>
                <button type="button" class="text-xs text-primary hover:underline" @click="loginWithRedirect()">Forgot password?</button>
              </div>
              <div class="relative">
                <input v-model="loginPassword" :type="showLoginPw ? 'text' : 'password'" placeholder="••••••••" :disabled="loginLoading" autocomplete="current-password" class="auth-input" />
                <button type="button" class="pw-toggle" @click="showLoginPw = !showLoginPw">
                  <EyeOff v-if="showLoginPw" class="w-4 h-4" /><Eye v-else class="w-4 h-4" />
                </button>
              </div>
            </div>
            <div v-if="loginError" class="auth-error"><AlertCircle class="w-4 h-4 text-red-500 shrink-0 mt-0.5" /><p class="text-xs text-red-600 dark:text-red-400">{{ loginError }}</p></div>
            <BaseButton type="submit" variant="primary" :full-width="true" size="lg" :loading="loginLoading" :disabled="!loginEmail || !loginPassword">Sign In</BaseButton>
          </form>
          <div class="mt-4 text-center">
            <span class="text-sm text-text-secondary">No account?</span>
            <button class="ml-1.5 text-sm font-semibold text-primary hover:underline cursor-pointer" @click="goToSignup">Create one</button>
          </div>
        </div>

        <!-- Mobile signup -->
        <div v-else key="mobile-signup">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create your account</h2>
            <p class="text-sm text-text-secondary">Free to start. No credit card required.</p>
          </div>
          <form class="flex flex-col gap-4" @submit.prevent="handleSignUp">
            <BaseInput v-model="signupEmail" label="Email" type="email" placeholder="you@example.com" :disabled="signupLoading" autocomplete="email" />
            <BaseInput v-model="signupUsername" label="Username" type="text" placeholder="yourname" :disabled="signupLoading" autocomplete="username" />
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-text-primary dark:text-white">Password</label>
              <div class="relative">
                <input v-model="signupPassword" :type="showSignupPw ? 'text' : 'password'" placeholder="Min. 8 characters" :disabled="signupLoading" autocomplete="new-password" class="auth-input blue-focus" />
                <button type="button" class="pw-toggle" @click="showSignupPw = !showSignupPw">
                  <EyeOff v-if="showSignupPw" class="w-4 h-4" /><Eye v-else class="w-4 h-4" />
                </button>
              </div>
              <p class="text-xs text-text-secondary">At least 8 characters.</p>
            </div>
            <div v-if="signupError" class="auth-error"><AlertCircle class="w-4 h-4 text-red-500 shrink-0 mt-0.5" /><p class="text-xs text-red-600 dark:text-red-400">{{ signupError }}</p></div>
            <button type="submit" :disabled="signupLoading || !signupEmail || !signupUsername || !signupPassword" class="blue-btn">
              <span v-if="!signupLoading">Create Account</span>
              <span v-else class="flex items-center justify-center gap-2"><svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Creating…</span>
            </button>
          </form>
          <div class="mt-4 text-center">
            <span class="text-sm text-text-secondary">Already have an account?</span>
            <button class="ml-1.5 text-sm font-semibold text-blue-600 hover:underline cursor-pointer" @click="goToLogin">Sign in</button>
          </div>
        </div>
      </Transition>
    </div>
  </div>

  <!-- ── Desktop layout (two-panel) ──────────────────────────── -->
  <div class="hidden lg:flex min-h-screen overflow-hidden">

    <!-- Left panel -->
    <div class="relative overflow-hidden" :style="leftStyle">
      <!-- Green background (login mode) -->
      <div class="panel-bg transition-opacity duration-500" :style="{ opacity: isSignup ? 0 : 1, background: 'linear-gradient(145deg,#00C896 0%,#00876A 55%,#005C47 100%)' }" />
      <!-- White base (always underneath) -->
      <div class="panel-bg bg-white dark:bg-gray-950" style="z-index: 0" />

      <!-- Decorative circles (green panel) -->
      <div class="deco-circle -top-28 -right-28 w-96 h-96 transition-opacity duration-500" :style="{ opacity: isSignup ? 0 : 0.1 }" />
      <div class="deco-circle -bottom-36 -left-20 w-80 h-80 transition-opacity duration-500" :style="{ opacity: isSignup ? 0 : 0.1 }" />

      <div class="relative z-10 h-full">
        <div class="relative h-full overflow-hidden">
        <Transition :name="transition">
          <!-- Left: green brand (login) -->
          <div v-if="!isSignup" key="left-brand" class="h-full flex flex-col justify-between p-12">
            <div class="flex items-center gap-3">
              <svg class="w-10 h-10" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="10" fill="rgba(255,255,255,0.2)"/><rect x="6" y="25" width="8" height="9" rx="3" fill="white"/><rect x="16" y="19" width="8" height="15" rx="3" fill="white"/><rect x="26" y="13" width="8" height="21" rx="3" fill="white"/></svg>
              <span class="text-xl tracking-tight leading-none"><span class="font-bold text-white">Arbor</span><span class="font-medium text-white/70">Coach</span></span>
            </div>
            <div class="flex-1 flex flex-col justify-center py-16">
              <h1 class="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">Train smarter.<br />Coach better.</h1>
              <p class="text-white/70 text-lg mb-12 max-w-sm leading-relaxed">Everything you need to run a professional coaching business — from first session to long-term results.</p>
              <div class="flex flex-col gap-7">
                <div v-for="f in loginFeatures" :key="f.title" class="flex items-start gap-4">
                  <div class="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0"><component :is="f.icon" class="w-5 h-5 text-white" /></div>
                  <div><p class="text-white font-semibold text-sm mb-1">{{ f.title }}</p><p class="text-white/60 text-sm leading-relaxed">{{ f.description }}</p></div>
                </div>
              </div>
            </div>
            <p class="text-white/35 text-xs">© 2026 ArborCoach. All rights reserved.</p>
          </div>

          <!-- Left: signup form -->
          <div v-else key="left-signup" class="h-full flex flex-col items-center justify-center p-10">
            <div class="w-full max-w-sm">
              <div class="flex justify-center mb-8"><AppLogo size="md" /></div>
              <div class="text-center mb-8">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create your account</h2>
                <p class="text-sm text-text-secondary">Free to start. No credit card required.</p>
              </div>
              <form class="flex flex-col gap-4" @submit.prevent="handleSignUp">
                <BaseInput v-model="signupEmail" label="Email" type="email" placeholder="you@example.com" :disabled="signupLoading" autocomplete="email" />
                <BaseInput v-model="signupUsername" label="Username" type="text" placeholder="yourname" :disabled="signupLoading" autocomplete="username" />
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-semibold text-text-primary dark:text-white">Password</label>
                  <div class="relative">
                    <input v-model="signupPassword" :type="showSignupPw ? 'text' : 'password'" placeholder="Min. 8 characters" :disabled="signupLoading" autocomplete="new-password" class="auth-input blue-focus" />
                    <button type="button" class="pw-toggle" @click="showSignupPw = !showSignupPw"><EyeOff v-if="showSignupPw" class="w-4 h-4" /><Eye v-else class="w-4 h-4" /></button>
                  </div>
                  <p class="text-xs text-text-secondary">At least 8 characters.</p>
                </div>
                <div v-if="signupError" class="auth-error"><AlertCircle class="w-4 h-4 text-red-500 shrink-0 mt-0.5" /><p class="text-xs text-red-600 dark:text-red-400">{{ signupError }}</p></div>
                <button type="submit" :disabled="signupLoading || !signupEmail || !signupUsername || !signupPassword" class="blue-btn">
                  <span v-if="!signupLoading">Create Account</span>
                  <span v-else class="flex items-center justify-center gap-2"><svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Creating…</span>
                </button>
              </form>
              <div class="mt-4 text-center">
                <span class="text-sm text-text-secondary">Already have an account?</span>
                <button class="ml-1.5 text-sm font-semibold text-blue-600 hover:underline cursor-pointer" @click="goToLogin">Sign in</button>
              </div>
            </div>
          </div>
        </Transition>
        </div>
      </div>
    </div>

    <!-- Right panel -->
    <div class="relative overflow-hidden" :style="rightStyle">
      <!-- Blue background (signup mode) -->
      <div class="panel-bg transition-opacity duration-500" :style="{ opacity: isSignup ? 1 : 0, background: 'linear-gradient(145deg,#3B82F6 0%,#2563EB 55%,#1E3A8A 100%)' }" />
      <!-- White base -->
      <div class="panel-bg bg-white dark:bg-gray-950" style="z-index: 0" />

      <!-- Decorative circles (blue panel) -->
      <div class="deco-circle -top-28 -left-28 w-96 h-96 transition-opacity duration-500" :style="{ opacity: isSignup ? 0.1 : 0 }" />
      <div class="deco-circle -bottom-36 -right-20 w-80 h-80 transition-opacity duration-500" :style="{ opacity: isSignup ? 0.1 : 0 }" />

      <div class="relative z-10 h-full">
        <div class="relative h-full overflow-hidden">
        <Transition :name="transition">
          <!-- Right: login form -->
          <div v-if="!isSignup" key="right-login" class="h-full flex flex-col items-center justify-center p-10">
            <div class="w-full max-w-sm">
              <div class="flex justify-center mb-8"><AppLogo size="md" /></div>
              <div class="text-center mb-8">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome back</h2>
                <p class="text-sm text-text-secondary">Sign in to your ArborCoach account</p>
              </div>
              <form class="flex flex-col gap-4" @submit.prevent="handleSignIn">
                <BaseInput v-model="loginEmail" label="Email" type="email" placeholder="you@example.com" :disabled="loginLoading" autocomplete="email" />
                <div class="flex flex-col gap-1.5">
                  <div class="flex items-center justify-between">
                    <label class="text-sm font-semibold text-text-primary dark:text-white">Password</label>
                    <button type="button" class="text-xs text-primary hover:underline" @click="loginWithRedirect()">Forgot password?</button>
                  </div>
                  <div class="relative">
                    <input v-model="loginPassword" :type="showLoginPw ? 'text' : 'password'" placeholder="••••••••" :disabled="loginLoading" autocomplete="current-password" class="auth-input" />
                    <button type="button" class="pw-toggle" @click="showLoginPw = !showLoginPw"><EyeOff v-if="showLoginPw" class="w-4 h-4" /><Eye v-else class="w-4 h-4" /></button>
                  </div>
                </div>
                <div v-if="loginError" class="auth-error"><AlertCircle class="w-4 h-4 text-red-500 shrink-0 mt-0.5" /><p class="text-xs text-red-600 dark:text-red-400">{{ loginError }}</p></div>
                <BaseButton type="submit" variant="primary" :full-width="true" size="lg" :loading="loginLoading" :disabled="!loginEmail || !loginPassword">Sign In</BaseButton>
              </form>

              <div class="mt-4 text-center">
                <span class="text-sm text-text-secondary">Don't have an account?</span>
                <button class="ml-1.5 text-sm font-semibold text-primary hover:underline cursor-pointer" @click="goToSignup">Create one</button>
              </div>

              <div class="flex items-center gap-3 my-6">
                <div class="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                <span class="text-xs text-text-secondary shrink-0">or continue with</span>
                <div class="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
              </div>

              <div class="grid grid-cols-3 gap-3">
                <button class="social-btn" @click="loginWithRedirect({ authorizationParams: { connection: 'google-oauth2' } })">
                  <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  <span class="text-xs font-medium text-gray-700 dark:text-gray-300">Google</span>
                </button>
                <button class="social-btn" @click="loginWithRedirect({ authorizationParams: { connection: 'github' } })">
                  <svg class="w-4 h-4 shrink-0 text-gray-900 dark:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                  <span class="text-xs font-medium text-gray-700 dark:text-gray-300">GitHub</span>
                </button>
                <button class="social-btn" @click="loginWithRedirect({ authorizationParams: { connection: 'facebook' } })">
                  <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/></svg>
                  <span class="text-xs font-medium text-gray-700 dark:text-gray-300">Facebook</span>
                </button>
              </div>

              <p class="text-xs text-center text-text-secondary mt-6 leading-relaxed">
                By continuing you agree to our <span class="text-primary hover:underline cursor-pointer">Terms of Service</span> and <span class="text-primary hover:underline cursor-pointer">Privacy Policy</span>.
              </p>
            </div>
          </div>

          <!-- Right: blue brand (signup) -->
          <div v-else key="right-brand" class="h-full flex flex-col justify-between p-12">
            <div class="flex items-center gap-3">
              <svg class="w-10 h-10" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="10" fill="rgba(255,255,255,0.2)"/><rect x="6" y="25" width="8" height="9" rx="3" fill="white"/><rect x="16" y="19" width="8" height="15" rx="3" fill="white"/><rect x="26" y="13" width="8" height="21" rx="3" fill="white"/></svg>
              <span class="text-xl tracking-tight leading-none"><span class="font-bold text-white">Arbor</span><span class="font-medium text-white/70">Coach</span></span>
            </div>
            <div class="flex-1 flex flex-col justify-center py-16">
              <h1 class="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">Start your<br />coaching journey.</h1>
              <p class="text-white/70 text-lg mb-12 max-w-sm leading-relaxed">Join thousands of coaches who run their business with ArborCoach — from day one.</p>
              <div class="flex flex-col gap-7">
                <div v-for="f in signupFeatures" :key="f.title" class="flex items-start gap-4">
                  <div class="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0"><component :is="f.icon" class="w-5 h-5 text-white" /></div>
                  <div><p class="text-white font-semibold text-sm mb-1">{{ f.title }}</p><p class="text-white/60 text-sm leading-relaxed">{{ f.description }}</p></div>
                </div>
              </div>
            </div>
            <p class="text-white/35 text-xs">© 2026 ArborCoach. All rights reserved.</p>
          </div>
        </Transition>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* ── Shared input ────────────────────────────────────────────── */
.auth-input {
  width: 100%;
  padding: 0.625rem 2.5rem 0.625rem 0.75rem;
  min-height: 44px;
  border-radius: 0.75rem;
  border: 1.5px solid #e5e7eb;
  font-size: 0.875rem;
  background: white;
  color: #1a1d23;
  outline: none;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.auth-input::placeholder { color: #b0b7c8; }
.auth-input:hover { border-color: #d1d5db; }
.auth-input:focus-visible {
  border-color: #00C896;
  box-shadow: 0 0 0 3px rgba(0,200,150,0.15);
}
.auth-input:disabled { opacity: 0.5; cursor: not-allowed; }
.auth-input.blue-focus:hover { border-color: #93c5fd; }
.auth-input.blue-focus:focus-visible {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
}
.pw-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #8b92a5;
  transition: color 150ms ease;
  line-height: 0;
}
.pw-toggle:hover { color: #1a1d23; }
.auth-error {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  border-radius: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  padding: 0.75rem 0.875rem;
}

/* ── Blue button ─────────────────────────────────────────────── */
.blue-btn {
  width: 100%;
  height: 44px;
  border-radius: 0.75rem;
  background: #2563eb;
  color: white;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 150ms ease, opacity 150ms ease;
  box-shadow: 0 0 0 1px rgba(59,130,246,0.15), 0 4px 16px rgba(59,130,246,0.2);
  border: none;
}
.blue-btn:hover:not(:disabled) { background: #1d4ed8; }
.blue-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

/* ── Social button ───────────────────────────────────────────── */
.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 44px;
  border-radius: 0.75rem;
  border: 1.5px solid #e5e7eb;
  background: white;
  transition: background 150ms ease, border-color 150ms ease;
  cursor: pointer;
}
.social-btn:hover { background: #f9fafb; border-color: #d1d5db; }

/* ── Panel bg layers ─────────────────────────────────────────── */
.panel-bg {
  position: absolute;
  inset: 0;
  z-index: 1;
}
.deco-circle {
  position: absolute;
  border-radius: 9999px;
  background: white;
  pointer-events: none;
  z-index: 2;
}

/* ═══════════════════════════════════════════════════════════════
   Slide transitions — leaving elements go absolute so the
   entering element fills the space while both animate together
   ═══════════════════════════════════════════════════════════════ */

/* Login → Signup  (content sweeps left) */
.auth-slide-left-leave-active {
  position: absolute;
  inset: 0;
  z-index: 10;
  transition: transform 0.55s cubic-bezier(0.32,0.72,0,1), opacity 0.45s ease;
}
.auth-slide-left-leave-to { transform: translateX(-80px); opacity: 0; }

.auth-slide-left-enter-active {
  transition: transform 0.6s cubic-bezier(0.32,0.72,0,1), opacity 0.5s ease;
}
.auth-slide-left-enter-from { transform: translateX(80px); opacity: 0; }

/* Signup → Login  (content sweeps right) */
.auth-slide-right-leave-active {
  position: absolute;
  inset: 0;
  z-index: 10;
  transition: transform 0.55s cubic-bezier(0.32,0.72,0,1), opacity 0.45s ease;
}
.auth-slide-right-leave-to { transform: translateX(80px); opacity: 0; }

.auth-slide-right-enter-active {
  transition: transform 0.6s cubic-bezier(0.32,0.72,0,1), opacity 0.5s ease;
}
.auth-slide-right-enter-from { transform: translateX(-80px); opacity: 0; }
</style>
