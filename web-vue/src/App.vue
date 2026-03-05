<script setup lang="ts">
import { onMounted } from 'vue';
import SideNavBar from './components/SideNavBar.vue';
import ProfileIcon from './components/ProfileIcon.vue';

const applyTheme = (isDark: boolean) => {
  document.documentElement.classList.toggle('dark', isDark);
};

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDarkTheme = savedTheme ? savedTheme === 'dark' : prefersDark;
  applyTheme(isDarkTheme);
  //bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800
});
</script>

<template>
  <div class="flex w-full min-h-screen bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">
    <SideNavBar />
    
    <div class="p-6 w-full content">
      <div class="fixed top-4 right-4 z-40 flex items-center gap-2">
        <ProfileIcon />
      </div>
      <RouterView />
    </div>
  </div>
</template>


