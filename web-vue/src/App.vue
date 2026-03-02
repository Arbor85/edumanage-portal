<script setup lang="ts">
import SideNavBar from './components/SideNavBar.vue';
import ProfileIcon from './components/ProfileIcon.vue';

</script>

<template>
  <div class="flex w-full h-screen">
    <SideNavBar />
    
    <div class="p-6 w-full content md:ml-52">
      <div class="fixed top-4 right-4 z-40 flex items-center gap-2">
        <ProfileIcon />
      </div>
      <RouterView />
    </div>
  </div>
</template>


