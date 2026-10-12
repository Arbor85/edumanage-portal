<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, X } from '@lucide/vue'
import BaseModal from '../../../components/BaseModal.vue'
import BaseButton from '../../../components/BaseButton.vue'
import { exerciseImageMap } from '../../../data/exerciseImageMap'

const props = defineProps<{
  open: boolean
  current: string | null
}>()
const emit = defineEmits<{
  select: [{ imagePath: string; gifPath: string }]
  close: []
}>()

const PAGE_SIZE = 60

const allEntries = Object.entries(exerciseImageMap)
  .filter(([, v]) => v.imagePath)
  .map(([name, paths]) => ({ name, imagePath: paths.imagePath!, gifPath: paths.gifPath ?? null }))
  .sort((a, b) => a.name.localeCompare(b.name))

const query = ref('')

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? allEntries.filter(e => e.name.includes(q)) : allEntries
})

const visible = computed(() => filtered.value.slice(0, PAGE_SIZE))

function capitalize(s: string) {
  return s.replace(/\b\w/g, c => c.toUpperCase())
}

function select(entry: typeof allEntries[number]) {
  emit('select', { imagePath: entry.imagePath, gifPath: entry.gifPath ?? '' })
}
</script>

<template>
  <BaseModal :open="open" title="Select Image" size="xl" @close="emit('close')">
    <div class="flex flex-col gap-4 h-full">
      <!-- Search -->
      <div class="relative flex-shrink-0">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
        <input
          v-model="query"
          type="text"
          placeholder="Search exercises..."
          class="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-surface-input dark:bg-surface-input text-sm text-text-primary dark:text-white placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button v-if="query" class="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary" @click="query = ''">
          <X class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Count -->
      <p class="text-xs text-text-secondary flex-shrink-0">
        Showing {{ visible.length }} of {{ filtered.length }} images
      </p>

      <!-- Grid -->
      <div class="flex-1 overflow-y-auto custom-scrollbar min-h-0">
        <div class="grid gap-2" style="grid-template-columns: repeat(auto-fill, minmax(120px, 1fr))">
          <button
            v-for="entry in visible"
            :key="entry.name"
            type="button"
            class="flex flex-col rounded-xl overflow-hidden border-2 transition-all text-left group"
            :class="current === entry.imagePath
              ? 'border-primary ring-2 ring-primary/30'
              : 'border-gray-200 dark:border-white/10 hover:border-primary/50'"
            @click="select(entry)"
          >
            <div class="aspect-square bg-gray-100 dark:bg-surface-input overflow-hidden">
              <img
                :src="entry.imagePath"
                :alt="entry.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                loading="lazy"
              />
            </div>
            <div class="px-1.5 py-1 bg-white dark:bg-surface-card">
              <p class="text-[10px] text-text-secondary dark:text-white/60 leading-tight line-clamp-2 capitalize">
                {{ capitalize(entry.name) }}
              </p>
            </div>
          </button>
        </div>

        <p v-if="visible.length === 0" class="text-center text-text-secondary py-12 text-sm">
          No images match "{{ query }}"
        </p>
        <p v-else-if="filtered.length > PAGE_SIZE" class="text-center text-xs text-text-secondary mt-4">
          Refine your search to see more results
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end">
        <BaseButton variant="ghost" @click="emit('close')">Cancel</BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
