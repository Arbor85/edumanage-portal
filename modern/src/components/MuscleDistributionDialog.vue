<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { X, Loader2 } from 'lucide-vue-next'
import ExerciseMuscleView from './ExerciseMuscleView.vue'
import type { ExcerciseOut } from '../types'
import { fetchMuscleVisualization, isApiConfigured } from '../services/muscleVisualizerApi'

const props = defineProps<{
  open: boolean
  exercise: ExcerciseOut | null
}>()
const emit = defineEmits<{ close: [] }>()

const apiImageUrl = ref<string | null>(null)
const loading = ref(false)

watch(
  () => props.open && props.exercise,
  async (val) => {
    if (!val || !props.exercise) { apiImageUrl.value = null; return }
    if (!isApiConfigured()) return

    loading.value = true
    apiImageUrl.value = null
    apiImageUrl.value = await fetchMuscleVisualization(
      props.exercise.primaryMuscle ?? '',
      (props.exercise.secondaryMuscles ?? []) as string[],
    )
    loading.value = false
  },
)

watch(() => props.open, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})
onUnmounted(() => { document.body.style.overflow = '' })
</script>

<template>
  <Teleport to="body">
    <Transition name="muscle-dialog">
      <div
        v-if="open && exercise"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-label="Muscle distribution"
      >
        <!-- Backdrop -->
        <div
          class="muscle-backdrop absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="emit('close')"
        />

        <!-- Panel -->
        <div class="muscle-panel relative bg-surface dark:bg-surface-elevated w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92dvh]">

          <!-- Drag handle (mobile) -->
          <div class="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
            <div class="w-9 h-1 rounded-full bg-white/20" />
          </div>

          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-white/8 flex-shrink-0">
            <div>
              <p class="text-[10px] uppercase tracking-widest text-text-muted mb-0.5 font-semibold">Muscle Distribution</p>
              <h3 class="text-sm font-semibold text-text-primary dark:text-white capitalize leading-tight">{{ exercise.name }}</h3>
            </div>
            <button
              class="close-btn"
              aria-label="Close"
              @click="emit('close')"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto custom-scrollbar p-5">

            <!-- API image (when key is configured) -->
            <template v-if="isApiConfigured()">
              <div v-if="loading" class="flex justify-center items-center py-16">
                <Loader2 class="w-8 h-8 text-primary animate-spin" />
              </div>
              <img
                v-else-if="apiImageUrl"
                :src="apiImageUrl"
                :alt="`Muscle diagram for ${exercise.name}`"
                class="w-full rounded-xl"
              />
              <ExerciseMuscleView
                v-else
                :primary-muscle="exercise.primaryMuscle ?? ''"
                :secondary-muscles="(exercise.secondaryMuscles ?? []) as string[]"
              />
            </template>

            <!-- SVG fallback (no API key) -->
            <ExerciseMuscleView
              v-else
              :primary-muscle="exercise.primaryMuscle ?? ''"
              :secondary-muscles="(exercise.secondaryMuscles ?? []) as string[]"
            />

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Backdrop */
.muscle-backdrop {
  transition: opacity 200ms ease-out;
}
.muscle-dialog-enter-from .muscle-backdrop,
.muscle-dialog-leave-to  .muscle-backdrop {
  opacity: 0;
}

/* Panel — asymmetric timing */
.muscle-panel {
  transition:
    transform 260ms cubic-bezier(0.23, 1, 0.32, 1),
    opacity   260ms cubic-bezier(0.23, 1, 0.32, 1);
}
.muscle-dialog-leave-active .muscle-panel {
  transition:
    transform 160ms cubic-bezier(0.55, 0, 1, 0.45),
    opacity   160ms ease-in;
}

/* Mobile: slide up */
@media (max-width: 639px) {
  .muscle-dialog-enter-from .muscle-panel,
  .muscle-dialog-leave-to   .muscle-panel {
    transform: translateY(100%);
    opacity: 1;
  }
}

/* Desktop: scale + fade */
@media (min-width: 640px) {
  .muscle-dialog-enter-from .muscle-panel,
  .muscle-dialog-leave-to   .muscle-panel {
    transform: scale(0.95) translateY(6px);
    opacity: 0;
  }
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.45);
  transition: background 150ms ease-out, color 150ms ease-out, transform 120ms cubic-bezier(0.23, 1, 0.32, 1);
}
.close-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}
.close-btn:active {
  transform: scale(0.92);
}

@media (prefers-reduced-motion: reduce) {
  .muscle-panel,
  .muscle-dialog-leave-active .muscle-panel {
    transition: opacity 150ms ease;
    transform: none !important;
  }
}
</style>
