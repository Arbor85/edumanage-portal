import { ref, watch } from 'vue'

export type WeightUnit = 'kg' | 'lbs'

const KG_TO_LBS = 2.20462
const LS_KEY = 'weightUnit'

function roundQuarter(n: number): number {
  return Math.round(n * 4) / 4
}

// Module-level singleton — all components share the same reactive unit preference
const unit = ref<WeightUnit>(
  (localStorage.getItem(LS_KEY) as WeightUnit | null) ?? 'kg'
)

watch(unit, (val) => localStorage.setItem(LS_KEY, val))

export function useWeightUnit() {
  function toggle() {
    unit.value = unit.value === 'kg' ? 'lbs' : 'kg'
  }

  function toDisplay(kg: number): number {
    if (unit.value === 'kg') return roundQuarter(kg)
    return roundQuarter(kg * KG_TO_LBS)
  }

  function toKg(display: number): number {
    if (unit.value === 'kg') return display
    return display / KG_TO_LBS
  }

  return { unit, toggle, toDisplay, toKg }
}
