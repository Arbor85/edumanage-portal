<script setup lang="ts">
defineProps<{
  step: number
  totalSteps: number
  canGoBack: boolean
  canContinue: boolean
  continueLabel?: string
  loading?: boolean
}>()

defineEmits<{
  back: []
  next: []
}>()
</script>

<template>
  <div class="min-h-screen bg-surface-page flex flex-col px-6 py-8">
    <!-- Progress dots -->
    <div class="flex items-center justify-center gap-2 mb-10">
      <div
        v-for="i in totalSteps"
        :key="i"
        class="rounded-full transition-all duration-300"
        :class="i === step
          ? 'w-6 h-2 bg-primary'
          : i < step
            ? 'w-2 h-2 bg-primary/50'
            : 'w-2 h-2 bg-white/20'"
      />
    </div>

    <!-- Content -->
    <div class="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
      <slot />
    </div>

    <!-- Navigation -->
    <div class="max-w-md w-full mx-auto mt-8 flex items-center gap-3">
      <button
        v-if="canGoBack"
        class="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all active:scale-[0.97]"
        @click="$emit('back')"
      >
        ←
      </button>
      <button
        :disabled="!canContinue || loading"
        class="flex-1 h-14 rounded-xl font-bold text-base transition-all active:scale-[0.97] disabled:opacity-40"
        :class="canContinue
          ? 'bg-primary text-white shadow-glow hover:bg-primary-dark'
          : 'bg-surface-input text-text-muted cursor-not-allowed'"
        @click="$emit('next')"
      >
        <span v-if="loading" class="flex items-center justify-center gap-2">
          <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Saving…
        </span>
        <span v-else>{{ continueLabel ?? 'Continue' }}</span>
      </button>
    </div>
  </div>
</template>
