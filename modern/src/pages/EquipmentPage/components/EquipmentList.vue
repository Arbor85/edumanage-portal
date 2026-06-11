<script setup lang="ts">
import type { EquipmentOut, UserEquipmentSave } from '../../../types'
import { Pencil, Dumbbell, User, ShieldCheck } from 'lucide-vue-next'

const props = defineProps<{
  equipment: EquipmentOut[]
  loading: boolean
  userSelections: Map<string, UserEquipmentSave>
}>()

const emit = defineEmits<{
  edit: [item: EquipmentOut]
  'update:userSelections': [v: Map<string, UserEquipmentSave>]
}>()

function isOwned(id: string): boolean {
  return props.userSelections.has(id)
}

function toggleOwned(item: EquipmentOut) {
  const next = new Map(props.userSelections)
  if (next.has(item.id)) {
    next.delete(item.id)
  } else {
    next.set(item.id, {
      equipmentId: item.id,
      availableWeights: item.equipmentType === 'weight' ? [...(item.weightOptions ?? [])] : null,
    })
  }
  emit('update:userSelections', next)
}

function toggleWeight(item: EquipmentOut, weight: number) {
  const existing = props.userSelections.get(item.id)
  if (!existing) return
  const current = existing.availableWeights ?? []
  const next = new Map(props.userSelections)
  next.set(item.id, {
    ...existing,
    availableWeights: current.includes(weight)
      ? current.filter((w) => w !== weight)
      : [...current, weight].sort((a, b) => a - b),
  })
  emit('update:userSelections', next)
}

function hasWeight(item: EquipmentOut, weight: number): boolean {
  return props.userSelections.get(item.id)?.availableWeights?.includes(weight) ?? false
}
</script>

<template>
  <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <div
      v-for="i in 6"
      :key="i"
      class="h-28 rounded-2xl bg-gray-100 dark:bg-white/5 animate-pulse"
    />
  </div>

  <div v-else-if="!equipment.length" class="text-center py-16 text-text-secondary">
    No equipment found. Add some to get started.
  </div>

  <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <div
      v-for="item in equipment"
      :key="item.id"
      class="rounded-2xl border bg-white dark:bg-surface-dark transition-colors"
      :class="isOwned(item.id)
        ? 'border-primary/40 ring-1 ring-primary/20'
        : 'border-gray-100 dark:border-white/10'"
    >
      <!-- Card header -->
      <div class="flex items-start gap-3 p-4">
        <div
          class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          :class="item.equipmentType === 'bodyweight'
            ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
            : 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400'"
        >
          <User v-if="item.equipmentType === 'bodyweight'" class="w-4 h-4" />
          <Dumbbell v-else class="w-4 h-4" />
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5">
            <p class="font-semibold text-text-primary dark:text-white truncate">{{ item.name ?? '—' }}</p>
            <ShieldCheck v-if="item.isCore" class="w-3.5 h-3.5 flex-shrink-0 text-amber-500" title="Core equipment" />
          </div>
          <span
            class="inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-0.5"
            :class="item.equipmentType === 'bodyweight'
              ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
              : 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400'"
          >
            {{ item.equipmentType === 'bodyweight' ? 'Bodyweight' : 'Weight' }}
          </span>
        </div>

        <button
          class="p-1.5 rounded-lg text-text-secondary hover:text-text-primary dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex-shrink-0"
          title="Edit"
          @click="emit('edit', item)"
        >
          <Pencil class="w-4 h-4" />
        </button>
      </div>

      <!-- Weight options (catalog) -->
      <div v-if="item.equipmentType === 'weight' && item.weightOptions?.length" class="px-4 pb-3">
        <p class="text-xs text-text-secondary mb-2">Available weights (kg):</p>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="w in item.weightOptions"
            :key="w"
            class="text-xs px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-white/10 text-text-secondary"
          >
            {{ w }}
          </span>
        </div>
      </div>

      <!-- Owned toggle + my weights -->
      <div class="border-t border-gray-100 dark:border-white/10 px-4 py-3 flex flex-col gap-3">
        <label class="flex items-center gap-3 cursor-pointer select-none">
          <div
            class="relative w-10 h-6 rounded-full transition-colors flex-shrink-0"
            :class="isOwned(item.id) ? 'bg-primary' : 'bg-gray-200 dark:bg-white/20'"
            @click="toggleOwned(item)"
          >
            <span
              class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
              :class="isOwned(item.id) ? 'translate-x-4' : 'translate-x-0.5'"
            />
          </div>
          <span class="text-sm font-medium text-text-primary dark:text-white">I own this</span>
        </label>

        <div v-if="isOwned(item.id) && item.equipmentType === 'weight' && item.weightOptions?.length" class="flex flex-col gap-1.5">
          <p class="text-xs text-text-secondary">My weights (kg) — uncheck to remove:</p>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="w in item.weightOptions"
              :key="w"
              type="button"
              class="text-xs px-2.5 py-1 rounded-lg border transition-colors"
              :class="hasWeight(item, w)
                ? 'border-primary bg-primary/10 text-primary font-medium'
                : 'border-gray-200 dark:border-white/10 text-text-secondary'"
              @click="toggleWeight(item, w)"
            >
              {{ w }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
