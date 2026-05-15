<script setup lang="ts">
import type { RoutineOut } from '../../../types'
import SkeletonBlock from '../../../components/SkeletonBlock.vue'
import EmptyState from '../../../components/EmptyState.vue'
import BaseBadge from '../../../components/BaseBadge.vue'
import BaseButton from '../../../components/BaseButton.vue'
import PaginationBar from '../../../components/PaginationBar.vue'
import ConfirmDialog from '../../../components/ConfirmDialog.vue'
import { ref, computed } from 'vue'
import { useWorkoutStore } from '../../../stores/workoutStore'
import { useRouter } from 'vue-router'
import { useToast } from '../../../composables/useToast'
import { useRoutineStore } from '../../../stores/routineStore'

const props = defineProps<{
  routines: RoutineOut[]
  loading: boolean
}>()
const emit = defineEmits<{ edit: [r: RoutineOut] }>()

const workoutStore = useWorkoutStore()
const routineStore = useRoutineStore()
const router = useRouter()
const toast = useToast()

const page = ref(1)
const PAGE_SIZE = 20
const deleteTarget = ref<RoutineOut | null>(null)

const paginated = computed(() =>
  props.routines.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE)
)

function start(r: RoutineOut) {
  workoutStore.startFromRoutine(r)
  router.push('/workout/active')
}

async function handleDelete() {
  if (!deleteTarget.value?.id) return
  try {
    await routineStore.remove(deleteTarget.value.id)
    toast.success('Routine deleted')
    deleteTarget.value = null
  } catch {
    toast.error('Failed to delete routine')
  }
}
</script>

<template>
  <div>
    <!-- Loading skeleton -->
    <div v-if="loading" class="flex flex-col gap-3">
      <SkeletonBlock v-for="i in 5" :key="i" height="4rem" />
    </div>

    <!-- Empty state -->
    <EmptyState
      v-else-if="!routines.length"
      icon="📋"
      title="No routines yet"
      description="Create your first workout routine."
    />

    <!-- List -->
    <div v-else class="flex flex-col gap-3 custom-scrollbar">
      <div
        v-for="routine in paginated"
        :key="routine.id ?? ''"
        class="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/10 p-4 flex items-center gap-4"
      >
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-text-primary dark:text-white truncate">{{ routine.name }}</p>
          <p v-if="routine.note" class="text-xs text-text-secondary truncate mt-0.5">{{ routine.note }}</p>
        </div>
        <BaseBadge :label="`${routine.excercises?.length ?? 0} exercises`" />
        <div class="flex gap-1.5">
          <BaseButton size="sm" variant="primary" @click="start(routine)">▶ Start</BaseButton>
          <BaseButton size="sm" variant="ghost" aria-label="Edit" @click="emit('edit', routine)">✏️</BaseButton>
        </div>
      </div>
    </div>

    <PaginationBar :page="page" :page-size="PAGE_SIZE" :total="routines.length" @update:page="page = $event" />

    <ConfirmDialog
      :open="deleteTarget !== null"
      title="Delete Routine"
      message="Delete this routine?"
      confirm-label="Delete"
      variant="danger"
      @confirm="handleDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
