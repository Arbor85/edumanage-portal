<script setup lang="ts">
import { ref } from 'vue';
const menuOpen = ref(false);
</script>

<template>
<div class="flex min-h-screen">
  <!-- Side Menu -->
  <aside
    :class="[
      'bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-border-dark p-5 transition-all duration-300 z-40',
      'fixed md:static top-0 left-0 w-64 md:w-72',
      'h-screen md:h-screen',
      'flex flex-col',
      menuOpen ? 'translate-x-0' : '-translate-x-full',
      'md:translate-x-0'
    ]"
  >
    <div class="flex items-center justify-between mb-6 md:mb-10">
      <img src="/logo.png" alt="Logo" class="h-8 w-8 rounded-md object-contain" />
      <button
        class="md:hidden flex items-center justify-center size-9 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
        @click="menuOpen = false"
        aria-label="Close menu"
        v-if="menuOpen"
      >
        <span class="material-symbols-outlined text-slate-600 dark:text-slate-300">close</span>
      </button>
    </div>
    <nav class="flex flex-col gap-2 flex-1">
      <router-link
        to="/workouts"
        class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
        active-class="text-primary"
      >
        <span class="material-symbols-outlined">meeting_room</span>
        <span>Workouts</span>
      </router-link>
    </nav>
  </aside>

  <!-- Overlay for mobile -->
  <div
    v-if="menuOpen"
    class="fixed inset-0 bg-black/30 z-30 md:hidden"
    @click="menuOpen = false"
    aria-label="Close menu overlay"
  ></div>

  <!-- Main Content -->
  <div class="flex-1 md:pl-72">
    <header class="sticky top-0 z-30 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4 md:hidden flex items-center">
      <button
        class="flex items-center justify-center size-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
        @click="menuOpen = true"
        aria-label="Open menu"
      >
        <span class="material-symbols-outlined text-slate-600 dark:text-slate-300">menu</span>
      </button>
      <h2 class="ml-4 text-xl font-bold tracking-tight">EduManage Portal</h2>
    </header>
    <main class="p-6">
      <router-view />
    </main>
  </div>
</div>
</template>

@media (max-width: 767px) {
  aside {
    box-shadow: 0 2px 16px rgba(0,0,0,0.08);
  }
}
<style scoped></style>
