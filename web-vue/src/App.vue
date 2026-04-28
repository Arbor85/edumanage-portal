<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import SideNavBar from './components/SideNavBar.vue';
import ProfileIcon from './components/ProfileIcon.vue';

const route = useRoute();

const applyTheme = (isDark: boolean) => {
  document.documentElement.classList.toggle('dark', isDark);
};

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDarkTheme = savedTheme ? savedTheme === 'dark' : prefersDark;
  applyTheme(isDarkTheme);
});
</script>

<template>
  <!-- Standalone routes (login, etc.) bypass the shell layout -->
  <RouterView v-if="route.meta.standalone" />

  <div v-else class="flex w-full min-h-screen bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">
    <SideNavBar />
    <div class="p-6 pb-24 md:pb-6 w-full content">
      <div class="fixed top-4 right-4 z-40 flex items-center gap-2">
        <ProfileIcon />
      </div>
      <RouterView />
    </div>
  </div>
</template>


