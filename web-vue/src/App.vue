<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue'
import LoginButton from './components/LoginButton.vue';
import LogoutButton from './components/LogoutButton.vue';

import SideNavBar from './components/SideNavBar.vue';

const { isAuthenticated, error } = useAuth0();

</script>

<template>
  <div class="flex w-full h-screen">
    <SideNavBar />
    
    <div class="ml-52 p-6 w-full content">
      <div v-if="error" class="bg-red-100 text-red-800 p-4 rounded mb-4">
        <div class="font-bold text-lg mb-1">Oops!</div>
        <div class="mb-1">Something went wrong</div>
        <div class="text-sm">{{ error.message }}</div>
      </div>
      <div class="flex gap-4 mb-6">
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" class="h-24 p-6 transition-filter duration-300 hover:drop-shadow-[0_0_2em_#646cffaa]" alt="Vite logo" />
        </a>
        <a href="https://vuejs.org/" target="_blank">
          <img src="./assets/vue.svg" class="h-24 p-6 transition-filter duration-300 hover:drop-shadow-[0_0_2em_#42b883aa]" alt="Vue logo" />
        </a>
      </div>
      <div v-if="isAuthenticated"><LogoutButton /></div>
      <div v-else><LoginButton /></div>
      <RouterLink to="/profile" class="inline-block mt-4 text-blue-600 hover:underline">Go to Profile</RouterLink>
      <RouterView />
    </div>
  </div>
</template>


