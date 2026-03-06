<template>
  <nav
    class="sticky top-0 self-start h-screen min-h-full w-56 shrink-0 overflow-y-auto border-r border-slate-200 bg-white/70 text-slate-900 shadow-[8px_0_16px_-14px_rgba(15,23,42,0.3)] transition-shadow duration-200 hover:shadow-[12px_0_24px_-16px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-100 dark:shadow-[8px_0_16px_-14px_rgba(2,6,23,0.65)] dark:hover:shadow-[12px_0_24px_-16px_rgba(2,6,23,0.9)]">
    <router-link to="/">
      <span class="mb-2 flex items-center gap-3 p-8">
        <span
          class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
          <component :is="brandIcon" :size="20" />
        </span>
        <span class="text-xl font-bold tracking-tight dark:text-white">EduMan</span>
      </span>
    </router-link>
    <!-- Side navigation content here -->
    <ul ref="listRef" class="relative list-none flex flex-col gap-2">
      <li v-for="(link, index) in mainNavLinks" :key="link.to" :ref="(el) => setItemRef(el, index)">
        <router-link :to="link.to"
          class="flex w-full items-center gap-3 px-7 py-4 font-medium text-base transition-all duration-200 text-slate-900 dark:text-slate-100"
          :class="isActive(link.to)
            ? 'bg-slate-200 text-slate-900 dark:bg-slate-600 dark:text-slate-100'
            : 'hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-600 dark:hover:text-slate-100'"
          @click="handleLinkClick" :aria-current="isActive(link.to) ? 'page' : undefined">
          <component :is="link.icon" :size="20" />
          {{ link.label }}
        </router-link>
      </li>

      <li class="mt-auto pb-8" v-if="loginLink">
        <router-link :to="loginLink.to"
          class="flex w-full items-center gap-3 px-7 py-4 font-medium text-base transition-all duration-200 text-slate-900 dark:text-slate-100"
          :class="isActive(loginLink.to)
            ? 'bg-slate-200 text-slate-900 dark:bg-slate-600 dark:text-slate-100'
            : 'hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-600 dark:hover:text-slate-100'"
          @click="handleLinkClick" :aria-current="isActive(loginLink.to) ? 'page' : undefined">
          <component :is="loginLink.icon" :size="20" />
          {{ loginLink.label }}
        </router-link>
      </li>

      <span v-if="showIndicator"
        class="pointer-events-none absolute right-0 w-1 rounded-l bg-emerald-500 transition-all duration-300 ease-in-out dark:bg-emerald-400"
        :style="indicatorStyle" />
    </ul>
  </nav>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch, type ComponentPublicInstance } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { useRoute } from 'vue-router';
import { Home, Users, Dumbbell, CalendarDays, ClipboardList, User, LogIn } from 'lucide-vue-next';

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
    const brandIcon = Dumbbell;

    const linkCollection = [
      { label: 'Feed', to: '/', icon: Home, requiresAuth: false, guestOnly: false },
      { label: 'Clients', to: '/clients', icon: Users, requiresAuth: true, guestOnly: false },
      { label: 'Excercises', to: '/excercises', icon: Dumbbell, requiresAuth: false, guestOnly: false },
      { label: 'Routines', to: '/routines', icon: CalendarDays, requiresAuth: true, guestOnly: false },
      { label: 'Plans', to: '/plans', icon: ClipboardList, requiresAuth: true, guestOnly: false },
      { label: 'Profile', to: '/profile', icon: User, requiresAuth: true, guestOnly: false },
      { label: 'Login', to: '/login', icon: LogIn, requiresAuth: false, guestOnly: true }
    ];

    const mainNavLinks = computed(() => linkCollection.filter(link => {
      if (link.to === '/login') return false; // Exclude login from main nav
      if (link.requiresAuth) return isAuthenticated.value;
      if (link.guestOnly) return !isAuthenticated.value;
      return true;
    }));

    const loginLink = computed(() => {
      const login = linkCollection.find(link => link.to === '/login');
      if (!login) return null;
      if (!isAuthenticated.value) return login; // Show only when not authenticated
      return null;
    });

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
      const activeIndex = mainNavLinks.value.findIndex(link => isActive(link.to));
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
      [() => route.path, mainNavLinks],
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
      brandIcon,
      mainNavLinks,
      loginLink,
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
