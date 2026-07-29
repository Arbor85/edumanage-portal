<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  muscleFrequency: Record<string, number>
}>()

// Map frequency count to fill opacity (0–1)
function opacity(muscle: string): number {
  const count = props.muscleFrequency[muscle] ?? 0
  if (count === 0) return 0.08
  if (count <= 2) return 0.3
  if (count <= 5) return 0.6
  return 1
}

function fill(muscle: string): string {
  return `rgba(0,200,150,${opacity(muscle)})`
}

const hasAnyData = computed(() => Object.values(props.muscleFrequency).some((v) => v > 0))

const TOP_MUSCLES = ['chest', 'shoulders', 'biceps', 'triceps', 'back', 'core'] as const
const LOWER_MUSCLES = ['glutes', 'quads', 'hamstrings', 'calves'] as const

function muscleLabel(m: string) {
  return m.charAt(0).toUpperCase() + m.slice(1)
}
</script>

<template>
  <div class="flex gap-4 items-start">
    <!-- SVG body (front view) -->
    <div class="flex-shrink-0">
      <svg
        viewBox="0 0 100 220"
        width="80"
        height="176"
        xmlns="http://www.w3.org/2000/svg"
        class="overflow-visible"
      >
        <!-- Head -->
        <circle cx="50" cy="13" r="11" :fill="fill('core')" opacity="0.4" />
        <circle cx="50" cy="13" r="11" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="0.8" />

        <!-- Neck -->
        <rect x="46" y="23" width="8" height="8" rx="3" fill="rgba(255,255,255,0.06)" />

        <!-- Left shoulder -->
        <ellipse cx="27" cy="34" rx="10" ry="7" :fill="fill('shoulders')" />
        <ellipse cx="27" cy="34" rx="10" ry="7" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />

        <!-- Right shoulder -->
        <ellipse cx="73" cy="34" rx="10" ry="7" :fill="fill('shoulders')" />
        <ellipse cx="73" cy="34" rx="10" ry="7" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />

        <!-- Chest left -->
        <path d="M37,29 L50,34 L50,61 L34,61 Z" :fill="fill('chest')" />
        <path d="M37,29 L50,34 L50,61 L34,61 Z" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />

        <!-- Chest right -->
        <path d="M63,29 L50,34 L50,61 L66,61 Z" :fill="fill('chest')" />
        <path d="M63,29 L50,34 L50,61 L66,61 Z" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />

        <!-- Left bicep -->
        <rect x="15" y="33" width="13" height="30" rx="5" :fill="fill('biceps')" />
        <rect x="15" y="33" width="13" height="30" rx="5" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />

        <!-- Right bicep -->
        <rect x="72" y="33" width="13" height="30" rx="5" :fill="fill('biceps')" />
        <rect x="72" y="33" width="13" height="30" rx="5" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />

        <!-- Left forearm -->
        <rect x="10" y="63" width="11" height="24" rx="4" fill="rgba(255,255,255,0.05)" />
        <rect x="10" y="63" width="11" height="24" rx="4" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />

        <!-- Right forearm -->
        <rect x="79" y="63" width="11" height="24" rx="4" fill="rgba(255,255,255,0.05)" />
        <rect x="79" y="63" width="11" height="24" rx="4" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />

        <!-- Core / abs -->
        <rect x="35" y="61" width="30" height="28" rx="3" :fill="fill('core')" />
        <rect x="35" y="61" width="30" height="28" rx="3" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />

        <!-- Hip / glutes -->
        <rect x="30" y="87" width="40" height="15" rx="3" :fill="fill('glutes')" />
        <rect x="30" y="87" width="40" height="15" rx="3" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />

        <!-- Left quad -->
        <rect x="29" y="102" width="19" height="44" rx="5" :fill="fill('quads')" />
        <rect x="29" y="102" width="19" height="44" rx="5" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />

        <!-- Right quad -->
        <rect x="52" y="102" width="19" height="44" rx="5" :fill="fill('quads')" />
        <rect x="52" y="102" width="19" height="44" rx="5" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />

        <!-- Left calf -->
        <rect x="30" y="148" width="16" height="38" rx="4" :fill="fill('calves')" />
        <rect x="30" y="148" width="16" height="38" rx="4" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />

        <!-- Right calf -->
        <rect x="54" y="148" width="16" height="38" rx="4" :fill="fill('calves')" />
        <rect x="54" y="148" width="16" height="38" rx="4" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />

        <!-- Feet -->
        <ellipse cx="38" cy="190" rx="11" ry="6" fill="rgba(255,255,255,0.04)" />
        <ellipse cx="62" cy="190" rx="11" ry="6" fill="rgba(255,255,255,0.04)" />
      </svg>
    </div>

    <!-- Muscle frequency bars -->
    <div class="flex-1 flex flex-col gap-2">
      <p class="text-[10px] font-bold tracking-widest uppercase text-text-muted mb-1">This month</p>

      <template v-if="hasAnyData">
        <div
          v-for="muscle in [...TOP_MUSCLES, ...LOWER_MUSCLES]"
          :key="muscle"
          class="flex items-center gap-2"
        >
          <span class="text-[11px] text-text-secondary w-20 flex-shrink-0">{{ muscleLabel(muscle) }}</span>
          <div class="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              class="h-full bg-primary rounded-full transition-all duration-700"
              :style="{ width: `${Math.min(100, (muscleFrequency[muscle] ?? 0) * 10)}%` }"
            />
          </div>
          <span class="text-[11px] text-text-muted w-4 text-right tabular-nums">
            {{ muscleFrequency[muscle] ?? 0 }}
          </span>
        </div>
      </template>

      <p v-else class="text-xs text-text-muted">
        Complete workouts to see which muscles you're training.
      </p>
    </div>
  </div>
</template>
