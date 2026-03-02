<template>
  <div v-if="isAuthenticated" ref="containerRef" class="relative">
    <div
      role="button"
      tabindex="0"
      @click="toggleDetails"
      @keydown.enter.prevent="toggleDetails"
      @keydown.space.prevent="toggleDetails"
      class="h-10 w-10 rounded-full overflow-hidden border border-gray-300 bg-white flex items-center justify-center dark:border-slate-600 dark:bg-slate-800"
      :aria-expanded="isOpen"
      aria-label="Toggle profile details"
    >
      <img
        :src="displayImage"
        :alt="user?.name || 'Profile picture'"
        class="block h-full w-full object-cover"
        referrerpolicy="no-referrer"
        @error="onImageError"
      />
    </div>

    <div v-if="isOpen" class="absolute right-0 top-full pt-2 z-50">
      <div class="w-72 rounded-lg border border-gray-200 bg-white shadow p-4 dark:border-slate-700 dark:bg-slate-800">
        <div class="flex items-center gap-3 mb-3">
          <img
            :src="displayImage"
            :alt="user?.name || 'Profile picture'"
            class="block h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-slate-600"
            referrerpolicy="no-referrer"
            @error="onImageError"
          />
          <div>
            <p class="font-semibold text-slate-900 dark:text-slate-100">{{ user?.name || user?.nickname || 'User' }}</p>
            <p class="text-sm text-slate-600 dark:text-slate-300">{{ user?.email || 'No email available' }}</p>
          </div>
        </div>

        <dl class="text-sm space-y-2">
          <div class="flex justify-between gap-3">
            <dt class="text-slate-500 dark:text-slate-400">Nickname</dt>
            <dd class="text-slate-900 text-right dark:text-slate-100">{{ user?.nickname || '-' }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-slate-500 dark:text-slate-400">Email verified</dt>
            <dd class="text-slate-900 dark:text-slate-100">{{ user?.email_verified ? 'Yes' : 'No' }}</dd>
          </div>
        </dl>

        <div class="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between dark:border-slate-700">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import LogoutButton from './LogoutButton.vue'
import ThemeToggle from './ThemeToggle.vue'

const { isAuthenticated, user } = useAuth0()

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const imageFailedToLoad = ref(false)

const fallbackImage = computed(() => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='100%' height='100%' fill='#E5E7EB'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='24' fill='#374151'>${(
      (user.value?.name || user.value?.nickname || 'U')[0] || 'U'
    ).toUpperCase()}</text></svg>`,
  )}`
})

const displayImage = computed(() => {
  if (!imageFailedToLoad.value && user.value?.picture) {
    return user.value.picture
  }

  return fallbackImage.value
})

watch(
  () => user.value?.picture,
  () => {
    imageFailedToLoad.value = false
  },
)

watch(
  () => isAuthenticated.value,
  (value) => {
    if (!value) {
      isOpen.value = false
    }
  },
)

const toggleDetails = () => {
  isOpen.value = !isOpen.value
}

const onImageError = () => {
  imageFailedToLoad.value = true
}

const onDocumentClick = (event: MouseEvent) => {
  const target = event.target as Node
  if (!containerRef.value?.contains(target)) {
    isOpen.value = false
  }
}

const onDocumentKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onDocumentKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onDocumentKeydown)
})
</script>