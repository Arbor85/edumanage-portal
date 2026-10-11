<script setup lang="ts">
import { computed } from 'vue'
import { muscleGroupLabel } from '../utils/muscleGroups'

type Shape = { key: string; tag: 'rect' | 'ellipse' | 'path'; attrs: Record<string, string | number> }

const props = defineProps<{
  selected: string[]
  counts?: Record<string, number>
}>()
const emit = defineEmits<{ toggle: [key: string] }>()

const FRONT: Shape[] = [
  { key: 'shoulders', tag: 'ellipse', attrs: { cx: 27, cy: 34, rx: 10, ry: 7 } },
  { key: 'shoulders', tag: 'ellipse', attrs: { cx: 73, cy: 34, rx: 10, ry: 7 } },
  { key: 'chest', tag: 'path', attrs: { d: 'M37,29 L50,34 L50,61 L34,61 Z' } },
  { key: 'chest', tag: 'path', attrs: { d: 'M63,29 L50,34 L50,61 L66,61 Z' } },
  { key: 'biceps', tag: 'rect', attrs: { x: 15, y: 33, width: 13, height: 30, rx: 5 } },
  { key: 'biceps', tag: 'rect', attrs: { x: 72, y: 33, width: 13, height: 30, rx: 5 } },
  { key: 'triceps', tag: 'rect', attrs: { x: 10, y: 33, width: 7, height: 28, rx: 3 } },
  { key: 'triceps', tag: 'rect', attrs: { x: 83, y: 33, width: 7, height: 28, rx: 3 } },
  { key: 'forearms', tag: 'rect', attrs: { x: 10, y: 63, width: 11, height: 24, rx: 4 } },
  { key: 'forearms', tag: 'rect', attrs: { x: 79, y: 63, width: 11, height: 24, rx: 4 } },
  { key: 'core', tag: 'rect', attrs: { x: 35, y: 61, width: 30, height: 28, rx: 3 } },
  { key: 'glutes', tag: 'rect', attrs: { x: 30, y: 87, width: 40, height: 15, rx: 3 } },
  { key: 'quads', tag: 'rect', attrs: { x: 29, y: 102, width: 19, height: 44, rx: 5 } },
  { key: 'quads', tag: 'rect', attrs: { x: 52, y: 102, width: 19, height: 44, rx: 5 } },
  { key: 'calves', tag: 'rect', attrs: { x: 30, y: 148, width: 16, height: 38, rx: 4 } },
  { key: 'calves', tag: 'rect', attrs: { x: 54, y: 148, width: 16, height: 38, rx: 4 } },
]

const BACK: Shape[] = [
  { key: 'neck', tag: 'rect', attrs: { x: 46, y: 23, width: 8, height: 8, rx: 3 } },
  { key: 'traps', tag: 'path', attrs: { d: 'M37,24 Q50,18 63,24 L66,40 Q50,35 34,40 Z' } },
  { key: 'shoulders', tag: 'ellipse', attrs: { cx: 27, cy: 34, rx: 10, ry: 7 } },
  { key: 'shoulders', tag: 'ellipse', attrs: { cx: 73, cy: 34, rx: 10, ry: 7 } },
  { key: 'lats', tag: 'path', attrs: { d: 'M34,40 L50,38 L50,70 L30,75 Z' } },
  { key: 'lats', tag: 'path', attrs: { d: 'M66,40 L50,38 L50,70 L70,75 Z' } },
  { key: 'triceps', tag: 'rect', attrs: { x: 15, y: 33, width: 13, height: 30, rx: 5 } },
  { key: 'triceps', tag: 'rect', attrs: { x: 72, y: 33, width: 13, height: 30, rx: 5 } },
  { key: 'forearms', tag: 'rect', attrs: { x: 10, y: 63, width: 11, height: 24, rx: 4 } },
  { key: 'forearms', tag: 'rect', attrs: { x: 79, y: 63, width: 11, height: 24, rx: 4 } },
  { key: 'lower_back', tag: 'rect', attrs: { x: 35, y: 70, width: 30, height: 20, rx: 3 } },
  { key: 'glutes', tag: 'ellipse', attrs: { cx: 38, cy: 97, rx: 12, ry: 12 } },
  { key: 'glutes', tag: 'ellipse', attrs: { cx: 62, cy: 97, rx: 12, ry: 12 } },
  { key: 'hamstrings', tag: 'rect', attrs: { x: 29, y: 108, width: 19, height: 40, rx: 5 } },
  { key: 'hamstrings', tag: 'rect', attrs: { x: 52, y: 108, width: 19, height: 40, rx: 5 } },
  { key: 'calves', tag: 'rect', attrs: { x: 30, y: 150, width: 16, height: 36, rx: 4 } },
  { key: 'calves', tag: 'rect', attrs: { x: 54, y: 150, width: 16, height: 36, rx: 4 } },
]

const views = [
  { name: 'Front', shapes: FRONT },
  { name: 'Back', shapes: BACK },
]

const selectedSet = computed(() => new Set(props.selected))

function label(key: string) {
  const count = props.counts?.[key]
  return count === undefined ? muscleGroupLabel(key) : `${muscleGroupLabel(key)} (${count})`
}
</script>

<template>
  <div class="flex justify-center gap-4">
    <div v-for="view in views" :key="view.name" class="flex flex-col items-center gap-1">
      <span class="text-[10px] uppercase tracking-widest text-text-secondary">{{ view.name }}</span>
      <svg viewBox="0 0 100 200" class="w-20 h-40 overflow-visible" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="13" r="11" class="fill-gray-100 dark:fill-white/5 stroke-gray-300 dark:stroke-white/15" stroke-width="0.8" />
        <ellipse cx="38" cy="190" rx="11" ry="6" class="fill-gray-100 dark:fill-white/5" />
        <ellipse cx="62" cy="190" rx="11" ry="6" class="fill-gray-100 dark:fill-white/5" />
        <component
          :is="s.tag"
          v-for="(s, i) in view.shapes"
          :key="`${s.key}-${i}`"
          v-bind="s.attrs"
          role="button"
          tabindex="0"
          :aria-label="label(s.key)"
          :aria-pressed="selectedSet.has(s.key)"
          stroke-width="0.8"
          class="cursor-pointer outline-none transition-colors stroke-gray-300 dark:stroke-white/15 focus-visible:stroke-primary focus-visible:[stroke-width:2]"
          :class="selectedSet.has(s.key)
            ? 'fill-primary'
            : 'fill-gray-200 dark:fill-white/10 hover:fill-primary/40'"
          @click="emit('toggle', s.key)"
          @keydown.enter.prevent="emit('toggle', s.key)"
          @keydown.space.prevent="emit('toggle', s.key)"
        >
          <title>{{ label(s.key) }}</title>
        </component>
      </svg>
    </div>
  </div>
</template>
