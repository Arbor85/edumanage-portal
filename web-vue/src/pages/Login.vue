
<template>
  <div class="flex flex-col items-center justify-center h-full">
    <h1 class="text-3xl font-bold mb-4">Login</h1>
    <p class="mb-6">Please log in to access your account.</p>
    <LoginButton />
    <div class="mt-8 flex flex-col gap-3 w-64">
      <button @click="loginWith('google-oauth2')" class="bg-white text-gray-800 border border-gray-300 rounded px-4 py-2 flex items-center justify-center gap-2 hover:bg-gray-100 transition">
        <img src="//cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" class="h-4 w-4" />
        Continue with Google
      </button>
      <button @click="loginWith('github')" class="bg-gray-900 text-white rounded px-4 py-2 flex items-center justify-center gap-2 hover:bg-gray-800 transition">
        <img src="//cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="GitHub" class="h-4 w-4 bg-white rounded-full" />
        Continue with GitHub
      </button>
      <button @click="loginWith('facebook')" class="bg-blue-600 text-white rounded px-4 py-2 flex items-center justify-center gap-2 hover:bg-blue-700 transition">
        <img src="//cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg" alt="Facebook" class="h-4 w-4 bg-white rounded-full" />
        Continue with Facebook
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoginButton from '../components/LoginButton.vue';
import { useAuth0 } from '@auth0/auth0-vue';

const { loginWithRedirect } = useAuth0();

function loginWith(connection: string) {
  loginWithRedirect({ connection });
}
</script>
