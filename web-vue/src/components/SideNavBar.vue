<template>
  <nav class="h-screen w-52 bg-slate-800 text-white pt-5 fixed left-0 top-0">
    <ul class="list-none p-0">
      <li class="my-5">
        <router-link to="/" class="block px-4 py-2 rounded hover:bg-slate-700 transition-colors" active-class="bg-slate-700">Home</router-link>
      </li>
      <li class="my-5">
        <router-link to="/profile" class="block px-4 py-2 rounded hover:bg-slate-700 transition-colors" active-class="bg-slate-700">Profile</router-link>
      </li>
      <!-- Add more navigation links as needed -->
    </ul>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SideNavBar',
});
</script>


