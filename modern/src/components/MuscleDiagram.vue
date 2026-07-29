<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  exerciseName: string
  activityType: string
}>()

const KEYWORDS: Record<string, string[]> = {
  chest: ['bench', 'push-up', 'pushup', 'fly', 'flye', 'chest', 'pec', 'dip'],
  shoulders: ['press', 'lateral raise', 'front raise', 'shoulder', 'overhead', 'military', 'delt', 'raise'],
  triceps: ['tricep', 'pushdown', 'skull', 'extension', 'dip'],
  biceps: ['curl', 'bicep', 'hammer', 'chin-up', 'chinup'],
  back: ['row', 'pull', 'lat', 'pulldown', 'back', 'deadlift', 'shrug', 'rdl', 'nordic'],
  core: ['plank', 'crunch', 'sit-up', 'situp', 'ab ', 'core', 'twist', 'russian', 'leg raise', 'hollow'],
  glutes: ['hip thrust', 'glute', 'bridge', 'kickback', 'clamshell'],
  quads: ['squat', 'leg press', 'lunge', 'step', 'quad', 'leg extension', 'split squat'],
  hamstrings: ['deadlift', 'hamstring', 'leg curl', 'rdl', 'nordic', 'stiff leg'],
  calves: ['calf', 'standing raise', 'seated raise', 'jump rope'],
  cardio: ['run', 'walk', 'jump', 'burpee', 'mountain climber', 'sprint', 'jog', 'cycle', 'bike', 'cardio', 'hiit'],
}

const targeted = computed(() => {
  const lower = props.exerciseName.toLowerCase()
  const found = new Set<string>()
  for (const [muscle, keywords] of Object.entries(KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) found.add(muscle)
  }
  if (found.size === 0) {
    if (props.activityType === 'cardio') found.add('cardio')
    else if (props.activityType === 'bodyweight') { found.add('core'); found.add('chest') }
    else if (props.activityType === 'weighted') found.add('back')
  }
  return found
})

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
</script>

<template>
  <div class="flex flex-wrap gap-1.5">
    <span
      v-for="muscle in [...targeted]"
      :key="muscle"
      class="px-2.5 py-0.5 text-xs font-bold rounded-full bg-primary/20 text-primary"
    >
      {{ capitalize(muscle) }}
    </span>
  </div>
</template>
