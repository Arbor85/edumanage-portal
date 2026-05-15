<script setup lang="ts">
import { ref, computed } from 'vue'
import { useClientStore } from '../../stores/clientStore'
import BaseAvatar from '../BaseAvatar.vue'

const props = defineProps<{
  modelValue: string | null
  label?: string
  error?: string
  disabled?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [val: string | null] }>()

const clientStore = useClientStore()
const search = ref('')
const open = ref(false)

const filtered = computed(() =>
  clientStore.active.filter((c) =>
    !search.value || c.name?.toLowerCase().includes(search.value.toLowerCase())
  )
)

const selected = computed(() =>
  clientStore.clients.find((c) => c.invitationCode === props.modelValue) ?? null
)

function pick(code: string | null) {
  emit('update:modelValue', code)
  open.value = false
  search.value = ''
}
</script>

<template>
  <div class="flex flex-col gap-1 relative">
    <label v-if="label" class="text-sm font-medium text-text-primary dark:text-white">{{ label }}</label>

    <!-- Trigger -->
    <button
      type="button"
      :disabled="disabled"
      class="flex items-center gap-2 px-3 py-2.5 min-h-[44px] rounded-xl border text-sm text-left bg-white dark:bg-surface-dark text-text-primary dark:text-white outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
      :class="error ? 'border-red-400' : 'border-gray-200 dark:border-white/10'"
      @click="open = !open"
    >
      <BaseAvatar v-if="selected" :name="selected.name ?? '?'" size="xs" />
      <span class="flex-1 truncate">{{ selected?.name ?? 'Select client...' }}</span>
      <span class="text-text-secondary">▾</span>
    </button>

    <!-- Dropdown -->
    <div
      v-if="open"
      class="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl shadow-lg overflow-hidden"
    >
      <div class="p-2 border-b border-gray-100 dark:border-white/10">
        <input
          v-model="search"
          placeholder="Search clients..."
          class="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-white/5 rounded-lg outline-none text-text-primary dark:text-white placeholder:text-text-secondary focus-visible:ring-1 focus-visible:ring-primary"
          @click.stop
        />
      </div>
      <ul class="max-h-48 overflow-y-auto custom-scrollbar py-1">
        <li>
          <button type="button" class="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-gray-50 dark:hover:bg-white/5" @click="pick(null)">
            — None —
          </button>
        </li>
        <li v-for="client in filtered" :key="client.invitationCode ?? ''">
          <button
            type="button"
            class="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
            :class="modelValue === client.invitationCode ? 'bg-primary/10' : ''"
            @click="pick(client.invitationCode)"
          >
            <BaseAvatar :name="client.name ?? '?'" size="xs" />
            {{ client.name }}
          </button>
        </li>
        <li v-if="!filtered.length" class="px-3 py-4 text-sm text-center text-text-secondary">No clients found</li>
      </ul>
    </div>

    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
  </div>
</template>
