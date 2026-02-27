<template>
  <nav class="h-screen w-52 bg-slate-800 text-white pt-5 fixed left-0 top-0">
    <!-- Logo at the top -->
    <div class="mb-6 flex items-center justify-center">
      <div class="bg-[#10b981] rounded-full p-2 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          class="lucide lucide-dumbbell w-6 h-6 text-white">
          <path d="M14.4 14.4 9.6 9.6"></path>
          <path
            d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z">
          </path>
          <path d="m21.5 21.5-1.4-1.4"></path>
          <path d="M3.9 3.9 2.5 2.5"></path>
          <path
            d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z">
          </path>
        </svg>
      </div>
    </div>
    <!-- Side navigation content here -->
    <ul class="list-none p-0 bg-slate-700 rounded-xl shadow-lg mx-4 mt-2 mb-4 flex flex-col gap-6 py-6">
      <li>
        <router-link to="/" class="block px-6 py-3 rounded-lg hover:bg-slate-600 transition-colors font-medium text-base"
          active-class="bg-slate-600">Home</router-link>
      </li>
      <li>
        <router-link to="/profile" class="block px-6 py-3 rounded-lg hover:bg-slate-600 transition-colors font-medium text-base"
          active-class="bg-slate-600">Profile</router-link>
      </li>
      <li v-if="!isAuthenticated">
        <router-link to="/login" class="block px-6 py-3 rounded-lg hover:bg-slate-600 transition-colors font-medium text-base"
          active-class="bg-slate-600">Login</router-link>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';

export default defineComponent({
  name: 'SideNavBar',
  setup() {
    const { isAuthenticated } = useAuth0();
    return { isAuthenticated };
  }
});
</script>
