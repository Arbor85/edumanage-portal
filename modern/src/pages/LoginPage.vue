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
