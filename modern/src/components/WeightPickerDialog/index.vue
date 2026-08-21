<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseModal from '../BaseModal.vue'
import BaseButton from '../BaseButton.vue'
import { useWeightUnit } from '../../composables/useWeightUnit'

const KG_PLATES = [0.25, 0.5, 1, 1.25, 2.5, 5, 10, 15, 20, 25]
const LBS_PLATES = [2.5, 5, 10, 25, 35, 45]
const KG_BAR = 20
const LBS_BAR = 45
const KG_TO_LBS = 2.20462

const KG_PLATE_STYLE: Record<number, string> = {
  0.25: 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200',
  0.5:  'bg-gray-300 dark:bg-gray-500 text-gray-800 dark:text-gray-200',
  1:    'bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100',
  1.25: 'bg-green-200 dark:bg-green-700 text-green-900 dark:text-green-100',
  2.5:  'bg-gray-800 dark:bg-gray-900 text-white',
  5:    'bg-slate-300 dark:bg-slate-400 text-slate-900',
  10:   'bg-green-500 text-white',
  15:   'bg-yellow-400 text-yellow-900',
  20:   'bg-red-500 text-white',
  25:   'bg-blue-500 text-white',
}

const LBS_PLATE_STYLE: Record<number, string> = {
  2.5:  'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200',
  5:    'bg-gray-300 dark:bg-gray-500 text-gray-800 dark:text-gray-200',
  10:   'bg-slate-300 dark:bg-slate-400 text-slate-900',
  25:   'bg-green-500 text-white',
  35:   'bg-yellow-400 text-yellow-900',
  45:   'bg-blue-500 text-white',
}

const props = defineProps<{
  open: boolean
  modelValue: number | null
  inActiveWorkout?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [kg: number]
  'close': []
  'unit-changed': [newUnit: 'kg' | 'lbs']
}>()

const { unit, toggle } = useWeightUnit()

const plates = ref<number[]>([])
const manualMode = ref(false)
const manualInput = ref('')

const availablePlates = computed(() => unit.value === 'kg' ? KG_PLATES : LBS_PLATES)
const plateStyle = computed(() => unit.value === 'kg' ? KG_PLATE_STYLE : LBS_PLATE_STYLE)
const barWeight = computed(() => unit.value === 'kg' ? KG_BAR : LBS_BAR)

const totalWeightDisplay = computed(() => {
  const perSide = plates.value.reduce((s, p) => s + p, 0)
  const total = barWeight.value + 2 * perSide
  return total % 1 === 0 ? String(total) : total.toFixed(2)
})

const totalWeightKg = computed(() => {
  const perSide = plates.value.reduce((s, p) => s + p, 0)
  const total = barWeight.value + 2 * perSide
  return unit.value === 'kg' ? total : total / KG_TO_LBS
})

const sortedPlates = computed(() => [...plates.value].sort((a, b) => b - a))

const plateCounts = computed(() => {
  const counts: Record<number, number> = {}
  for (const p of plates.value) counts[p] = (counts[p] ?? 0) + 1
  return counts
})

watch(() => props.open, (val) => {
  if (!val) return
  manualMode.value = false
  manualInput.value = ''
  initPlatesFromValue()
})

// When unit changes while dialog is open, reset plate selection
watch(unit, () => {
  if (!props.open) return
  plates.value = []
  manualMode.value = false
  manualInput.value = ''
})

function initPlatesFromValue() {
  const val = props.modelValue
  if (!val || val <= 0) { plates.value = []; return }

  if (unit.value === 'kg') {
    const oneSide = (val - KG_BAR) / 2
    plates.value = oneSide > 0 ? decompose(oneSide, KG_PLATES) : []
  } else {
    const lbsTotal = val * KG_TO_LBS
    const oneSide = (lbsTotal - LBS_BAR) / 2
    plates.value = oneSide > 0 ? decompose(oneSide, LBS_PLATES) : []
  }
}

function decompose(weight: number, plateSet: number[]): number[] {
  const result: number[] = []
  let rem = weight
  for (const plate of [...plateSet].sort((a, b) => b - a)) {
    while (rem >= plate - 0.001) {
      result.push(plate)
      rem = Math.round((rem - plate) * 1000) / 1000
    }
  }
  return result
}

function plateHeight(weight: number): number {
  const maxPlate = unit.value === 'kg' ? 25 : 45
  return Math.max(16, Math.min(56, 16 + (weight / maxPlate) * 40))
}

function addPlate(weight: number) {
  plates.value = [...plates.value, weight]
}

function removePlate(weight: number) {
  const copy = [...plates.value]
  const idx = copy.lastIndexOf(weight)
  if (idx !== -1) copy.splice(idx, 1)
  plates.value = copy
}

function switchUnit() {
  const newUnit = unit.value === 'kg' ? 'lbs' : 'kg'
  if (props.inActiveWorkout) {
    emit('unit-changed', newUnit)
    // Parent shows confirmation; on confirm it calls toggle() which triggers the watch above
  } else {
    toggle()
  }
}

function enterManualMode() {
  manualInput.value = totalWeightDisplay.value
  manualMode.value = true
}

function confirmManual() {
  const raw = parseFloat(manualInput.value)
  if (isNaN(raw) || raw <= 0) return
  const kg = unit.value === 'kg' ? raw : raw / KG_TO_LBS
  emit('update:modelValue', kg)
  emit('close')
}

function confirm() {
  emit('update:modelValue', totalWeightKg.value)
  emit('close')
}
</script>

<template>
  <BaseModal :open="open" size="sm" @close="emit('close')">
    <div class="flex flex-col gap-5">

      <!-- Header: title + unit toggle -->
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-text-primary dark:text-white">Set Weight</h2>
        <div class="flex items-center rounded-lg bg-gray-100 dark:bg-white/10 p-0.5 gap-0.5">
          <button
            type="button"
            class="px-3 py-1 rounded-md text-xs font-semibold transition-all"
            :class="unit === 'kg'
              ? 'bg-white dark:bg-white/20 text-text-primary dark:text-white shadow-sm'
              : 'text-text-secondary dark:text-white/50 hover:text-text-primary dark:hover:text-white'"
            @click="unit !== 'kg' && switchUnit()"
          >kg</button>
          <button
            type="button"
            class="px-3 py-1 rounded-md text-xs font-semibold transition-all"
            :class="unit === 'lbs'
              ? 'bg-white dark:bg-white/20 text-text-primary dark:text-white shadow-sm'
              : 'text-text-secondary dark:text-white/50 hover:text-text-primary dark:hover:text-white'"
            @click="unit !== 'lbs' && switchUnit()"
          >lbs</button>
        </div>
      </div>

      <!-- Manual input mode -->
      <template v-if="manualMode">
        <div class="flex items-center justify-center gap-2 py-6">
          <input
            v-model="manualInput"
            type="number"
            min="0"
            step="0.5"
            inputmode="decimal"
            autofocus
            class="w-32 text-center text-5xl font-bold bg-transparent outline-none text-text-primary dark:text-white
                   border-b-2 border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                   [&::-webkit-inner-spin-button]:appearance-none"
            @keydown.enter="confirmManual"
          />
          <span class="text-2xl font-medium text-text-secondary dark:text-white/60">{{ unit }}</span>
        </div>
        <button
          type="button"
          class="text-xs text-text-secondary hover:text-primary transition-colors text-center"
          @click="manualMode = false"
        >
          ← Use plates
        </button>
      </template>

      <!-- Plate picker mode -->
      <template v-else>

        <!-- Total weight display -->
        <div class="text-center">
          <span class="text-5xl font-bold tabular-nums text-text-primary dark:text-white">{{ totalWeightDisplay }}</span>
          <span class="text-2xl font-medium text-text-secondary dark:text-white/60 ml-1.5">{{ unit }}</span>
        </div>

        <!-- Barbell visualization -->
        <div class="flex items-center justify-center h-14">
          <div class="flex items-center flex-row-reverse gap-px">
            <div
              v-for="(plate, i) in sortedPlates"
              :key="`l-${i}`"
              :class="['rounded-sm w-3.5', plateStyle[plate]]"
              :style="{ height: `${plateHeight(plate)}px` }"
            />
          </div>
          <div class="w-20 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mx-px" />
          <div class="flex items-center gap-px">
            <div
              v-for="(plate, i) in sortedPlates"
              :key="`r-${i}`"
              :class="['rounded-sm w-3.5', plateStyle[plate]]"
              :style="{ height: `${plateHeight(plate)}px` }"
            />
          </div>
        </div>

        <!-- Current plates per side -->
        <div v-if="plates.length" class="flex flex-col gap-2">
          <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary">Per side — tap to remove</p>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="w in Object.keys(plateCounts).map(Number).sort((a, b) => b - a)"
              :key="w"
              type="button"
              :class="['flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold focus-visible:ring-2 focus-visible:ring-primary', plateStyle[w]]"
              :aria-label="`Remove one ${w}${unit} plate`"
              @click="removePlate(w)"
            >
              {{ w }}{{ unit }} × {{ plateCounts[w] }}<span class="opacity-60 text-[10px]">−</span>
            </button>
          </div>
        </div>

        <!-- Plate picker -->
        <div class="flex flex-col gap-2">
          <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary">Add plate (each side)</p>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="w in availablePlates"
              :key="w"
              type="button"
              :class="['px-3 py-2 rounded-xl text-xs font-semibold min-h-[40px] min-w-[48px] focus-visible:ring-2 focus-visible:ring-primary transition-opacity active:opacity-70', plateStyle[w]]"
              @click="addPlate(w)"
            >
              {{ w }}
            </button>
          </div>
        </div>

        <!-- Manual input link -->
        <button
          type="button"
          class="text-xs text-text-secondary hover:text-primary transition-colors text-center"
          @click="enterManualMode"
        >
          Type value…
        </button>

      </template>
    </div>

    <template #footer>
      <div class="flex items-center gap-2">
        <button
          v-if="!manualMode"
          type="button"
          class="text-sm font-medium text-text-secondary hover:text-red-500 transition-colors focus-visible:ring-1 focus-visible:ring-primary rounded px-2 py-1"
          @click="plates = []"
        >
          Clear
        </button>
        <div class="flex-1" />
        <BaseButton v-if="manualMode" variant="primary" @click="confirmManual">
          Set weight
        </BaseButton>
        <BaseButton v-else variant="primary" @click="confirm">
          Set {{ totalWeightDisplay }} {{ unit }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
