<template>
  <nav
    class="h-screen w-56 shrink-0 overflow-y-auto bg-slate-200 text-slate-900 shadow-xl dark:bg-slate-800 dark:text-slate-100"
  >
    <!-- Side navigation content here -->
    <ul ref="listRef" class="relative list-none p-0 bg-slate-300 flex flex-col gap-2 min-h-full dark:bg-slate-700">
      <li
        v-for="(link, index) in navLinks"
        :key="link.to"
        :ref="(el) => setItemRef(el, index)"
      >
        <router-link
          :to="link.to"
          class="flex w-full items-center px-7 py-4 font-medium text-base transition-all duration-200 text-slate-900 dark:text-slate-100"
          :class="isActive(link.to)
            ? 'text-slate-900 dark:text-slate-100'
            : 'hover:bg-slate-400 hover:text-slate-900 dark:hover:bg-slate-600 dark:hover:text-slate-100'"
          @click="handleLinkClick"
          :aria-current="isActive(link.to) ? 'page' : undefined"
        >
          {{ link.label }}
        </router-link>
      </li>

      <span
        v-if="showIndicator"
        class="pointer-events-none absolute right-0 w-1 rounded-l bg-emerald-500 transition-all duration-300 ease-in-out dark:bg-emerald-400"
        :style="indicatorStyle"
      />
    </ul>
  </nav>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch, type ComponentPublicInstance } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'SideNavBar',
  setup() {
    const { isAuthenticated } = useAuth0();
    const route = useRoute();
    const listRef = ref<HTMLElement | null>(null);
    const itemRefs = ref<HTMLElement[]>([]);
    const indicatorTop = ref(0);
    const indicatorHeight = ref(0);
    const showIndicator = ref(false);

    const linkCollection = [
      { label: 'Home', to: '/', requiresAuth: false, guestOnly: false },
      { label: 'Clients', to: '/clients', requiresAuth: true, guestOnly: false },
      { label: 'Excercises', to: '/excercises', requiresAuth: false, guestOnly: false },
      { label: 'Routines', to: '/routines', requiresAuth: true, guestOnly: false },
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

    const setItemRef = (
      element: Element | ComponentPublicInstance | null,
      index: number,
    ) => {
      if (element instanceof HTMLElement) {
        itemRefs.value[index] = element;
      }
    };

    const updateIndicator = () => {
      const activeIndex = navLinks.value.findIndex(link => isActive(link.to));
      const activeItem = itemRefs.value[activeIndex];

      if (!listRef.value || !activeItem) {
        showIndicator.value = false;
        return;
      }

      indicatorTop.value = activeItem.offsetTop;
      indicatorHeight.value = activeItem.offsetHeight;
      showIndicator.value = true;
    };

    const indicatorStyle = computed(() => ({
      top: `${indicatorTop.value}px`,
      height: `${indicatorHeight.value}px`,
    }));

    const syncIndicator = async () => {
      await nextTick();
      updateIndicator();
    };

    watch(
      [() => route.path, navLinks],
      () => {
        syncIndicator();
      },
      { immediate: true },
    );

    const onResize = () => {
      updateIndicator();
    };

    onMounted(() => {
      window.addEventListener('resize', onResize);
      syncIndicator();
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', onResize);
    });

    return {
      navLinks,
      handleLinkClick,
      isActive,
      listRef,
      setItemRef,
      showIndicator,
      indicatorStyle,
    };
  }
});
</script>
