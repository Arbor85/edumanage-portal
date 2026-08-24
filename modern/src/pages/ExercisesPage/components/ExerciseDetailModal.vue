<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { X, Pencil, Dumbbell } from 'lucide-vue-next'
import type { ExcerciseOut, ActivityType } from '../../../types'
import DifficultyBadge from '../../../components/DifficultyBadge.vue'
import ExerciseMuscleView from '../../../components/ExerciseMuscleView.vue'
import { exerciseImageMap } from '../../../data/exerciseImageMap'
import { usePageTitle } from '../../../composables/usePageTitle'

const ACTIVITY_TYPE_BADGE: Record<ActivityType, { label: string; color: string }> = {
  weighted:   { label: 'Weighted',   color: 'bg-blue-500/20 text-blue-400' },
  machine:    { label: 'Machine',    color: 'bg-purple-500/20 text-purple-400' },
  bodyweight: { label: 'Bodyweight', color: 'bg-emerald-500/20 text-emerald-400' },
  cardio:     { label: 'Cardio',     color: 'bg-orange-500/20 text-orange-400' },
}

const props = defineProps<{
  open: boolean
  exercise: ExcerciseOut | null
}>()
const emit = defineEmits<{ close: []; edit: [] }>()

usePageTitle(() => props.exercise?.name ?? 'Exercise Details', () => props.open)

watch(() => props.open, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})

const imgError = ref(false)
watch(() => props.exercise, () => { imgError.value = false })

const mapEntry = computed(() => exerciseImageMap[(props.exercise?.name ?? '').toLowerCase()])
const resolvedImagePath = computed(() => props.exercise?.imagePath ?? mapEntry.value?.imagePath ?? null)
const resolvedGifPath = computed(() => props.exercise?.gifPath ?? mapEntry.value?.gifPath ?? null)
const heroSrc = computed(() => imgError.value ? null : (resolvedImagePath.value ?? null))

const difficultyLevel = computed(() => {
  const level = props.exercise?.level?.toLowerCase()
  if (level === 'expert' || level === 'advanced') return 'Advanced' as const
  if (level === 'intermediate') return 'Intermediate' as const
  if (level === 'beginner') return 'Beginner' as const
  const tags = props.exercise?.tags ?? []
  for (const tag of tags) {
    const lower = tag.toLowerCase()
    if (/advanced|expert/.test(lower)) return 'Advanced' as const
    if (/intermediate/.test(lower)) return 'Intermediate' as const
    if (/beginner/.test(lower)) return 'Beginner' as const
  }
  return null
})

const badge = computed(() => ACTIVITY_TYPE_BADGE[props.exercise?.activityType ?? 'weighted'])

const metaChips = computed(() => {
  const ex = props.exercise
  if (!ex) return []
  return [
    ex.equipment && { label: ex.equipment, icon: '🔧' },
    ex.force && { label: ex.force, icon: '⚡' },
    ex.mechanic && { label: ex.mechanic, icon: '⚙️' },
    ex.category && { label: ex.category, icon: '📂' },
  ].filter(Boolean) as { label: string; icon: string }[]
})
</script>

<template>
  <Teleport to="body">
    <Transition name="detail-modal">
      <div
        v-if="open && exercise"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        role="dialog"
        aria-modal="true"
        :aria-label="exercise.name ?? 'Exercise details'"
      >
        <!-- Backdrop -->
        <div
          class="detail-backdrop absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="emit('close')"
        />

        <!-- Sheet -->
        <div class="detail-panel relative bg-surface dark:bg-surface-elevated flex flex-col w-full max-h-[92dvh] sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">

          <!-- Drag handle (mobile) -->
          <div class="sm:hidden flex justify-center pt-3 pb-0 flex-shrink-0">
            <div class="w-9 h-1 rounded-full bg-white/20" />
          </div>

          <!-- Hero image -->
          <div class="relative flex-shrink-0 aspect-[16/9] sm:aspect-[16/8] bg-gray-900 overflow-hidden group">
            <img
              v-if="heroSrc"
              :src="heroSrc"
              :alt="exercise.name ?? ''"
              class="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.03]"
              @error="imgError = true"
            />
            <img
              v-if="resolvedGifPath && !imgError"
              :src="resolvedGifPath"
              :alt="exercise.name ?? ''"
              aria-hidden="true"
              class="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
            />
            <div v-if="!heroSrc" class="w-full h-full flex items-center justify-center bg-gray-900">
              <Dumbbell class="w-14 h-14 text-gray-700" />
            </div>

            <!-- Gradient overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

            <!-- Close button (top-right) -->
            <button
              class="close-hero-btn absolute top-3 right-3"
              aria-label="Close"
              @click="emit('close')"
            >
              <X class="w-4 h-4" />
            </button>

            <!-- Name + badges (bottom of hero) -->
            <div class="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-10">
              <h2 class="text-xl font-bold text-white leading-tight mb-2 tracking-tight">
                {{ exercise.name }}
              </h2>
              <div class="flex items-center flex-wrap gap-2">
                <DifficultyBadge :level="difficultyLevel" />
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide"
                  :class="badge.color"
                >
                  {{ badge.label }}
                </span>
                <span
                  v-if="exercise.primaryMuscle"
                  class="inline-flex items-center px-2 py-0.5 rounded bg-white/10 text-white/70 text-[10px] font-semibold uppercase tracking-wide capitalize"
                >
                  {{ exercise.primaryMuscle }}
                </span>
              </div>
            </div>
          </div>

          <!-- Scrollable body -->
          <div class="flex-1 overflow-y-auto custom-scrollbar">
            <div class="p-5 space-y-6">

              <!-- Short description -->
              <p v-if="exercise.shortDescription" class="text-sm text-text-secondary dark:text-white/70 leading-relaxed">
                {{ exercise.shortDescription }}
              </p>

              <!-- Meta chips -->
              <div v-if="metaChips.length" class="flex flex-wrap gap-2">
                <span
                  v-for="chip in metaChips"
                  :key="chip.label"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/6 dark:bg-white/6 border border-white/8 text-xs text-text-secondary dark:text-white/60 capitalize"
                >
                  <span>{{ chip.icon }}</span>
                  {{ chip.label }}
                </span>
              </div>

              <!-- Muscle diagram -->
              <div v-if="exercise.primaryMuscle">
                <p class="section-label">Affected Muscles</p>
                <ExerciseMuscleView
                  :primary-muscle="exercise.primaryMuscle"
                  :secondary-muscles="exercise.secondaryMuscles as string[] | undefined"
                />
              </div>

              <!-- Instructions -->
              <div v-if="(exercise.instructions ?? []).length">
                <p class="section-label">Instructions</p>
                <ol class="space-y-3">
                  <li
                    v-for="(step, i) in exercise.instructions"
                    :key="i"
                    class="flex gap-3 text-sm text-text-secondary dark:text-white/70 leading-relaxed"
                  >
                    <span class="step-number flex-shrink-0">{{ i + 1 }}</span>
                    <span>{{ step }}</span>
                  </li>
                </ol>
              </div>

              <!-- Tags -->
              <div v-if="(exercise.tags ?? []).length">
                <p class="section-label">Tags</p>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="tag in exercise.tags"
                    :key="tag"
                    class="px-2.5 py-1 rounded-full bg-white/6 border border-white/8 text-xs text-text-muted dark:text-white/40 capitalize"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>

            </div>
          </div>

          <!-- Footer -->
          <div class="flex-shrink-0 px-5 py-4 border-t border-white/8">
            <button
              class="edit-btn w-full"
              @click="emit('edit')"
            >
              <Pencil class="w-4 h-4" />
              Edit Exercise
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Backdrop transition */
.detail-backdrop {
  transition: opacity 220ms ease-out;
}
.detail-modal-enter-from .detail-backdrop,
.detail-modal-leave-to .detail-backdrop {
  opacity: 0;
}

/* Panel transition — asymmetric timing */
.detail-panel {
  transition:
    transform 280ms cubic-bezier(0.23, 1, 0.32, 1),
    opacity   280ms cubic-bezier(0.23, 1, 0.32, 1);
}
.detail-modal-leave-active .detail-panel {
  transition:
    transform 180ms cubic-bezier(0.55, 0, 1, 0.45),
    opacity   180ms ease-in;
}

/* Mobile: slide up from bottom */
@media (max-width: 639px) {
  .detail-modal-enter-from .detail-panel,
  .detail-modal-leave-to   .detail-panel {
    transform: translateY(100%);
    opacity: 1;
  }
}

/* Desktop: scale + fade */
@media (min-width: 640px) {
  .detail-modal-enter-from .detail-panel,
  .detail-modal-leave-to   .detail-panel {
    transform: scale(0.96) translateY(8px);
    opacity: 0;
  }
}

/* Close button inside hero */
.close-hero-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  min-height: 36px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);
  color: rgba(255, 255, 255, 0.8);
  transition: background 150ms ease-out, color 150ms ease-out, transform 120ms cubic-bezier(0.23, 1, 0.32, 1);
}
.close-hero-btn:hover {
  background: rgba(0, 0, 0, 0.65);
  color: white;
}
.close-hero-btn:active {
  transform: scale(0.92);
}

.section-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.35);
  margin-bottom: 12px;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(0, 200, 150, 0.15);
  color: rgb(0, 200, 150);
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  margin-top: 1px;
}

.edit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  border-radius: 12px;
  background: rgb(0, 200, 150);
  color: rgb(0, 40, 30);
  font-size: 14px;
  font-weight: 600;
  transition: background 150ms ease-out, transform 120ms cubic-bezier(0.23, 1, 0.32, 1);
}
.edit-btn:hover {
  background: rgb(0, 220, 165);
}
.edit-btn:active {
  transform: scale(0.97);
}

@media (prefers-reduced-motion: reduce) {
  .detail-panel,
  .detail-modal-leave-active .detail-panel {
    transition: opacity 150ms ease;
    transform: none !important;
  }
}
</style>
