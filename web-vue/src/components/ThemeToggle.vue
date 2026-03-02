<template>
  <button
    type="button"
    @click="toggleTheme"
    class="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
    :aria-label="`Switch to ${isDarkTheme ? 'light' : 'dark'} theme`"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      class="h-4 w-4"
      aria-hidden="true"
    >
      <path
        fill-rule="evenodd"
        d="M9.315 3.584A6.75 6.75 0 0 1 18.75 9.75c0 2.11-.965 3.988-2.474 5.227a.75.75 0 0 0-.276.58v.693a2.25 2.25 0 0 1-2.25 2.25h-3.5A2.25 2.25 0 0 1 8 16.25v-.693a.75.75 0 0 0-.276-.58A6.75 6.75 0 0 1 5.25 9.75a6.75 6.75 0 0 1 4.065-6.166ZM9.5 20.25a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75Z"
        clip-rule="evenodd"
      />
    </svg>
    <span class="sr-only">{{ isDarkTheme ? 'Light mode' : 'Dark mode' }}</span>
  </button>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const isDarkTheme = ref(false)

const applyTheme = (isDark: boolean) => {
  document.documentElement.classList.toggle('dark', isDark)
}

onMounted(() => {
  isDarkTheme.value = document.documentElement.classList.contains('dark')
})

watch(isDarkTheme, (value) => {
  localStorage.setItem('theme', value ? 'dark' : 'light')
  applyTheme(value)
})

const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value
}
</script>
