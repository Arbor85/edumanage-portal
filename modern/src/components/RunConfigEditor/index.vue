<script setup lang="ts">
import { computed } from 'vue'
import type { RunConfig, RunType, EffortLevel } from '../../types'

const props = defineProps<{ runConfig: RunConfig | null | undefined }>()
const emit = defineEmits<{ 'update:runConfig': [value: RunConfig] }>()

const config = computed<RunConfig>(() => props.runConfig ?? {
  runType: 'easy',
  trackType: 'distance',
})

function update(patch: Partial<RunConfig>) {
  emit('update:runConfig', { ...config.value, ...patch })
}

const RUN_TYPES: { value: RunType; label: string }[] = [
  { value: 'easy',      label: 'Easy' },
  { value: 'tempo',     label: 'Tempo' },
  { value: 'longRun',   label: 'Long Run' },
  { value: 'intervals', label: 'Intervals' },
]

const EFFORT_LEVELS: { value: EffortLevel; label: string }[] = [
  { value: 'easy',      label: 'Easy' },
  { value: 'moderate',  label: 'Moderate' },
  { value: 'tempo',     label: 'Tempo' },
  { value: 'racePace',  label: 'Race Pace' },
]

function formatPace(val: number | null | undefined): string {
  if (!val) return ''
  const mins = Math.floor(val)
  const secs = Math.round((val - mins) * 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function parsePace(str: string): number | null {
  const match = str.match(/^(\d+):(\d{1,2})$/)
  if (!match) return null
  return parseInt(match[1]) + parseInt(match[2]) / 60
}

function onPaceInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  const parsed = parsePace(val)
  if (parsed !== null) update({ targetPaceMinPerKm: parsed })
}

function chip(active: boolean) {
  return active
    ? 'bg-primary text-white border-primary'
    : 'bg-white dark:bg-surface-dark text-text-primary dark:text-white border-gray-200 dark:border-white/10 hover:border-primary/50'
}
</script>

<template>
  <div class="flex flex-col gap-4">

    <!-- Run type -->
    <div class="flex flex-col gap-2">
      <span class="text-xs font-bold uppercase tracking-wider text-text-secondary">Run type</span>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="rt in RUN_TYPES"
          :key="rt.value"
          type="button"
          class="chip"
          :class="chip(config.runType === rt.value)"
          @click="update({ runType: rt.value })"
        >
          {{ rt.label }}
        </button>
      </div>
    </div>

    <!-- Track type -->
    <div class="flex flex-col gap-2">
      <span class="text-xs font-bold uppercase tracking-wider text-text-secondary">Measure by</span>
      <div class="flex gap-1.5">
        <button type="button" class="chip" :class="chip(config.trackType === 'distance')" @click="update({ trackType: 'distance' })">Distance</button>
        <button type="button" class="chip" :class="chip(config.trackType === 'time')"     @click="update({ trackType: 'time' })">Time</button>
      </div>
    </div>

    <!-- Intervals fields -->
    <template v-if="config.runType === 'intervals'">
      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs text-text-secondary font-medium">Repeats</label>
          <input
            type="number"
            min="1"
            :value="config.repeats ?? ''"
            @input="update({ repeats: +($event.target as HTMLInputElement).value || null })"
            class="run-input"
            placeholder="e.g. 6"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-text-secondary font-medium">Rest (seconds)</label>
          <input
            type="number"
            min="0"
            :value="config.restSeconds ?? ''"
            @input="update({ restSeconds: +($event.target as HTMLInputElement).value || null })"
            class="run-input"
            placeholder="e.g. 90"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-text-secondary font-medium">
            {{ config.trackType === 'distance' ? 'Distance per interval (m)' : 'Duration per interval (s)' }}
          </label>
          <input
            v-if="config.trackType === 'distance'"
            type="number"
            min="1"
            :value="config.intervalDistanceMeters ?? ''"
            @input="update({ intervalDistanceMeters: +($event.target as HTMLInputElement).value || null })"
            class="run-input"
            placeholder="e.g. 400"
          />
          <input
            v-else
            type="number"
            min="1"
            :value="config.intervalDurationSeconds ?? ''"
            @input="update({ intervalDurationSeconds: +($event.target as HTMLInputElement).value || null })"
            class="run-input"
            placeholder="e.g. 120"
          />
        </div>
      </div>
    </template>

    <!-- Tempo warmup / cooldown -->
    <template v-if="config.runType === 'tempo'">
      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs text-text-secondary font-medium">Warmup (seconds)</label>
          <input
            type="number"
            min="0"
            :value="config.warmupSeconds ?? ''"
            @input="update({ warmupSeconds: +($event.target as HTMLInputElement).value || null })"
            class="run-input"
            placeholder="optional"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-text-secondary font-medium">Cooldown (seconds)</label>
          <input
            type="number"
            min="0"
            :value="config.cooldownSeconds ?? ''"
            @input="update({ cooldownSeconds: +($event.target as HTMLInputElement).value || null })"
            class="run-input"
            placeholder="optional"
          />
        </div>
      </div>
    </template>

    <!-- Total distance / time (non-intervals) -->
    <div v-if="config.runType !== 'intervals'" class="flex flex-col gap-1">
      <label class="text-xs text-text-secondary font-medium">
        {{ config.trackType === 'distance' ? 'Total distance (m)' : 'Total duration (seconds)' }}
      </label>
      <input
        v-if="config.trackType === 'distance'"
        type="number"
        min="1"
        :value="config.totalDistanceMeters ?? ''"
        @input="update({ totalDistanceMeters: +($event.target as HTMLInputElement).value || null })"
        class="run-input"
        placeholder="e.g. 10000"
      />
      <input
        v-else
        type="number"
        min="1"
        :value="config.totalDurationSeconds ?? ''"
        @input="update({ totalDurationSeconds: +($event.target as HTMLInputElement).value || null })"
        class="run-input"
        placeholder="e.g. 3600"
      />
    </div>

    <!-- Pace -->
    <div class="flex flex-col gap-1">
      <label class="text-xs text-text-secondary font-medium">
        Target pace (min/km) <span class="opacity-60">— optional</span>
      </label>
      <input
        type="text"
        :value="config.targetPaceMinPerKm ? formatPace(config.targetPaceMinPerKm) : ''"
        @change="onPaceInput"
        class="run-input"
        placeholder="e.g. 5:30"
      />
    </div>

    <!-- Effort level -->
    <div class="flex flex-col gap-2">
      <span class="text-xs font-bold uppercase tracking-wider text-text-secondary">
        Effort level <span class="opacity-60 font-normal normal-case">— optional</span>
      </span>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="el in EFFORT_LEVELS"
          :key="el.value"
          type="button"
          class="chip"
          :class="chip(config.effortLevel === el.value)"
          @click="update({ effortLevel: config.effortLevel === el.value ? null : el.value })"
        >
          {{ el.label }}
        </button>
      </div>
    </div>

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
.run-input {
  width: 100%;
  border-radius: 0.5rem;
  border-width: 1px;
  border-color: rgb(229 231 235);
  background: white;
  padding: 0.375rem 0.625rem;
  font-size: 0.875rem;
  color: rgb(17 24 39);
  outline: none;
  transition: border-color 150ms;
}
.run-input:focus {
  border-color: var(--color-primary, #6366f1);
}
:is(.dark) .run-input {
  border-color: rgba(255 255 255 / 0.1);
  background: rgba(255 255 255 / 0.05);
  color: white;
}
:is(.dark) .run-input:focus {
  border-color: var(--color-primary, #6366f1);
}
</style>
