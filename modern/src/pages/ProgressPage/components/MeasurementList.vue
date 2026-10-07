<script setup lang="ts">
import { computed } from 'vue'
import { Trash2 } from '@lucide/vue'
import type { BodyMeasurementOut } from '../../../types'
import { useBodyMeasurementStore } from '../../../stores/bodyMeasurementStore'
import { useToast } from '../../../composables/useToast'

const props = defineProps<{ measurements: BodyMeasurementOut[] }>()

const store = useBodyMeasurementStore()
const toast = useToast()

function fmt(v: number | null): string {
  return v == null ? '—' : String(v)
}

function fmtBp(s: number | null, d: number | null): string {
  if (s == null && d == null) return '—'
  return `${s ?? '—'}/${d ?? '—'}`
}

function fmtDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

async function remove(id: string) {
  try {
    await store.remove(id)
  } catch {
    toast.error('Failed to delete measurement')
  }
}
</script>

<template>
  <div class="bg-surface-card border border-white/5 rounded-2xl overflow-hidden">
    <p class="text-xs font-bold tracking-widest uppercase text-text-muted px-5 pt-5 pb-3">History</p>

    <div v-if="measurements.length === 0" class="px-5 pb-5 text-sm text-text-muted">
      No measurements logged yet.
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-xs">
        <thead>
          <tr class="border-b border-white/5 text-text-muted">
            <th class="text-left px-5 py-2 font-semibold">Date</th>
            <th class="text-right px-3 py-2 font-semibold whitespace-nowrap">Weight</th>
            <th class="text-right px-3 py-2 font-semibold whitespace-nowrap">Waist</th>
            <th class="text-right px-3 py-2 font-semibold whitespace-nowrap">Thigh</th>
            <th class="text-right px-3 py-2 font-semibold whitespace-nowrap">Bicep</th>
            <th class="text-right px-3 py-2 font-semibold whitespace-nowrap">Chest</th>
            <th class="text-right px-3 py-2 font-semibold whitespace-nowrap">Butt</th>
            <th class="text-right px-3 py-2 font-semibold whitespace-nowrap">BP</th>
            <th class="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="m in measurements"
            :key="m.id"
            class="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
          >
            <td class="px-5 py-2.5 text-text-secondary whitespace-nowrap">{{ fmtDate(m.date) }}</td>
            <td class="px-3 py-2.5 text-right text-white tabular-nums">{{ fmt(m.weightKg) }}</td>
            <td class="px-3 py-2.5 text-right text-white tabular-nums">{{ fmt(m.waistCm) }}</td>
            <td class="px-3 py-2.5 text-right text-white tabular-nums">{{ fmt(m.thighCm) }}</td>
            <td class="px-3 py-2.5 text-right text-white tabular-nums">{{ fmt(m.bicepCm) }}</td>
            <td class="px-3 py-2.5 text-right text-white tabular-nums">{{ fmt(m.chestCm) }}</td>
            <td class="px-3 py-2.5 text-right text-white tabular-nums">{{ fmt(m.buttCm) }}</td>
            <td class="px-3 py-2.5 text-right text-white tabular-nums whitespace-nowrap">{{ fmtBp(m.systolicMmHg, m.diastolicMmHg) }}</td>
            <td class="px-3 py-2.5">
              <button
                class="text-text-muted hover:text-red-400 transition-colors"
                @click="remove(m.id)"
              ><Trash2 class="w-3.5 h-3.5" /></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
