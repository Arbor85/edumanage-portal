<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen bg-surface-page flex items-center justify-center p-6">
    <div class="text-center">
      <h1 class="text-3xl font-black text-white mb-2">Welcome</h1>
      <p class="text-text-secondary mb-8">Onboarding coming in Phase 3.</p>
      <button
        class="px-6 py-3 bg-primary text-white font-bold rounded-xl active:scale-[0.97] transition-transform"
        @click="router.push('/')"
      >
        Go to Today
      </button>
    </div>
  </div>
</template>
