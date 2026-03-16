<template>
  <div>
    <button
      type="button"
      class="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-700"
      title="Set barbell weight"
      @click="openDialog"
    >
      <Dumbbell class="size-4" />
    </button>

    <div
      v-if="isOpen"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4"
      @click.self="closeDialog"
    >
      <div class="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">Barbell weight</h3>
          <button
            type="button"
            class="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            @click="closeDialog"
          >
            ✕
          </button>
        </div>

        <div class="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
          Total: {{ totalWeight.toFixed(2).replace(/\.00$/, '') }} kg
        </div>

        <div class="mb-5 rounded-md border border-slate-200 p-3 dark:border-slate-700">
          <div class="mb-2 text-xs text-slate-500 dark:text-slate-300">Visualization (left to right)</div>
          <div class="flex items-center justify-center gap-1 text-[10px] font-medium">
            <span
              v-for="(plate, index) in leftPlates"
              :key="`left-${plate}-${index}`"
              class="inline-flex min-w-[28px] cursor-pointer items-center justify-center rounded border border-sky-300 bg-sky-100 px-1 text-sky-800 hover:bg-sky-200 dark:border-sky-700 dark:bg-sky-900/40 dark:text-sky-300 dark:hover:bg-sky-900/60"
              :style="plateStyle(plate)"
              title="Remove one pair"
              @click="removePair(plate)"
            >
              {{ plate }}
            </span>
            <span class="mx-1 inline-flex h-5 items-center rounded border border-slate-400 bg-slate-200 px-2 text-slate-800 dark:border-slate-500 dark:bg-slate-700 dark:text-slate-100">
              BAR 20
            </span>
            <span
              v-for="(plate, index) in rightPlates"
              :key="`right-${plate}-${index}`"
              class="inline-flex min-w-[28px] cursor-pointer items-center justify-center rounded border border-sky-300 bg-sky-100 px-1 text-sky-800 hover:bg-sky-200 dark:border-sky-700 dark:bg-sky-900/40 dark:text-sky-300 dark:hover:bg-sky-900/60"
              :style="plateStyle(plate)"
              title="Remove one pair"
              @click="removePair(plate)"
            >
              {{ plate }}
            </span>
          </div>
        </div>

        <div class="space-y-2">
          <div
            v-for="plate in PLATE_OPTIONS"
            :key="plate"
            class="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700"
          >
            <div>
              <p class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ plate }} kg</p>
              <p class="text-xs text-slate-500 dark:text-slate-300">Adds {{ (plate * 2).toFixed(2).replace(/\.00$/, '') }} kg total</p>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                class="h-7 w-7 rounded-md border border-slate-300 bg-white text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                :disabled="plateCounts[plate] <= 0"
                @click="removePair(plate)"
              >
                -
              </button>

              <span class="w-8 text-center text-sm font-semibold text-slate-800 dark:text-slate-100">
                {{ plateCounts[plate] }}
              </span>

              <button
                type="button"
                class="h-7 w-7 rounded-md border border-slate-300 bg-white text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                @click="addPair(plate)"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div class="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
            @click="closeDialog"
          >
            Cancel
          </button>
          <button
            type="button"
            class="inline-flex items-center rounded-md border border-emerald-500 bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600"
            @click="saveWeight"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Dumbbell } from 'lucide-vue-next'

const BAR_WEIGHT = 20
const PLATE_OPTIONS = [25, 15, 10, 5, 2.5, 1.25] as const

type PlateValue = (typeof PLATE_OPTIONS)[number]
type PlateCountMap = Record<PlateValue, number>

const props = defineProps<{
  modelValue: number | null
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: number): void
}>()

const isOpen = ref(false)
const plateCounts = ref<PlateCountMap>(createEmptyCounts())

function createEmptyCounts(): PlateCountMap {
  return {
    25: 0,
    15: 0,
    10: 0,
    5: 0,
    2.5: 0,
    1.25: 0,
  }
}

const totalWeight = computed(() => {
  const plateTotal = PLATE_OPTIONS.reduce((sum, plate) => {
    return sum + plateCounts.value[plate] * plate * 2
  }, 0)

  return BAR_WEIGHT + plateTotal
})

const leftPlates = computed<PlateValue[]>(() => {
  const result: PlateValue[] = []
  const leftOrder = [...PLATE_OPTIONS].reverse()

  for (const plate of leftOrder) {
    for (let i = 0; i < plateCounts.value[plate]; i += 1) {
      result.push(plate)
    }
  }
  return result
})

const rightPlates = computed<PlateValue[]>(() => {
  return [...leftPlates.value].reverse() as PlateValue[]
})

const plateStyle = (plate: number) => {
  const heights: Record<number, string> = {
    25: '42px',
    15: '38px',
    10: '34px',
    5: '30px',
    2.5: '26px',
    1.25: '22px',
  }

  return {
    height: heights[plate] ?? '24px',
  }
}

const openDialog = () => {
  plateCounts.value = fromWeight(props.modelValue)
  isOpen.value = true
}

const closeDialog = () => {
  isOpen.value = false
}

const addPair = (plate: PlateValue) => {
  plateCounts.value[plate] += 1
}

const removePair = (plate: PlateValue) => {
  if (plateCounts.value[plate] <= 0) {
    return
  }

  const nextTotal = totalWeight.value - plate * 2
  if (nextTotal < BAR_WEIGHT) {
    return
  }

  plateCounts.value[plate] -= 1
}

const saveWeight = () => {
  emit('update:modelValue', Math.max(BAR_WEIGHT, totalWeight.value))
  isOpen.value = false
}

const fromWeight = (weight: number | null): PlateCountMap => {
  const counts = createEmptyCounts()

  if (typeof weight !== 'number' || !Number.isFinite(weight) || weight <= BAR_WEIGHT) {
    return counts
  }

  let remainingPerSide = (weight - BAR_WEIGHT) / 2

  for (const plate of PLATE_OPTIONS) {
    const count = Math.floor((remainingPerSide + 1e-9) / plate)
    if (count > 0) {
      counts[plate] = count
      remainingPerSide -= count * plate
    }
  }

  return counts
}
</script>
