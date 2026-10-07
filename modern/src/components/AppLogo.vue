<script setup lang="ts">
defineProps<{
  size?: 'sm' | 'md' | 'lg'
  hideText?: boolean
}>()
</script>

<template>
  <div class="flex items-center gap-2.5 select-none">
    <!-- Logomark: ascending bars (gym progress, planning, education levels) -->
    <svg
      :class="{
        'w-7 h-7': size === 'sm',
        'w-8 h-8': !size || size === 'md',
        'w-12 h-12': size === 'lg',
      }"
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="10" fill="#00C896" />
      <!-- Three ascending bars, bottom-aligned — gym/progress/curriculum levels -->
      <rect x="6" y="25" width="8" height="9" rx="3" fill="white" />
      <rect x="16" y="19" width="8" height="15" rx="3" fill="white" />
      <rect x="26" y="13" width="8" height="21" rx="3" fill="white" />
    </svg>

    <!-- Wordmark -->
    <span v-if="!hideText" :class="{
      'text-[13px]': size === 'sm',
      'text-[15px]': !size || size === 'md',
      'text-[22px]': size === 'lg',
    }" class="tracking-tight leading-none">
      <span class="font-bold text-gray-900 dark:text-white">Arbor</span><span class="font-medium text-text-secondary dark:text-white/60">Coach</span>
    </span>
  </div>
</template>
