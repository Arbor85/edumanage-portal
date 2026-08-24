<script setup lang="ts">
import { watch } from 'vue'
import { X } from 'lucide-vue-next'
import ExerciseMuscleView from './ExerciseMuscleView.vue'
import type { ExcerciseOut } from '../types'

const props = defineProps<{
  open: boolean
  exercise: ExcerciseOut | null
}>()
const emit = defineEmits<{ close: [] }>()

watch(() => props.open, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})
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
              <h3 class="text-sm font-semibold text-text-primary dark:text-white capitalize leading-tight">{{ exercise!.name }}</h3>
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
            <ExerciseMuscleView
              :primary-muscle="exercise!.primaryMuscle ?? ''"
              :secondary-muscles="exercise!.secondaryMuscles as string[]"
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
