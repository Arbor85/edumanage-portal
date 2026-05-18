<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { RoutineOut } from '../../types'
import { useRoutineStore } from '../../stores/routineStore'
import BaseModal from '../BaseModal.vue'
import BaseInput from '../BaseInput.vue'
import BaseBadge from '../BaseBadge.vue'
import EmptyState from '../EmptyState.vue'
import { ClipboardList } from 'lucide-vue-next'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; select: [routine: RoutineOut] }>()

const routineStore = useRoutineStore()
const search = ref('')

watch(() => props.open, (val) => {
  if (val) {
    search.value = ''
    if (!routineStore.routines.length) routineStore.fetch()
  }
})

const filtered = computed(() =>
  routineStore.routines.filter((r) =>
    !search.value || r.name?.toLowerCase().includes(search.value.toLowerCase()),
  ),
)

function pick(routine: RoutineOut) {
  emit('select', routine)
  emit('close')
}
</script>

<template>
  <BaseModal :open="open" title="Add from Routine" size="md" @close="emit('close')">
    <div class="flex flex-col gap-3">
      <BaseInput v-model="search" placeholder="Search routines..." autofocus />
      <ul class="flex flex-col gap-0.5 max-h-80 overflow-y-auto custom-scrollbar -mx-1 px-1">
        <li v-for="routine in filtered" :key="routine.id ?? ''">
          <button
            type="button"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-primary dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 text-left transition-colors"
            @click="pick(routine)"
          >
            <span class="flex-1 truncate font-medium">{{ routine.name }}</span>
            <BaseBadge :label="`${routine.excercises?.length ?? 0} exercises`" />
          </button>
        </li>
        <li v-if="!filtered.length">
          <EmptyState :icon="ClipboardList" title="No routines found" description="Try a different search term" />
        </li>
      </ul>
    </div>
  </BaseModal>
</template>
