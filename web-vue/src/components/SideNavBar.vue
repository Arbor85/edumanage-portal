<template>
  <nav
    class="h-screen w-56 shrink-0 overflow-y-auto text-slate-900 shadow-xl dark:text-slate-100 border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl"
  >
    <!-- Side navigation content here -->
    <ul ref="listRef" class="relative list-none pt-8 flex flex-col gap-2 min-h-full">
      <li
        v-for="(link, index) in mainNavLinks"
        :key="link.to"
        :ref="(el) => setItemRef(el, index)"
      >
        <router-link
          :to="link.to"
          class="flex w-full items-center gap-3 px-7 py-4 font-medium text-base transition-all duration-200 text-slate-900 dark:text-slate-100"
          :class="isActive(link.to)
            ? 'bg-slate-400 text-slate-900 dark:bg-slate-600 dark:text-slate-100'
            : 'hover:bg-slate-400 hover:text-slate-900 dark:hover:bg-slate-600 dark:hover:text-slate-100'"
          @click="handleLinkClick"
          :aria-current="isActive(link.to) ? 'page' : undefined"
        >
          <component :is="link.icon" :size="20" />
          {{ link.label }}
        </router-link>
      </li>

      <li class="mt-auto pb-8" v-if="loginLink">
        <router-link
          :to="loginLink.to"
          class="flex w-full items-center gap-3 px-7 py-4 font-medium text-base transition-all duration-200 text-slate-900 dark:text-slate-100"
          :class="isActive(loginLink.to)
            ? 'bg-slate-400 text-slate-900 dark:bg-slate-600 dark:text-slate-100'
            : 'hover:bg-slate-400 hover:text-slate-900 dark:hover:bg-slate-600 dark:hover:text-slate-100'"
          @click="handleLinkClick"
          :aria-current="isActive(loginLink.to) ? 'page' : undefined"
        >
          <component :is="loginLink.icon" :size="20" />
          {{ loginLink.label }}
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

    const linkCollection = [
      { label: 'Home', to: '/', icon: Home, requiresAuth: false, guestOnly: false },
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
