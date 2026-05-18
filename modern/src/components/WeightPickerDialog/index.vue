<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseModal from '../BaseModal.vue'
import BaseButton from '../BaseButton.vue'

const BARBELL_KG = 20
const AVAILABLE_PLATES = [0.25, 0.5, 1, 1.25, 2.25, 5, 10, 15, 20]

const PLATE_STYLE: Record<number, string> = {
  0.25: 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200',
  0.5:  'bg-gray-300 dark:bg-gray-500 text-gray-800 dark:text-gray-200',
  1:    'bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100',
  1.25: 'bg-green-200 dark:bg-green-700 text-green-900 dark:text-green-100',
  2.25: 'bg-gray-800 dark:bg-gray-900 text-white',
  5:    'bg-slate-300 dark:bg-slate-400 text-slate-900',
  10:   'bg-green-500 text-white',
  15:   'bg-yellow-400 text-yellow-900',
  20:   'bg-red-500 text-white',
}

const props = defineProps<{
  open: boolean
  modelValue: number | null
}>()

const emit = defineEmits<{
  'update:modelValue': [kg: number]
  close: []
}>()

const plates = ref<number[]>([])

const totalWeight = computed(
  () => BARBELL_KG + 2 * plates.value.reduce((s, p) => s + p, 0),
)

const sortedPlates = computed(() => [...plates.value].sort((a, b) => b - a))

const plateCounts = computed(() => {
  const counts: Record<number, number> = {}
  for (const p of plates.value) counts[p] = (counts[p] ?? 0) + 1
  return counts
})

const totalDisplay = computed(() => {
  const t = totalWeight.value
  return t % 1 === 0 ? String(t) : t.toFixed(2)
})

watch(() => props.open, (val) => {
  if (!val) return
  const oneSide = props.modelValue !== null && props.modelValue !== undefined
    ? (props.modelValue - BARBELL_KG) / 2
    : 0
  plates.value = oneSide > 0 ? decomposeWeight(oneSide) : []
})

function decomposeWeight(kg: number): number[] {
  const result: number[] = []
  let rem = kg
  for (const plate of [...AVAILABLE_PLATES].sort((a, b) => b - a)) {
    while (rem >= plate - 0.001) {
      result.push(plate)
      rem = Math.round((rem - plate) * 1000) / 1000
    }
  }
  return result
}

function plateHeight(kg: number) {
  return Math.min(16 + kg * 1.8, 44)
}

function addPlate(kg: number) {
  plates.value = [...plates.value, kg]
}

function removePlate(kg: number) {
  const copy = [...plates.value]
  const idx = copy.lastIndexOf(kg)
  if (idx !== -1) copy.splice(idx, 1)
  plates.value = copy
}

function confirm() {
  emit('update:modelValue', totalWeight.value)
}
</script>

<template>
  <BaseModal :open="open" title="Set Weight" size="sm" @close="emit('close')">
    <div class="flex flex-col gap-6">

      <!-- Total weight -->
      <div class="text-center pt-2">
        <span class="text-5xl font-bold tabular-nums text-text-primary dark:text-white">{{ totalDisplay }}</span>
        <span class="text-2xl font-medium text-text-secondary dark:text-white/60 ml-1.5">kg</span>
      </div>

      <!-- Barbell visualization -->
      <div class="flex items-center justify-center gap-0 h-12">
        <!-- Left side plates (closest to bar first) -->
        <div class="flex items-center flex-row-reverse gap-px">
          <div
            v-for="(plate, i) in sortedPlates"
            :key="`l-${i}`"
            :class="['rounded-sm w-3.5', PLATE_STYLE[plate]]"
            :style="{ height: `${plateHeight(plate)}px` }"
          />
        </div>

        <!-- Bar -->
        <div class="w-20 h-2 bg-gray-400 dark:bg-gray-500 rounded-full" />

        <!-- Right side plates -->
        <div class="flex items-center gap-px">
          <div
            v-for="(plate, i) in sortedPlates"
            :key="`r-${i}`"
            :class="['rounded-sm w-3.5', PLATE_STYLE[plate]]"
            :style="{ height: `${plateHeight(plate)}px` }"
          />
        </div>
      </div>

      <!-- Current plates per side -->
      <div v-if="plates.length" class="flex flex-col gap-2">
        <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary">Per side — tap to remove</p>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="kg in Object.keys(plateCounts).map(Number).sort((a, b) => b - a)"
            :key="kg"
            type="button"
            :class="['flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold focus-visible:ring-2 focus-visible:ring-primary', PLATE_STYLE[kg]]"
            :aria-label="`Remove one ${kg}kg plate`"
            @click="removePlate(kg)"
          >
            {{ kg }}kg × {{ plateCounts[kg] }}
            <span class="opacity-60 text-[10px]">−</span>
          </button>
        </div>
      </div>

      <!-- Plate picker -->
      <div class="flex flex-col gap-2">
        <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary">Add plate (each side)</p>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="kg in AVAILABLE_PLATES"
            :key="kg"
            type="button"
            :class="['px-3 py-2 rounded-xl text-xs font-semibold min-h-[40px] min-w-[48px] focus-visible:ring-2 focus-visible:ring-primary transition-opacity active:opacity-70', PLATE_STYLE[kg]]"
            @click="addPlate(kg)"
          >
            {{ kg }}
          </button>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="text-sm font-medium text-text-secondary hover:text-red-500 transition-colors focus-visible:ring-1 focus-visible:ring-primary rounded px-2 py-1"
          @click="plates = []"
        >
          Clear
        </button>
        <div class="flex-1" />
        <BaseButton variant="primary" @click="confirm">
          Set {{ totalDisplay }} kg
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
