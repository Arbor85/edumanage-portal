<script setup lang="ts">
import { computed } from 'vue'
import { normalizeMuscle as normalize } from '../utils/muscleGroups'

const props = defineProps<{
  primaryMuscle: string
  secondaryMuscles?: string[]
  interactive?: boolean
}>()
const emit = defineEmits<{ select: [key: string] }>()

const primary = computed(() => normalize(props.primaryMuscle))
const secondaries = computed(() => (props.secondaryMuscles ?? []).map(normalize))

const PRIMARY_COLOR = 'rgba(0,200,150,1.0)'
const SECONDARY_COLOR = 'rgba(0,200,150,0.45)'
const INACTIVE_COLOR = 'rgba(255,255,255,0.06)'

function fill(muscle: string): string {
  if (primary.value === muscle) return PRIMARY_COLOR
  if (secondaries.value.includes(muscle)) return SECONDARY_COLOR
  return INACTIVE_COLOR
}

function onMuscle(key: string) {
  if (props.interactive) emit('select', key)
}

const allMuscles = computed(() => {
  const list: { key: string; label: string; role: 'primary' | 'secondary' }[] = []
  if (props.primaryMuscle) list.push({ key: primary.value, label: props.primaryMuscle, role: 'primary' })
  for (const s of props.secondaryMuscles ?? []) {
    list.push({ key: normalize(s), label: s, role: 'secondary' })
  }
  return list
})
</script>

<template>
  <div class="flex flex-col gap-6" :class="{ interactive }">
    <!-- Front + Back SVG bodies -->
    <div class="flex justify-center gap-8">
      <!-- Front view -->
      <div class="flex flex-col items-center gap-1">
        <span class="text-[10px] uppercase tracking-widest text-text-muted">Front</span>
        <svg viewBox="0 0 100 220" width="90" height="198" xmlns="http://www.w3.org/2000/svg" class="overflow-visible">
          <!-- Head -->
          <circle cx="50" cy="13" r="11" fill="rgba(255,255,255,0.06)" />
          <circle cx="50" cy="13" r="11" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="0.8" />
          <!-- Neck -->
          <rect x="46" y="23" width="8" height="8" rx="3" fill="rgba(255,255,255,0.05)" />

          <g class="mg" @click="onMuscle('shoulders')">
            <ellipse cx="27" cy="34" rx="10" ry="7" :fill="fill('shoulders')" />
            <ellipse cx="27" cy="34" rx="10" ry="7" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" pointer-events="none" />
            <ellipse cx="73" cy="34" rx="10" ry="7" :fill="fill('shoulders')" />
            <ellipse cx="73" cy="34" rx="10" ry="7" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" pointer-events="none" />
          </g>

          <g class="mg" @click="onMuscle('chest')">
            <path d="M37,29 L50,34 L50,61 L34,61 Z" :fill="fill('chest')" />
            <path d="M37,29 L50,34 L50,61 L34,61 Z" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" pointer-events="none" />
            <path d="M63,29 L50,34 L50,61 L66,61 Z" :fill="fill('chest')" />
            <path d="M63,29 L50,34 L50,61 L66,61 Z" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" pointer-events="none" />
          </g>

          <g class="mg" @click="onMuscle('biceps')">
            <rect x="15" y="33" width="13" height="30" rx="5" :fill="fill('biceps')" />
            <rect x="15" y="33" width="13" height="30" rx="5" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" pointer-events="none" />
            <rect x="72" y="33" width="13" height="30" rx="5" :fill="fill('biceps')" />
            <rect x="72" y="33" width="13" height="30" rx="5" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" pointer-events="none" />
          </g>

          <g class="mg" @click="onMuscle('triceps')">
            <rect x="10" y="33" width="7" height="28" rx="3" :fill="fill('triceps')" />
            <rect x="10" y="33" width="7" height="28" rx="3" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="0.8" pointer-events="none" />
            <rect x="83" y="33" width="7" height="28" rx="3" :fill="fill('triceps')" />
            <rect x="83" y="33" width="7" height="28" rx="3" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="0.8" pointer-events="none" />
          </g>

          <g class="mg" @click="onMuscle('forearms')">
            <rect x="10" y="63" width="11" height="24" rx="4" :fill="fill('forearms')" />
            <rect x="10" y="63" width="11" height="24" rx="4" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="0.8" pointer-events="none" />
            <rect x="79" y="63" width="11" height="24" rx="4" :fill="fill('forearms')" />
            <rect x="79" y="63" width="11" height="24" rx="4" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="0.8" pointer-events="none" />
          </g>

          <g class="mg" @click="onMuscle('core')">
            <rect x="35" y="61" width="30" height="28" rx="3" :fill="fill('core')" />
            <rect x="35" y="61" width="30" height="28" rx="3" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" pointer-events="none" />
          </g>

          <g class="mg" @click="onMuscle('glutes')">
            <rect x="30" y="87" width="40" height="15" rx="3" :fill="fill('glutes')" />
            <rect x="30" y="87" width="40" height="15" rx="3" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" pointer-events="none" />
          </g>

          <g class="mg" @click="onMuscle('quads')">
            <rect x="29" y="102" width="19" height="44" rx="5" :fill="fill('quads')" />
            <rect x="29" y="102" width="19" height="44" rx="5" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" pointer-events="none" />
            <rect x="52" y="102" width="19" height="44" rx="5" :fill="fill('quads')" />
            <rect x="52" y="102" width="19" height="44" rx="5" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" pointer-events="none" />
          </g>

          <g class="mg" @click="onMuscle('calves')">
            <rect x="30" y="148" width="16" height="38" rx="4" :fill="fill('calves')" />
            <rect x="30" y="148" width="16" height="38" rx="4" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" pointer-events="none" />
            <rect x="54" y="148" width="16" height="38" rx="4" :fill="fill('calves')" />
            <rect x="54" y="148" width="16" height="38" rx="4" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" pointer-events="none" />
          </g>

          <!-- Feet (non-interactive) -->
          <ellipse cx="38" cy="190" rx="11" ry="6" fill="rgba(255,255,255,0.04)" />
          <ellipse cx="62" cy="190" rx="11" ry="6" fill="rgba(255,255,255,0.04)" />
        </svg>
      </div>

      <!-- Back view -->
      <div class="flex flex-col items-center gap-1">
        <span class="text-[10px] uppercase tracking-widest text-text-muted">Back</span>
        <svg viewBox="0 0 100 220" width="90" height="198" xmlns="http://www.w3.org/2000/svg" class="overflow-visible">
          <!-- Head -->
          <circle cx="50" cy="13" r="11" fill="rgba(255,255,255,0.06)" />
          <circle cx="50" cy="13" r="11" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="0.8" />

          <g class="mg" @click="onMuscle('neck')">
            <rect x="46" y="23" width="8" height="8" rx="3" :fill="fill('neck')" />
          </g>

          <g class="mg" @click="onMuscle('traps')">
            <path d="M37,24 Q50,18 63,24 L66,40 Q50,35 34,40 Z" :fill="fill('traps')" />
            <path d="M37,24 Q50,18 63,24 L66,40 Q50,35 34,40 Z" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" pointer-events="none" />
          </g>

          <g class="mg" @click="onMuscle('shoulders')">
            <ellipse cx="27" cy="34" rx="10" ry="7" :fill="fill('shoulders')" />
            <ellipse cx="27" cy="34" rx="10" ry="7" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" pointer-events="none" />
            <ellipse cx="73" cy="34" rx="10" ry="7" :fill="fill('shoulders')" />
            <ellipse cx="73" cy="34" rx="10" ry="7" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" pointer-events="none" />
          </g>

          <g class="mg" @click="onMuscle('lats')">
            <path d="M34,40 L50,38 L50,70 L30,75 Z" :fill="fill('lats')" />
            <path d="M34,40 L50,38 L50,70 L30,75 Z" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" pointer-events="none" />
            <path d="M66,40 L50,38 L50,70 L70,75 Z" :fill="fill('lats')" />
            <path d="M66,40 L50,38 L50,70 L70,75 Z" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" pointer-events="none" />
          </g>

          <g class="mg" @click="onMuscle('triceps')">
            <rect x="15" y="33" width="13" height="30" rx="5" :fill="fill('triceps')" />
            <rect x="15" y="33" width="13" height="30" rx="5" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" pointer-events="none" />
            <rect x="72" y="33" width="13" height="30" rx="5" :fill="fill('triceps')" />
            <rect x="72" y="33" width="13" height="30" rx="5" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" pointer-events="none" />
          </g>

          <g class="mg" @click="onMuscle('forearms')">
            <rect x="10" y="63" width="11" height="24" rx="4" :fill="fill('forearms')" />
            <rect x="10" y="63" width="11" height="24" rx="4" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="0.8" pointer-events="none" />
            <rect x="79" y="63" width="11" height="24" rx="4" :fill="fill('forearms')" />
            <rect x="79" y="63" width="11" height="24" rx="4" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="0.8" pointer-events="none" />
          </g>

          <g class="mg" @click="onMuscle('lower_back')">
            <rect x="35" y="70" width="30" height="20" rx="3" :fill="fill('lower_back')" />
            <rect x="35" y="70" width="30" height="20" rx="3" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" pointer-events="none" />
          </g>

          <g class="mg" @click="onMuscle('glutes')">
            <ellipse cx="38" cy="97" rx="12" ry="12" :fill="fill('glutes')" />
            <ellipse cx="38" cy="97" rx="12" ry="12" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" pointer-events="none" />
            <ellipse cx="62" cy="97" rx="12" ry="12" :fill="fill('glutes')" />
            <ellipse cx="62" cy="97" rx="12" ry="12" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" pointer-events="none" />
          </g>

          <g class="mg" @click="onMuscle('hamstrings')">
            <rect x="29" y="108" width="19" height="40" rx="5" :fill="fill('hamstrings')" />
            <rect x="29" y="108" width="19" height="40" rx="5" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" pointer-events="none" />
            <rect x="52" y="108" width="19" height="40" rx="5" :fill="fill('hamstrings')" />
            <rect x="52" y="108" width="19" height="40" rx="5" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" pointer-events="none" />
          </g>

          <g class="mg" @click="onMuscle('calves')">
            <rect x="30" y="150" width="16" height="36" rx="4" :fill="fill('calves')" />
            <rect x="30" y="150" width="16" height="36" rx="4" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" pointer-events="none" />
            <rect x="54" y="150" width="16" height="36" rx="4" :fill="fill('calves')" />
            <rect x="54" y="150" width="16" height="36" rx="4" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" pointer-events="none" />
          </g>

          <!-- Feet (non-interactive) -->
          <ellipse cx="38" cy="190" rx="11" ry="6" fill="rgba(255,255,255,0.04)" />
          <ellipse cx="62" cy="190" rx="11" ry="6" fill="rgba(255,255,255,0.04)" />
        </svg>
      </div>
    </div>

    <!-- Legend -->
    <div v-if="allMuscles.length" class="flex flex-col gap-1.5">
      <div
        v-for="m in allMuscles"
        :key="m.key + m.role"
        class="flex items-center gap-2"
      >
        <span
          class="w-2 h-2 rounded-full flex-shrink-0"
          :style="{ background: m.role === 'primary' ? 'rgba(0,200,150,1)' : 'rgba(0,200,150,0.45)' }"
        />
        <span class="text-sm capitalize text-text-primary">{{ m.label }}</span>
        <span
          class="ml-auto text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
          :class="m.role === 'primary' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-text-muted'"
        >
          {{ m.role }}
        </span>
      </div>
    </div>
    <p v-else class="text-xs text-text-muted text-center">Click a muscle to select</p>
  </div>
</template>

<style scoped>
g.mg {
  transition: filter 120ms ease;
}
.interactive g.mg {
  cursor: pointer;
}
.interactive g.mg:hover {
  filter: brightness(1.5) drop-shadow(0 0 3px rgba(0, 200, 150, 0.4));
}
</style>
