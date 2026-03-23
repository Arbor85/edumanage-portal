<template>
  <!-- Desktop side nav (md and above) -->
  <nav
    id="main-sidebar"
    class="max-md:hidden sticky top-0 z-10 flex h-screen w-20 flex-col shrink-0 overflow-y-auto border-r border-slate-200 bg-white/95 text-slate-900 shadow-[8px_0_16px_-14px_rgba(15,23,42,0.3)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-100 dark:shadow-[8px_0_16px_-14px_rgba(2,6,23,0.65)] lg:w-56"
  >
    <router-link to="/">
      <span class="mb-2 flex items-center justify-center p-4 md:px-2 lg:justify-start lg:gap-3 lg:p-8">
        <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
          <component :is="brandIcon" :size="20" />
        </span>
        <span class="text-xl font-bold tracking-tight hidden dark:text-white lg:inline">EduMan</span>
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
          :aria-current="isActive(link.to) ? 'page' : undefined"
        >
          <component :is="link.icon" :size="20" />
          <span class="ml-3 hidden lg:inline">{{ link.label }}</span>
        </router-link>
      </li>

      <li class="mt-auto pb-8" v-if="loginLink">
        <router-link
          :to="loginLink.to"
          class="flex w-full items-center px-4 py-4 text-base font-medium text-slate-900 transition-all duration-200 md:justify-center lg:justify-start lg:gap-3 lg:px-7 dark:text-slate-100"
          :class="isActive(loginLink.to)
            ? 'bg-slate-200 text-slate-900 dark:bg-slate-600 dark:text-slate-100'
            : 'hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-600 dark:hover:text-slate-100'"
          :aria-current="isActive(loginLink.to) ? 'page' : undefined"
        >
          <component :is="loginLink.icon" :size="20" />
          <span class="ml-3 hidden lg:inline">{{ loginLink.label }}</span>
        </router-link>
      </li>
      <span
        v-if="showIndicator"
        class="pointer-events-none absolute right-0 w-1 rounded-l bg-emerald-500 transition-all duration-300 ease-in-out dark:bg-emerald-400"
        :style="indicatorStyle"
      />
    </ul>
  </nav>

  <!-- Mobile magic bottom nav -->
  <nav
    class="md:hidden fixed bottom-0 left-0 right-0 z-50"
    aria-label="Main navigation"
  >
    <div class="flex h-[64px] items-stretch shadow-[0_-1px_0_rgba(0,0,0,0.07)] dark:shadow-[0_-1px_0_rgba(255,255,255,0.06)]">
      <router-link
        v-for="link in mobileNavLinks"
        :key="link.to"
        :to="link.to"
        :aria-current="isActive(link.to) ? 'page' : undefined"
        class="relative flex flex-1 items-center justify-center"
      >
        <div
          class="flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 ease-out"
          :class="isActive(link.to)
            ? '-translate-y-5 bg-emerald-500 shadow-[0_6px_20px_rgba(16,185,129,0.4)]'
            : 'translate-y-0 bg-transparent'"
        >
          <component
            :is="link.icon"
            :size="20"
            :class="isActive(link.to) ? 'text-white' : 'text-slate-400 dark:text-slate-500'"
          />
        </div>
      </router-link>
    </div>
  </nav>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch, type ComponentPublicInstance } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { useRoute } from 'vue-router';
import { Home, Users, Dumbbell, CalendarDays, ClipboardList, User, LogIn, CalendarClock, BookOpen } from 'lucide-vue-next';

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
      { label: 'Meetings', to: '/meetings', icon: CalendarClock, requiresAuth: true, guestOnly: false },
      { label: 'Courses', to: '/courses', icon: BookOpen, requiresAuth: true, guestOnly: false },
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
      if (!isAuthenticated.value) return login;
      return null;
    });

    const mobileNavLinks = computed(() => {
      const links = [...mainNavLinks.value];
      if (loginLink.value) links.push(loginLink.value);
      return links;
    });

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
      mobileNavLinks,
      isActive,
      listRef,
      setItemRef,
      showIndicator,
      indicatorStyle,
    };
  }
});
</script>
