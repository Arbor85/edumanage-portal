<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Dumbbell, Play, Zap } from 'lucide-vue-next'
import BaseModal from './BaseModal.vue'
import { useRoutineStore } from '../stores/routineStore'
import { useWorkoutStore } from '../stores/workoutStore'
import type { PlanWorkoutOutput, RoutineOut } from '../types'

const props = defineProps<{
  open: boolean
  todayPlanWorkout?: PlanWorkoutOutput | null
  suggestedRoutine?: RoutineOut | null
  planId?: string
}>()
const emit = defineEmits<{ close: [] }>()

const router = useRouter()
const routineStore = useRoutineStore()
const workoutStore = useWorkoutStore()

const search = ref('')

const todayWorkout = computed(() => {
  if (props.todayPlanWorkout) {
    return {
      name: props.todayPlanWorkout.name ?? 'Today\'s Workout',
      note: props.todayPlanWorkout.note,
      exerciseCount: props.todayPlanWorkout.excercises?.length ?? 0,
      source: 'plan' as const,
    }
  }
  if (props.suggestedRoutine) {
    return {
      name: props.suggestedRoutine.name ?? 'Suggested Workout',
      note: props.suggestedRoutine.note,
      exerciseCount: props.suggestedRoutine.excercises?.length ?? 0,
      source: 'routine' as const,
    }
  }
  return null
})

const filtered = computed(() => {
  const todayId = props.todayPlanWorkout?.id ?? props.suggestedRoutine?.id
  return routineStore.routines.filter(
    (r) =>
      r.id !== todayId &&
      (!search.value || r.name?.toLowerCase().includes(search.value.toLowerCase()))
  )
})

function startTodayWorkout() {
  if (props.todayPlanWorkout) {
    workoutStore.startFromPlanWorkout(props.todayPlanWorkout, props.planId ?? '')
  } else if (props.suggestedRoutine) {
    workoutStore.startFromRoutine(props.suggestedRoutine)
  }
  emit('close')
  router.push('/workout/active')
}

function startRoutine(id: string) {
  const routine = routineStore.routines.find((r) => r.id === id)
  if (!routine) return
  workoutStore.startFromRoutine(routine)
  emit('close')
  router.push('/workout/active')
}

function startEmpty() {
  workoutStore.startEmpty()
  emit('close')
  router.push('/workout/active')
}
</script>

<template>
  <BaseModal :open="open" title="Start Workout" size="md" @close="emit('close')">
    <div class="overflow-y-auto custom-scrollbar" style="max-height: 72dvh">
      <div class="p-5 flex flex-col gap-5">

        <!-- ── Today's workout ────────────────────────────── -->
        <div v-if="todayWorkout">
          <p class="text-[10px] font-bold tracking-[0.14em] uppercase text-text-muted mb-2.5">
            {{ todayWorkout.source === 'plan' ? "Today's plan" : "Suggested for you" }}
          </p>
          <button
            class="group relative w-full text-left rounded-2xl overflow-hidden
                   bg-gradient-to-br from-primary/25 via-primary/10 to-transparent
                   border border-primary/30 p-4
                   hover:border-primary/50 hover:from-primary/30
                   active:scale-[0.99] transition-all duration-200"
            @click="startTodayWorkout"
          >
            <!-- Background glow -->
            <div class="absolute -top-8 -right-8 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none" />

            <div class="relative flex items-center gap-4">
              <!-- Play icon -->
              <div
                class="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-glow
                       group-hover:scale-105 transition-transform duration-200"
              >
                <Play class="w-5 h-5 text-white fill-white" />
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <p class="font-black text-white text-base leading-tight truncate">{{ todayWorkout.name }}</p>
                <p class="text-xs text-primary/80 mt-0.5 font-medium">
                  {{ todayWorkout.exerciseCount }} exercise{{ todayWorkout.exerciseCount !== 1 ? 's' : '' }}
                  <span v-if="todayWorkout.note" class="text-text-muted font-normal"> · {{ todayWorkout.note }}</span>
                </p>
              </div>

              <!-- Arrow -->
              <svg class="w-4 h-4 text-primary/60 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        <!-- ── Start empty ─────────────────────────────────── -->
        <div>
          <p v-if="!todayWorkout" class="text-[10px] font-bold tracking-[0.14em] uppercase text-text-muted mb-2.5">Quick start</p>
          <button
            class="group flex items-center gap-3.5 w-full p-3.5 rounded-xl
                   border border-dashed border-white/15
                   hover:border-white/30 hover:bg-white/3
                   active:scale-[0.98] transition-all text-left"
            @click="startEmpty"
          >
            <div
              class="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0
                     group-hover:bg-white/8 transition-colors"
            >
              <Zap class="w-4 h-4 text-text-muted group-hover:text-white/70 transition-colors" />
            </div>
            <div>
              <p class="font-semibold text-white/80 text-sm group-hover:text-white transition-colors">Empty Workout</p>
              <p class="text-xs text-text-muted mt-0.5">Add exercises as you go</p>
            </div>
          </button>
        </div>

        <!-- ── My routines ─────────────────────────────────── -->
        <div class="flex flex-col gap-3">
          <p class="text-[10px] font-bold tracking-[0.14em] uppercase text-text-muted">My routines</p>

          <!-- Search -->
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" stroke-width="2.5" />
                <path d="M21 21l-4.35-4.35" stroke-width="2.5" stroke-linecap="round" />
              </svg>
            </span>
            <input
              v-model="search"
              placeholder="Search routines…"
              class="w-full pl-9 pr-4 h-9 bg-white/5 border border-white/8 rounded-xl
                     text-sm text-white placeholder:text-text-muted outline-none
                     focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/30
                     transition-all"
            />
          </div>

          <!-- Loading -->
          <div v-if="routineStore.isLoading" class="flex flex-col gap-2">
            <div v-for="i in 3" :key="i" class="h-12 rounded-xl bg-white/5 animate-pulse" />
          </div>

          <!-- Empty -->
          <div v-else-if="!filtered.length" class="text-center py-5">
            <Dumbbell class="w-7 h-7 text-text-muted mx-auto mb-2" />
            <p class="text-sm text-text-secondary">
              {{ routineStore.routines.length === 0 ? 'No routines yet' : 'No matches' }}
            </p>
          </div>

          <!-- List -->
          <div v-else class="flex flex-col gap-1.5">
            <button
              v-for="routine in filtered"
              :key="routine.id ?? ''"
              class="group flex items-center gap-3 w-full px-3.5 py-3 rounded-xl
                     border border-white/5 bg-white/3
                     hover:border-white/12 hover:bg-white/6
                     active:scale-[0.98] transition-all text-left"
              @click="startRoutine(routine.id ?? '')"
            >
              <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Dumbbell class="w-3.5 h-3.5 text-primary" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-white text-sm truncate">{{ routine.name }}</p>
                <p class="text-xs text-text-muted mt-0.5">
                  {{ routine.excercises?.length ?? 0 }} exercise{{ (routine.excercises?.length ?? 0) !== 1 ? 's' : '' }}
                  <span v-if="routine.note"> · {{ routine.note }}</span>
                </p>
              </div>
              <Play class="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-colors flex-shrink-0" />
            </button>
          </div>
        </div>

      </div>
    </div>
  </BaseModal>
</template>
