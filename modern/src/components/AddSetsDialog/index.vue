<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { RoutineSet } from '../../types'
import BaseModal from '../BaseModal.vue'
import BaseButton from '../BaseButton.vue'
import { ArrowDown, Minus, ArrowUp } from 'lucide-vue-next'

type Direction = 'decrease' | 'keep' | 'increase'

// Valid total barbell increments (2 × each allowed plate per side)
const WEIGHT_STEPS = [0.5, 1, 2, 2.5, 4.5, 10, 20, 30, 40]
const DEFAULT_WEIGHT_STEP = 2.5

const props = defineProps<{
  open: boolean
  baseSet: RoutineSet
  isBodyweight?: boolean
}>()

const emit = defineEmits<{
  close: []
  add: [sets: RoutineSet[]]
}>()

const count = ref(3)
const weightDir = ref<Direction>('keep')
const weightStep = ref(DEFAULT_WEIGHT_STEP)
const repsDir = ref<Direction>('keep')
const repsStep = ref(1)

watch(() => props.open, (val) => {
  if (!val) return
  count.value = 3
  weightDir.value = 'keep'
  weightStep.value = DEFAULT_WEIGHT_STEP
  repsDir.value = 'keep'
  repsStep.value = 1
})

const previewSets = computed<RoutineSet[]>(() =>
  Array.from({ length: count.value }, (_, i) => {
    const baseWeight = props.baseSet.weight ?? 20
    const baseReps = props.baseSet.reps ?? 10

    const wDelta = weightDir.value === 'keep' ? 0
      : (weightDir.value === 'increase' ? 1 : -1) * weightStep.value * i
    const weight = props.isBodyweight
      ? null
      : Math.max(0, Math.round((baseWeight + wDelta) * 100) / 100)

    const rDelta = repsDir.value === 'keep' ? 0
      : (repsDir.value === 'increase' ? 1 : -1) * repsStep.value * i
    const reps = Math.max(1, (baseReps + rDelta))

    return { ...props.baseSet, weight, reps }
  }),
)

const setVolume = (s: RoutineSet) => (s.weight ?? 0) * (s.reps ?? 0)

const totalVolume = computed(() => previewSets.value.reduce((sum, s) => sum + setVolume(s), 0))
const baseVolume = computed(() => setVolume(props.baseSet))
const volumeDelta = computed(() => totalVolume.value - baseVolume.value * count.value)

function fmt(n: number) {
  return n % 1 === 0 ? String(n) : n.toFixed(2).replace(/\.?0+$/, '')
}

function confirm() {
  emit('add', previewSets.value)
}
</script>

<template>
  <BaseModal :open="open" title="Add Sets" size="md" @close="emit('close')">
    <div class="flex flex-col gap-6">

      <!-- Count stepper -->
      <div class="flex flex-col gap-2">
        <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary">Number of sets</p>
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="w-10 h-10 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center text-lg font-medium text-text-primary dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-primary transition-colors"
            :disabled="count <= 1"
            @click="count--"
          >−</button>
          <span class="w-8 text-center text-2xl font-bold tabular-nums text-text-primary dark:text-white">{{ count }}</span>
          <button
            type="button"
            class="w-10 h-10 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center text-lg font-medium text-text-primary dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-primary transition-colors"
            :disabled="count >= 10"
            @click="count++"
          >+</button>
        </div>
      </div>

      <!-- Weight progression (hidden for bodyweight) -->
      <div v-if="!isBodyweight" class="flex flex-col gap-2.5">
        <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary">Weight per set</p>

        <!-- Direction buttons -->
        <div class="flex rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
          <button
            v-for="d in (['decrease', 'keep', 'increase'] as Direction[])"
            :key="d"
            type="button"
            :class="[
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors',
              weightDir === d
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-surface-dark text-text-secondary dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/5',
            ]"
            @click="weightDir = d"
          >
            <ArrowDown v-if="d === 'decrease'" class="w-3.5 h-3.5" />
            <Minus v-else-if="d === 'keep'" class="w-3.5 h-3.5" />
            <ArrowUp v-else class="w-3.5 h-3.5" />
            <span>{{ d === 'decrease' ? 'Decrease' : d === 'keep' ? 'Keep' : 'Increase' }}</span>
          </button>
        </div>

        <!-- Weight step chips -->
        <Transition name="fade-down">
          <div v-if="weightDir !== 'keep'" class="flex flex-col gap-1.5">
            <p class="text-xs text-text-secondary">Step per set</p>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="step in WEIGHT_STEPS"
                :key="step"
                type="button"
                :class="[
                  'px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-primary',
                  weightStep === step
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-white/10 text-text-secondary dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/20',
                ]"
                @click="weightStep = step"
              >
                {{ fmt(step) }} kg
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Reps progression -->
      <div class="flex flex-col gap-2.5">
        <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary">Reps per set</p>

        <!-- Direction buttons -->
        <div class="flex rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
          <button
            v-for="d in (['decrease', 'keep', 'increase'] as Direction[])"
            :key="d"
            type="button"
            :class="[
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors',
              repsDir === d
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-surface-dark text-text-secondary dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/5',
            ]"
            @click="repsDir = d"
          >
            <ArrowDown v-if="d === 'decrease'" class="w-3.5 h-3.5" />
            <Minus v-else-if="d === 'keep'" class="w-3.5 h-3.5" />
            <ArrowUp v-else class="w-3.5 h-3.5" />
            <span>{{ d === 'decrease' ? 'Decrease' : d === 'keep' ? 'Keep' : 'Increase' }}</span>
          </button>
        </div>

        <!-- Reps step stepper -->
        <Transition name="fade-down">
          <div v-if="repsDir !== 'keep'" class="flex items-center gap-2">
            <p class="text-xs text-text-secondary flex-1">Step per set</p>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center text-sm font-medium text-text-primary dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-30 focus-visible:ring-1 focus-visible:ring-primary"
                :disabled="repsStep <= 1"
                @click="repsStep--"
              >−</button>
              <span class="w-8 text-center text-base font-bold tabular-nums text-text-primary dark:text-white">{{ repsStep }}</span>
              <button
                type="button"
                class="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center text-sm font-medium text-text-primary dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 focus-visible:ring-1 focus-visible:ring-primary"
                @click="repsStep++"
              >+</button>
              <span class="text-xs text-text-secondary ml-1">rep</span>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Preview -->
      <div class="flex flex-col gap-2">
        <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary">Preview</p>
        <div class="rounded-xl border border-gray-100 dark:border-white/10 overflow-hidden">
          <div
            v-for="(set, i) in previewSets"
            :key="i"
            class="flex items-center gap-3 px-4 py-2.5 text-sm border-b border-gray-50 dark:border-white/5 last:border-0"
          >
            <span class="text-text-secondary w-12 flex-shrink-0">Set {{ i + 1 }}</span>
            <span class="font-medium text-text-primary dark:text-white flex-1">
              <template v-if="!isBodyweight">{{ fmt(set.weight ?? 0) }} kg × </template>
              {{ set.reps }} rep
            </span>
            <span class="text-xs tabular-nums text-text-secondary">
              {{ isBodyweight ? set.reps : fmt(setVolume(set)) }}
              {{ isBodyweight ? 'rep' : 'vol' }}
            </span>
          </div>
          <!-- Total row -->
          <div class="flex items-center gap-3 px-4 py-2.5 bg-gray-50 dark:bg-white/5">
            <span class="text-xs font-semibold text-text-secondary w-12 flex-shrink-0">Total</span>
            <span class="text-sm font-semibold text-text-primary dark:text-white flex-1">
              {{ count }} sets
            </span>
            <div class="flex items-center gap-1.5">
              <span class="text-sm font-bold tabular-nums text-text-primary dark:text-white">
                {{ isBodyweight ? previewSets.reduce((s, x) => s + (x.reps ?? 0), 0) : fmt(totalVolume) }}
                {{ isBodyweight ? 'reps' : 'vol' }}
              </span>
              <span
                v-if="volumeDelta !== 0"
                :class="['text-xs font-medium tabular-nums', volumeDelta > 0 ? 'text-green-500' : 'text-red-400']"
              >
                {{ volumeDelta > 0 ? '+' : '' }}{{ fmt(volumeDelta) }}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-2">
        <BaseButton variant="ghost" @click="emit('close')">Cancel</BaseButton>
        <BaseButton variant="primary" @click="confirm">Add {{ count }} set{{ count > 1 ? 's' : '' }}</BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
.fade-down-enter-active, .fade-down-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.fade-down-enter-from, .fade-down-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
