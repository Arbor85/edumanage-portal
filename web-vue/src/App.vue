<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue'
import HelloWorld from './components/HelloWorld.vue'
import LoginButton from './components/LoginButton.vue';

const { isAuthenticated, isLoading, error } = useAuth0();

</script>

<template>
  <div v-if="isLoading" class="loading-state">
    <div class="loading-text">Loading...</div>
  </div>

  <div v-else-if="error" class="error-state">
    <div class="error-title">Oops!</div>
    <div class="error-message">Something went wrong</div>
    <div class="error-sub-message">{{ error.message }}</div>
  </div>

  <div v-else>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <div v-if="isAuthenticated">isAuthenticated</div>
  <div v-else><LoginButton /></div>
  <HelloWorld msg="Vite + Vue" />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
