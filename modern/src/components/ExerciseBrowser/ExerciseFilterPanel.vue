<script setup lang="ts">
import { Star, Clock, X } from '@lucide/vue'
import type { FilterOption, QuickFilter } from '../../composables/useExercisePicker'
import MuscleBodyMap from '../MuscleBodyMap.vue'
import { MUSCLE_GROUPS } from '../../utils/muscleGroups'

defineProps<{
  muscleGroups: string[]
  muscleCounts: Record<string, number>
  equipmentOptions: FilterOption[]
  equipment: string[]
  categoryOptions: FilterOption[]
  categories: string[]
  levelOptions: FilterOption[]
  levels: string[]
  quick: QuickFilter
  favouriteCount: number
  recentCount: number
  activeCount: number
}>()
const emit = defineEmits<{
  toggleMuscle: [key: string]
  toggleEquipment: [value: string]
  toggleCategory: [value: string]
  toggleLevel: [value: string]
  'update:quick': [value: QuickFilter]
  clear: []
}>()

function chipClass(active: boolean) {
  return active
    ? 'bg-primary text-white border-primary'
    : 'bg-white dark:bg-surface-dark text-text-primary dark:text-white border-gray-200 dark:border-white/10 hover:border-primary/50'
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-bold text-text-primary dark:text-white">Filters</h3>
      <button
        v-if="activeCount"
        type="button"
        class="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        @click="emit('clear')"
      >
        <X class="w-3 h-3" /> Clear ({{ activeCount }})
      </button>
    </div>

    <section class="flex flex-col gap-2">
      <h4 class="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Show</h4>
      <div class="flex flex-wrap gap-1.5">
        <button type="button" class="chip" :class="chipClass(quick === 'all')" @click="emit('update:quick', 'all')">All</button>
        <button type="button" class="chip" :class="chipClass(quick === 'favourites')" @click="emit('update:quick', quick === 'favourites' ? 'all' : 'favourites')">
          <Star class="w-3 h-3" /> Favourites ({{ favouriteCount }})
        </button>
        <button type="button" class="chip" :class="chipClass(quick === 'recent')" @click="emit('update:quick', quick === 'recent' ? 'all' : 'recent')">
          <Clock class="w-3 h-3" /> Recent ({{ recentCount }})
        </button>
      </div>
    </section>

    <section class="flex flex-col gap-2">
      <h4 class="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Target muscle</h4>
      <MuscleBodyMap :selected="muscleGroups" :counts="muscleCounts" @toggle="emit('toggleMuscle', $event)" />
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="g in MUSCLE_GROUPS"
          :key="g.key"
          type="button"
          class="chip"
          :class="[chipClass(muscleGroups.includes(g.key)), !muscleCounts[g.key] && !muscleGroups.includes(g.key) ? 'opacity-40' : '']"
          :aria-pressed="muscleGroups.includes(g.key)"
          @click="emit('toggleMuscle', g.key)"
        >
          {{ g.label }} <span class="opacity-70">{{ muscleCounts[g.key] ?? 0 }}</span>
        </button>
      </div>
    </section>

    <section v-if="levelOptions.length" class="flex flex-col gap-2">
      <h4 class="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Difficulty</h4>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="o in levelOptions"
          :key="o.value"
          type="button"
          class="chip capitalize"
          :class="chipClass(levels.includes(o.value))"
          :aria-pressed="levels.includes(o.value)"
          @click="emit('toggleLevel', o.value)"
        >
          {{ o.value }} <span class="opacity-70">{{ o.count }}</span>
        </button>
      </div>
    </section>

    <section v-if="equipmentOptions.length" class="flex flex-col gap-2">
      <h4 class="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Equipment</h4>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="o in equipmentOptions"
          :key="o.value"
          type="button"
          class="chip capitalize"
          :class="chipClass(equipment.includes(o.value))"
          :aria-pressed="equipment.includes(o.value)"
          @click="emit('toggleEquipment', o.value)"
        >
          {{ o.value }} <span class="opacity-70">{{ o.count }}</span>
        </button>
      </div>
    </section>

    <section v-if="categoryOptions.length" class="flex flex-col gap-2">
      <h4 class="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Category</h4>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="o in categoryOptions"
          :key="o.value"
          type="button"
          class="chip capitalize"
          :class="chipClass(categories.includes(o.value))"
          :aria-pressed="categories.includes(o.value)"
          @click="emit('toggleCategory', o.value)"
        >
          {{ o.value }} <span class="opacity-70">{{ o.count }}</span>
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  min-height: 28px;
  border-width: 1px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  transition: background-color 150ms, border-color 150ms, color 150ms;
}
</style>
