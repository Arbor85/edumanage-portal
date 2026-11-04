<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePageTitle } from '../composables/usePageTitle'
usePageTitle('Create Account')
import { usePasswordAuth } from '../composables/usePasswordAuth'
import AppLogo from '../components/AppLogo.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseInput from '../components/BaseInput.vue'
import { Users, CalendarDays, TrendingUp, Eye, EyeOff, AlertCircle } from '@lucide/vue'

const ropg = usePasswordAuth()
const router = useRouter()

const email = ref('')
const username = ref('')
const password = ref('')
const showPassword = ref(false)

const validationError = ref<string | null>(null)

function validate(): boolean {
  validationError.value = null
  if (password.value.length < 8) {
    validationError.value = 'Password must be at least 8 characters.'
    return false
  }
  return true
}

async function handleSignUp() {
  if (!validate()) return
  try {
    await ropg.signup(email.value, username.value, password.value)
    router.replace('/')
  } catch {
    // error exposed via ropg.error
  }
}

const displayError = ref<string | null>(null)
import { watch } from 'vue'
watch([() => ropg.error.value, validationError], ([ropgErr, valErr]) => {
  displayError.value = valErr ?? ropgErr
})

const features = [
  {
    icon: Users,
    title: 'Client management',
    description: 'Organize clients, track progress, and manage memberships in one place.',
  },
  {
    icon: CalendarDays,
    title: 'Schedule & plans',
    description: 'Build workout plans and schedule sessions with a visual calendar.',
  },
  {
    icon: TrendingUp,
    title: 'Progress tracking',
    description: 'Monitor performance metrics and celebrate milestones with clients.',
  },
]
</script>

<template>
  <div class="min-h-screen flex flex-col lg:flex-row">
    <!-- Left brand panel (desktop only) -->
    <div
      class="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-12 overflow-hidden"
      style="background: linear-gradient(145deg, #00C896 0%, #00876A 55%, #005C47 100%)"
    >
      <div class="absolute -top-28 -right-28 w-96 h-96 rounded-full bg-white/10 pointer-events-none" />
      <div class="absolute -bottom-36 -left-20 w-80 h-80 rounded-full bg-white/10 pointer-events-none" />
      <div class="absolute top-1/2 right-10 w-52 h-52 rounded-full bg-white/5 pointer-events-none" />

      <div class="relative z-10 flex items-center gap-3">
        <svg class="w-10 h-10" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect width="40" height="40" rx="10" fill="rgba(255,255,255,0.2)" />
          <rect x="6" y="25" width="8" height="9" rx="3" fill="white" />
          <rect x="16" y="19" width="8" height="15" rx="3" fill="white" />
          <rect x="26" y="13" width="8" height="21" rx="3" fill="white" />
        </svg>
        <span class="text-xl tracking-tight leading-none">
          <span class="font-bold text-white">Arbor</span><span class="font-medium text-white/70">Coach</span>
        </span>
      </div>

      <div class="relative z-10 flex-1 flex flex-col justify-center py-16">
        <h1 class="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
          Start your<br />coaching journey.
        </h1>
        <p class="text-white/70 text-lg mb-12 max-w-sm leading-relaxed">
          Join ArborCoach and get everything you need to run a professional coaching business from day one.
        </p>

        <div class="flex flex-col gap-7">
          <div v-for="feature in features" :key="feature.title" class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <component :is="feature.icon" class="w-5 h-5 text-white" />
            </div>
            <div>
              <p class="text-white font-semibold text-sm mb-1">{{ feature.title }}</p>
              <p class="text-white/60 text-sm leading-relaxed">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <p class="relative z-10 text-white/35 text-xs">© 2026 ArborCoach. All rights reserved.</p>
    </div>

    <!-- Right signup panel -->
    <div class="flex-1 flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-950 min-h-screen lg:min-h-0">
      <div class="lg:hidden mb-10">
        <AppLogo size="lg" />
      </div>

      <div class="w-full max-w-sm">
        <div class="hidden lg:flex justify-center mb-8">
          <AppLogo size="md" />
        </div>

        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create your account</h2>
          <p class="text-sm text-text-secondary">Free to start. No credit card required.</p>
        </div>

        <form class="flex flex-col gap-4" @submit.prevent="handleSignUp">
          <BaseInput
            v-model="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            :disabled="ropg.isLoading.value"
            autocomplete="email"
          />

          <BaseInput
            v-model="username"
            label="Username"
            type="text"
            placeholder="yourname"
            :disabled="ropg.isLoading.value"
            autocomplete="username"
          />

          <!-- Password with show/hide toggle -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-text-primary dark:text-white">Password</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Min. 8 characters"
                :disabled="ropg.isLoading.value"
                autocomplete="new-password"
                class="w-full px-3 py-2.5 pr-10 min-h-[44px] rounded-xl border text-sm bg-white dark:bg-surface-input text-text-primary dark:text-white placeholder:text-text-muted outline-none
                  transition-[border-color,box-shadow] duration-150
                  hover:border-gray-300 dark:hover:border-white/20
                  focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary
                  disabled:opacity-50 disabled:cursor-not-allowed
                  border-gray-200 dark:border-white/10"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary dark:hover:text-white transition-colors"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
            <p class="text-xs text-text-secondary">At least 8 characters.</p>
          </div>

          <!-- Error message -->
          <div
            v-if="displayError"
            class="flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 px-3.5 py-3"
          >
            <AlertCircle class="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p class="text-xs text-red-600 dark:text-red-400">{{ displayError }}</p>
          </div>

          <BaseButton
            type="submit"
            variant="primary"
            :full-width="true"
            size="lg"
            :loading="ropg.isLoading.value"
            :disabled="!email || !username || !password"
          >
            Create Account
          </BaseButton>
        </form>

        <div class="mt-4 text-center">
          <span class="text-sm text-text-secondary">Already have an account?</span>
          <router-link to="/login" class="ml-1.5 text-sm font-semibold text-primary hover:underline">
            Sign in
          </router-link>
        </div>

        <p class="text-xs text-center text-text-secondary mt-8 leading-relaxed">
          By creating an account you agree to our
          <span class="text-primary hover:underline cursor-pointer">Terms of Service</span>
          and
          <span class="text-primary hover:underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>

      <p class="lg:hidden mt-16 text-xs text-text-secondary">© 2026 ArborCoach</p>
    </div>
  </div>
</template>
