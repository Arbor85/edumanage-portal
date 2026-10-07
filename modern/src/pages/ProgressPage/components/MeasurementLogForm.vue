<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { Plus, X } from '@lucide/vue'
import { useBodyMeasurementStore } from '../../../stores/bodyMeasurementStore'
import { useToast } from '../../../composables/useToast'
import type { BodyMeasurementCreate } from '../../../types'

const store = useBodyMeasurementStore()
const toast = useToast()

interface MetricDef {
  key: keyof BodyMeasurementCreate
  label: string
  unit: string
  step: string
  isInt?: boolean
}

// Blood pressure treated as one button opening two inputs
const METRICS: MetricDef[] = [
  { key: 'weightKg',      label: 'Weight',    unit: 'kg',   step: '0.1' },
  { key: 'waistCm',       label: 'Waist',     unit: 'cm',   step: '0.1' },
  { key: 'thighCm',       label: 'Thigh',     unit: 'cm',   step: '0.1' },
  { key: 'bicepCm',       label: 'Bicep',     unit: 'cm',   step: '0.1' },
  { key: 'chestCm',       label: 'Chest',     unit: 'cm',   step: '0.1' },
  { key: 'buttCm',        label: 'Butt',      unit: 'cm',   step: '0.1' },
  { key: 'systolicMmHg',  label: 'Blood pressure', unit: 'mmHg', step: '1', isInt: true },
]

// Dialog state
const openMetric = ref<MetricDef | null>(null)
const inputValue = ref('')
const inputValue2 = ref('') // diastolic for BP
const isSubmitting = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

function lastValue(key: keyof BodyMeasurementCreate): number | null {
  for (const m of store.measurements) {
    const v = m[key as keyof typeof m]
    if (v != null) return v as number
  }
  return null
}

const lastForOpen = computed(() => openMetric.value ? lastValue(openMetric.value.key) : null)
const lastDiastolic = computed(() => lastValue('diastolicMmHg'))

const diff = computed(() => {
  if (!openMetric.value || inputValue.value === '') return null
  const current = parseFloat(inputValue.value)
  if (isNaN(current) || lastForOpen.value == null) return null
  return current - lastForOpen.value
})

const diffBp2 = computed(() => {
  if (inputValue2.value === '') return null
  const current = parseFloat(inputValue2.value)
  if (isNaN(current) || lastDiastolic.value == null) return null
  return current - lastDiastolic.value
})

function fmtDiff(d: number | null): string {
  if (d == null) return ''
  const sign = d >= 0 ? '+' : ''
  return `${sign}${d % 1 === 0 ? d.toFixed(0) : d.toFixed(1)}`
}

async function open(metric: MetricDef) {
  openMetric.value = metric
  inputValue.value = ''
  inputValue2.value = ''
  await nextTick()
  inputRef.value?.focus()
}

function close() {
  openMetric.value = null
  inputValue.value = ''
  inputValue2.value = ''
}

function parseNum(v: string, isInt: boolean): number | null {
  const n = isInt ? parseInt(v) : parseFloat(v)
  return isNaN(n) ? null : n
}

async function save() {
  if (!openMetric.value || inputValue.value.trim() === '' || isSubmitting.value) return
  isSubmitting.value = true
  try {
    const today = new Date().toISOString().slice(0, 10)
    const isBp = openMetric.value.key === 'systolicMmHg'
    const payload: BodyMeasurementCreate = {
      date: today,
      weightKg: null, waistCm: null, thighCm: null,
      bicepCm: null, chestCm: null, buttCm: null,
      systolicMmHg: null, diastolicMmHg: null,
    }

    if (isBp) {
      payload.systolicMmHg = parseNum(inputValue.value, true)
      payload.diastolicMmHg = inputValue2.value.trim() ? parseNum(inputValue2.value, true) : null
    } else {
      ;(payload as any)[openMetric.value.key] = parseNum(inputValue.value, openMetric.value.isInt ?? false)
    }

    await store.log(payload)
    toast.success(`${openMetric.value.label} logged`)
    close()
  } catch {
    toast.error('Failed to save')
  } finally {
    isSubmitting.value = false
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') save()
  if (e.key === 'Escape') close()
}
</script>

<template>
  <div class="bg-surface-card border border-white/5 rounded-2xl p-5">
    <p class="text-xs font-bold tracking-widest uppercase text-text-muted mb-4">Log today</p>

    <!-- Metric buttons -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="m in METRICS"
        :key="m.key"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border border-white/10
               bg-surface-elevated text-text-secondary hover:text-white hover:border-white/20 transition-all active:scale-95"
        @click="open(m)"
      >
        <Plus class="w-3.5 h-3.5" />
        {{ m.label }}
      </button>
    </div>
  </div>

  <!-- Dialog -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="openMetric"
        class="fixed inset-0 z-50 flex items-center justify-center px-4"
        style="background: rgba(0,0,0,0.6); backdrop-filter: blur(4px)"
        @click.self="close"
        @keydown="onKeydown"
      >
        <div class="bg-surface-card border border-white/10 rounded-2xl p-6 w-full max-w-xs shadow-2xl">
          <!-- Header -->
          <div class="flex items-center justify-between mb-5">
            <h3 class="font-bold text-white">{{ openMetric.label }}</h3>
            <button class="text-text-muted hover:text-white transition-colors" @click="close">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- BP: two inputs -->
          <template v-if="openMetric.key === 'systolicMmHg'">
            <div class="flex items-center gap-2 mb-3">
              <div class="flex-1">
                <label class="block text-xs text-text-muted mb-1">Systolic</label>
                <input
                  ref="inputRef"
                  v-model="inputValue"
                  type="number"
                  :step="openMetric.step"
                  min="0"
                  placeholder="120"
                  class="w-full bg-surface-elevated border border-white/10 rounded-xl px-3 py-2.5 text-lg font-bold text-white
                         focus:outline-none focus:border-primary/50 transition-colors text-center"
                />
              </div>
              <span class="text-text-muted text-xl mt-5">/</span>
              <div class="flex-1">
                <label class="block text-xs text-text-muted mb-1">Diastolic</label>
                <input
                  v-model="inputValue2"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="80"
                  class="w-full bg-surface-elevated border border-white/10 rounded-xl px-3 py-2.5 text-lg font-bold text-white
                         focus:outline-none focus:border-primary/50 transition-colors text-center"
                />
              </div>
            </div>

            <!-- BP diff row -->
            <div class="text-xs text-text-muted mb-5 min-h-[16px] flex gap-4">
              <span v-if="lastForOpen != null && inputValue !== ''">
                Systolic {{ lastForOpen }} →
                <span :class="diff && diff > 0 ? 'text-red-400' : diff && diff < 0 ? 'text-green-400' : 'text-text-secondary'">
                  {{ inputValue }} ({{ fmtDiff(diff) }})
                </span>
              </span>
              <span v-else-if="lastForOpen == null && inputValue !== ''" class="text-text-secondary">First entry</span>

              <span v-if="lastDiastolic != null && inputValue2 !== ''">
                Diastolic {{ lastDiastolic }} →
                <span :class="diffBp2 && diffBp2 > 0 ? 'text-red-400' : diffBp2 && diffBp2 < 0 ? 'text-green-400' : 'text-text-secondary'">
                  {{ inputValue2 }} ({{ fmtDiff(diffBp2) }})
                </span>
              </span>
              <span v-else-if="lastDiastolic == null && inputValue2 !== ''" class="text-text-secondary">First entry</span>
            </div>
          </template>

          <!-- Single metric input -->
          <template v-else>
            <div class="relative mb-2">
              <input
                ref="inputRef"
                v-model="inputValue"
                type="number"
                :step="openMetric.step"
                min="0"
                class="w-full bg-surface-elevated border border-white/10 rounded-xl px-4 py-3 text-2xl font-bold text-white
                       focus:outline-none focus:border-primary/50 transition-colors text-center"
                :placeholder="openMetric.unit"
              />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-text-muted pointer-events-none">
                {{ openMetric.unit }}
              </span>
            </div>

            <!-- Diff -->
            <div class="text-xs text-center min-h-[20px] mb-5">
              <template v-if="inputValue !== ''">
                <span v-if="lastForOpen == null" class="text-text-muted">First entry</span>
                <span v-else>
                  <span class="text-text-muted">Last: {{ lastForOpen }} {{ openMetric.unit }} → </span>
                  <span :class="diff && diff > 0 ? 'text-red-400' : diff && diff < 0 ? 'text-green-400' : 'text-text-secondary'">
                    {{ fmtDiff(diff) }}
                  </span>
                </span>
              </template>
            </div>
          </template>

          <!-- Actions -->
          <div class="flex gap-2">
            <button
              class="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-text-secondary
                     hover:text-white hover:border-white/20 transition-all"
              @click="close"
            >Cancel</button>
            <button
              :disabled="inputValue.trim() === '' || isSubmitting"
              class="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
              :class="inputValue.trim() !== '' && !isSubmitting
                ? 'bg-primary text-white hover:bg-primary-dark active:scale-[0.98]'
                : 'bg-white/5 text-text-muted cursor-not-allowed'"
              @click="save"
            >{{ isSubmitting ? 'Saving…' : 'Save' }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
