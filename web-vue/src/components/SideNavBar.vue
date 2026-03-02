<template>
  <nav
    class="h-screen w-56 shrink-0 overflow-y-auto bg-slate-200 text-slate-900 shadow-xl dark:bg-slate-800 dark:text-slate-100"
  >
    <!-- Side navigation content here -->
    <ul class="list-none p-0 bg-slate-300 flex flex-col gap-2 min-h-full dark:bg-slate-700">
      <li v-for="link in navLinks" :key="link.to">
        <router-link
          :to="link.to"
          class="flex items-center px-7 py-4 rounded-lg font-medium text-base transition-all duration-200 text-slate-900 dark:text-slate-100"
          :class="isActive(link.to) ? 'bg-emerald-400 text-slate-900 shadow-inner hover:text-slate-900' : 'hover:bg-slate-400 hover:text-slate-900 dark:hover:bg-slate-600 dark:hover:text-slate-100'"
          @click="handleLinkClick"
          :aria-current="isActive(link.to) ? 'page' : undefined"
        >
          {{ link.label }}
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'SideNavBar',
  setup() {
    const { isAuthenticated } = useAuth0();
    const route = useRoute();
    const linkCollection = [
      { label: 'Home', to: '/', requiresAuth: false, guestOnly: false },
      { label: 'Profile', to: '/profile', requiresAuth: true, guestOnly: false },
      { label: 'Login', to: '/login', requiresAuth: false, guestOnly: true }
    ];

    const navLinks = computed(() => linkCollection.filter(link => {
      if (link.requiresAuth) return isAuthenticated.value;
      if (link.guestOnly) return !isAuthenticated.value;
      return true;
    }));

    const handleLinkClick = () => {
      /* nav remains open */
    };

    const isActive = (path: string) => route.path === path;

    return { navLinks, handleLinkClick, isActive };
  }
});
</script>
