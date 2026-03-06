<template>
  <div>
    <button
      type="button"
      @click="openDialog"
      :class="[
        'inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
        modelValue
          ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'
          : 'border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700'
      ]"
    >
      {{ selectedButtonText }}
    </button>

    <div
      v-if="isOpen"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4"
      @click.self="closeDialog"
    >
      <div class="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Select client</h3>
          <button
            type="button"
            @click="closeDialog"
            class="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        <div class="mb-3">
          <input
            v-model.trim="searchQuery"
            type="text"
            placeholder="Search clients by name..."
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            autofocus
          />
        </div>

        <div class="mb-3 grid grid-cols-2 gap-2">
          <select
            v-model="selectedStatus"
            class="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="">All statuses</option>
            <option v-for="status in availableStatuses" :key="status" :value="status">{{ status }}</option>
          </select>

          <select
            v-model="selectedTag"
            class="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="">All tags</option>
            <option v-for="tag in availableTags" :key="tag" :value="tag">{{ tag }}</option>
          </select>
        </div>

        <div class="max-h-96 space-y-2 overflow-auto rounded-md border border-slate-300 p-2 dark:border-slate-600">
          <div
            v-for="client in filteredClients"
            :key="client.invitationCode"
            @click="selectClient(client)"
            :class="[
              'flex cursor-pointer items-center gap-3 rounded px-3 py-2 transition-colors',
              draftSelection === client.name
                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                : 'hover:bg-slate-100 dark:hover:bg-slate-700'
            ]"
          >
            <img
              v-if="client.imageUrl"
              :src="client.imageUrl"
              :alt="client.name"
              class="h-10 w-10 rounded-full object-cover"
            />
            <div
              v-else
              class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-300 text-sm font-semibold text-slate-700 dark:bg-slate-600 dark:text-slate-200"
            >
              {{ client.name.charAt(0).toUpperCase() }}
            </div>

            <div class="flex-1 min-w-0">
              <p class="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                {{ client.name }}
              </p>
              <div class="flex items-center gap-2 mt-0.5">
                <span
                  :class="[
                    'inline-block rounded-full px-2 py-0.5 text-[10px] font-medium',
                    client.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : client.status === 'Suspended'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                  ]"
                >
                  {{ client.status }}
                </span>
                <span class="text-xs text-slate-500 dark:text-slate-400">
                  {{ client.tags.slice(0, 2).join(', ') }}{{ client.tags.length > 2 ? '...' : '' }}
                </span>
              </div>
            </div>

            <div
              v-if="draftSelection === client.name"
              class="text-emerald-600 dark:text-emerald-400"
            >
              ✓
            </div>
          </div>

          <p v-if="options.length === 0" class="px-2 py-3 text-center text-sm text-slate-500 dark:text-slate-300">
            No clients available.
          </p>

          <p
            v-else-if="filteredClients.length === 0"
            class="px-2 py-3 text-center text-sm text-slate-500 dark:text-slate-300"
          >
            No clients match your search or filters.
          </p>
        </div>

        <div class="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            @click="closeDialog"
            class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="applySelection"
            :disabled="!draftSelection"
            class="inline-flex items-center rounded-md border border-emerald-500 bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Client } from '../types/client'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    options?: Client[]
    buttonText?: string
  }>(),
  {
    modelValue: '',
    options: () => [],
    buttonText: 'Select client',
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const isOpen = ref(false)
const draftSelection = ref<string>(props.modelValue)
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedTag = ref('')

const availableStatuses = computed(() => {
  const uniqueStatuses = new Set<string>()

  for (const client of props.options) {
    if (client.status) {
      uniqueStatuses.add(client.status)
    }
  }

  return [...uniqueStatuses].sort((left, right) => left.localeCompare(right))
})

const availableTags = computed(() => {
  const uniqueTags = new Set<string>()

  for (const client of props.options) {
    for (const tag of client.tags) {
      uniqueTags.add(tag)
    }
  }

  return [...uniqueTags].sort((left, right) => left.localeCompare(right))
})

const filteredClients = computed(() => {
  const normalizedQuery = searchQuery.value.trim().toLowerCase()

  return props.options.filter((client) => {
    const matchesSearch = !normalizedQuery || client.name.toLowerCase().includes(normalizedQuery)
    const matchesStatus = !selectedStatus.value || client.status === selectedStatus.value
    const matchesTag = !selectedTag.value || client.tags.some(tag => tag === selectedTag.value)

    return matchesSearch && matchesStatus && matchesTag
  })
})

const selectedButtonText = computed(() => {
  if (props.modelValue) {
    return props.modelValue
  }

  return props.buttonText
})

watch(
  () => props.modelValue,
  (value) => {
    if (!isOpen.value) {
      draftSelection.value = value
    }
  },
)

const openDialog = () => {
  draftSelection.value = props.modelValue
  searchQuery.value = ''
  selectedStatus.value = ''
  selectedTag.value = ''
  isOpen.value = true
}

const closeDialog = () => {
  isOpen.value = false
}

const selectClient = (client: Client) => {
  draftSelection.value = client.name
  emit('update:modelValue', draftSelection.value)
  closeDialog()
}

const applySelection = () => {
  emit('update:modelValue', draftSelection.value)
  closeDialog()
}

defineExpose({
  openDialog
})
</script>
