<script setup lang="ts">
import SideNavBar from './components/SideNavBar.vue';

</script>

<template>
  <div class="flex w-full h-screen">
    <SideNavBar />
    
    <div class="p-6 w-full content md:ml-52">
      <RouterView />
    </div>
  </div>
</template>


