<template>
  <button
    type="button"
    class="fixed left-4 top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-900 shadow-sm transition-colors hover:bg-slate-100 md:hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
    @click="toggleMobileMenu"
    :aria-expanded="isMobileMenuOpen"
    aria-controls="main-sidebar"
    aria-label="Toggle navigation menu"
  >
    <component :is="isMobileMenuOpen ? closeIcon : menuIcon" :size="20" />
  </button>

  <div
    v-if="isMobileMenuOpen"
    class="fixed inset-0 z-40 bg-slate-950/45 md:hidden"
    @click="closeMobileMenu"
    aria-hidden="true"
  />

  <nav
    id="main-sidebar"
    class="fixed inset-y-0 left-0 z-50 h-screen min-h-full w-56 shrink-0 overflow-y-auto border-r border-slate-200 bg-white/95 text-slate-900 shadow-[8px_0_16px_-14px_rgba(15,23,42,0.3)] backdrop-blur-xl transition-all duration-300 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-100 dark:shadow-[8px_0_16px_-14px_rgba(2,6,23,0.65)] md:sticky md:top-0 md:z-10 md:translate-x-0 md:bg-white/70 md:dark:bg-slate-900/70 lg:w-56"
    :class="[
      isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
      'md:left-auto md:inset-y-auto md:w-20 lg:w-56',
    ]"
  >
    <router-link to="/">
      <span class="mb-2 flex items-center justify-center p-4 md:px-2 lg:justify-start lg:gap-3 lg:p-8">
        <span
          class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
          <component :is="brandIcon" :size="20" />
        </span>
        <span class="text-xl font-bold tracking-tight md:hidden dark:text-white lg:inline">EduMan</span>
      </span>
    </router-link>

    <ul ref="listRef" class="relative list-none flex flex-col gap-2">
      <li v-for="(link, index) in mainNavLinks" :key="link.to" :ref="(el) => setItemRef(el, index)">
        <router-link
          :to="link.to"
          class="flex w-full items-center px-4 py-4 text-base font-medium text-slate-900 transition-all duration-200 md:justify-center lg:justify-start lg:gap-3 lg:px-7 dark:text-slate-100"
          :class="isActive(link.to)
            ? 'bg-slate-200 text-slate-900 dark:bg-slate-600 dark:text-slate-100'
            : 'hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-600 dark:hover:text-slate-100'"
          @click="handleLinkClick"
          :aria-current="isActive(link.to) ? 'page' : undefined"
        >
          <component :is="link.icon" :size="20" />
          <span class="ml-3 md:hidden lg:inline">{{ link.label }}</span>
        </router-link>
      </li>

      <li class="mt-auto pb-8" v-if="loginLink">
        <router-link
          :to="loginLink.to"
          class="flex w-full items-center px-4 py-4 text-base font-medium text-slate-900 transition-all duration-200 md:justify-center lg:justify-start lg:gap-3 lg:px-7 dark:text-slate-100"
          :class="isActive(loginLink.to)
            ? 'bg-slate-200 text-slate-900 dark:bg-slate-600 dark:text-slate-100'
            : 'hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-600 dark:hover:text-slate-100'"
          @click="handleLinkClick"
          :aria-current="isActive(loginLink.to) ? 'page' : undefined"
        >
          <component :is="loginLink.icon" :size="20" />
          <span class="ml-3 md:hidden lg:inline">{{ loginLink.label }}</span>
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
import { Home, Users, Dumbbell, CalendarDays, ClipboardList, User, LogIn, CalendarClock, Menu, X  } from 'lucide-vue-next';

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
    const menuIcon = Menu;
    const closeIcon = X;
    const isMobileMenuOpen = ref(false);

    const linkCollection = [
      { label: 'Feed', to: '/', icon: Home, requiresAuth: false, guestOnly: false },
      { label: 'Clients', to: '/clients', icon: Users, requiresAuth: true, guestOnly: false },
      { label: 'Excercises', to: '/excercises', icon: Dumbbell, requiresAuth: false, guestOnly: false },
      { label: 'Routines', to: '/routines', icon: CalendarDays, requiresAuth: true, guestOnly: false },
      { label: 'Plans', to: '/plans', icon: ClipboardList, requiresAuth: true, guestOnly: false },
      { label: 'Meetings', to: '/meetings', icon: CalendarClock, requiresAuth: true, guestOnly: false },
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
      if (window.matchMedia('(max-width: 767px)').matches) {
        isMobileMenuOpen.value = false;
      }
    };

    const toggleMobileMenu = () => {
      isMobileMenuOpen.value = !isMobileMenuOpen.value;
    };

    const closeMobileMenu = () => {
      isMobileMenuOpen.value = false;
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
      if (window.matchMedia('(min-width: 768px)').matches) {
        isMobileMenuOpen.value = false;
      }
      updateIndicator();
    };

    watch(
      () => route.path,
      () => {
        if (window.matchMedia('(max-width: 767px)').matches) {
          isMobileMenuOpen.value = false;
        }
      },
    );

    onMounted(() => {
      window.addEventListener('resize', onResize);
      syncIndicator();
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', onResize);
    });

    return {
      brandIcon,
      menuIcon,
      closeIcon,
      mainNavLinks,
      loginLink,
      handleLinkClick,
      toggleMobileMenu,
      closeMobileMenu,
      isMobileMenuOpen,
      isActive,
      listRef,
      setItemRef,
      showIndicator,
      indicatorStyle,
    };
  }
});
</script>
