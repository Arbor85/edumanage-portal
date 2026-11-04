<script setup lang="ts">
import { usePageTitle } from '../composables/usePageTitle'
usePageTitle('Sign In')
import { useAuth0 } from '@auth0/auth0-vue'
import AppLogo from '../components/AppLogo.vue'
import BaseButton from '../components/BaseButton.vue'
import { Users, CalendarDays, TrendingUp } from '@lucide/vue'

const { loginWithRedirect } = useAuth0()

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
      <!-- Decorative circles -->
      <div class="absolute -top-28 -right-28 w-96 h-96 rounded-full bg-white/10 pointer-events-none" />
      <div class="absolute -bottom-36 -left-20 w-80 h-80 rounded-full bg-white/10 pointer-events-none" />
      <div class="absolute top-1/2 right-10 w-52 h-52 rounded-full bg-white/5 pointer-events-none" />

      <!-- Logo -->
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

      <!-- Headline + features -->
      <div class="relative z-10 flex-1 flex flex-col justify-center py-16">
        <h1 class="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
          Train smarter.<br />Coach better.
        </h1>
        <p class="text-white/70 text-lg mb-12 max-w-sm leading-relaxed">
          Everything you need to run a professional coaching business — from first session to long-term results.
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

      <!-- Footer -->
      <p class="relative z-10 text-white/35 text-xs">© 2026 ArborCoach. All rights reserved.</p>
    </div>

    <!-- Right login panel -->
    <div class="flex-1 flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-950 min-h-screen lg:min-h-0">
      <!-- Mobile logo -->
      <div class="lg:hidden mb-10">
        <AppLogo size="lg" />
      </div>

      <div class="w-full max-w-sm">
        <!-- Desktop logo -->
        <div class="hidden lg:flex justify-center mb-8">
          <AppLogo size="md" />
        </div>

        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome back</h2>
          <p class="text-sm text-text-secondary">Sign in to your ArborCoach account to continue</p>
        </div>

        <div class="flex flex-col gap-3">
          <BaseButton variant="primary" :full-width="true" size="lg" @click="loginWithRedirect()">
            Sign In
          </BaseButton>
          <BaseButton
            variant="secondary"
            :full-width="true"
            size="lg"
            @click="loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })"
          >
            Create Account
          </BaseButton>
        </div>

        <!-- Divider -->
        <div class="flex items-center gap-3 my-6">
          <div class="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
          <span class="text-xs text-text-secondary shrink-0">or continue with</span>
          <div class="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
        </div>

        <!-- Social login buttons -->
        <div class="grid grid-cols-3 gap-3">
          <button
            class="flex items-center justify-center gap-2 h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150 cursor-pointer"
            @click="loginWithRedirect({ authorizationParams: { connection: 'google-oauth2' } })"
          >
            <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span class="text-xs font-medium text-gray-700 dark:text-gray-300">Google</span>
          </button>

          <button
            class="flex items-center justify-center gap-2 h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150 cursor-pointer"
            @click="loginWithRedirect({ authorizationParams: { connection: 'github' } })"
          >
            <svg class="w-4 h-4 shrink-0 text-gray-900 dark:text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            <span class="text-xs font-medium text-gray-700 dark:text-gray-300">GitHub</span>
          </button>

          <button
            class="flex items-center justify-center gap-2 h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150 cursor-pointer"
            @click="loginWithRedirect({ authorizationParams: { connection: 'facebook' } })"
          >
            <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
            </svg>
            <span class="text-xs font-medium text-gray-700 dark:text-gray-300">Facebook</span>
          </button>
        </div>

        <p class="text-xs text-center text-text-secondary mt-8 leading-relaxed">
          By continuing you agree to our
          <span class="text-primary hover:underline cursor-pointer">Terms of Service</span>
          and
          <span class="text-primary hover:underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>

      <p class="lg:hidden mt-16 text-xs text-text-secondary">© 2026 ArborCoach</p>
    </div>
  </div>
</template>
