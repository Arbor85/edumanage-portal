<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-vue-next'
import BaseButton from '../../../../components/BaseButton.vue'
import BaseInput from '../../../../components/BaseInput.vue'
import BaseSelect from '../../../../components/BaseSelect.vue'
import type { OrganizationMemberOut, AvailabilityOut, TrainerCourseAssociationOut, CourseOut, AvailabilityCreate } from '../../../../types'

const props = defineProps<{
  trainer: OrganizationMemberOut
  availabilities: AvailabilityOut[]
  trainerCourses: TrainerCourseAssociationOut[]
  availableCourses: CourseOut[]
  allCourses: CourseOut[]
}>()

const emit = defineEmits<{
  delete: [id: string]
  expand: []
  addAvailability: [payload: AvailabilityCreate]
  deleteAvailability: [id: string]
  assignCourse: [courseId: string]
  removeCourse: [associationId: string]
}>()

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const expanded = ref(false)
const showForm = ref(false)
const form = ref<AvailabilityCreate>({
  daysOfWeek: [], startTime: '09:00', endTime: '17:00', validFrom: null, validTo: null,
})

const courseToAssign = ref('')

const displayName = computed(() => {
  const { firstName, lastName } = props.trainer
  if (firstName || lastName) return [firstName, lastName].filter(Boolean).join(' ')
  return null
})

function toggle() {
  expanded.value = !expanded.value
  if (expanded.value) emit('expand')
}

function toggleDay(day: string) {
  const idx = form.value.daysOfWeek.indexOf(day)
  idx === -1 ? form.value.daysOfWeek.push(day) : form.value.daysOfWeek.splice(idx, 1)
}

function saveAvailability() {
  emit('addAvailability', { ...form.value })
  form.value = { daysOfWeek: [], startTime: '09:00', endTime: '17:00', validFrom: null, validTo: null }
  showForm.value = false
}

function assignCourse() {
  if (!courseToAssign.value) return
  emit('assignCourse', courseToAssign.value)
  courseToAssign.value = ''
}

function trainerLabel(id: string) {
  const parts = id.split('|')
  const hash = parts.length > 1 ? parts[1] : id
  return hash.length > 10 ? '···' + hash.slice(-10) : hash
}

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function courseName(courseId: string) {
  return props.allCourses.find(c => c.id === courseId)?.name ?? courseId
}
</script>

<template>
  <div class="bg-surface dark:bg-surface-card rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
    <!-- Row header -->
    <div
      class="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
      @click="toggle"
    >
      <div class="w-9 h-9 rounded-xl bg-black/[0.06] dark:bg-white/[0.08] flex items-center justify-center flex-shrink-0">
        <span class="text-sm font-bold text-text-secondary">
          {{ displayName ? displayName.charAt(0).toUpperCase() : 'T' }}
        </span>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-text-primary dark:text-white">
          {{ displayName ?? trainerLabel(trainer.trainerUserId) }}
        </p>
        <p class="text-xs text-text-secondary mt-0.5 font-mono" v-if="displayName">
          {{ trainerLabel(trainer.trainerUserId) }}
        </p>
        <p class="text-xs text-text-secondary mt-0.5">
          Joined {{ new Date(trainer.joinedAt).toLocaleDateString() }}
        </p>
      </div>
      <div class="flex items-center gap-2 flex-shrink-0">
        <BaseButton size="sm" variant="ghost" @click.stop="emit('delete', trainer.trainerUserId)">
          <Trash2 class="w-3.5 h-3.5 text-red-400" />
        </BaseButton>
        <component :is="expanded ? ChevronUp : ChevronDown" class="w-4 h-4 text-text-secondary ml-1" />
      </div>
    </div>

    <!-- Expanded panel -->
    <div v-if="expanded" class="border-t border-gray-100 dark:border-white/5 px-5 py-4 space-y-6">

      <!-- Availability -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <p class="text-xs font-semibold text-text-secondary">Availability</p>
          <BaseButton size="sm" variant="ghost" @click="showForm = true">
            <Plus class="w-3.5 h-3.5" /> Add slot
          </BaseButton>
        </div>

        <div v-if="showForm" class="mb-4 p-4 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] space-y-3">
          <div>
            <p class="text-xs font-medium text-text-secondary mb-2">Days <span class="font-normal opacity-60">(empty = all days)</span></p>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="day in DAYS"
                :key="day"
                class="px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors"
                :class="form.daysOfWeek.includes(day)
                  ? 'bg-primary text-white border-primary'
                  : 'border-gray-300 dark:border-white/20 text-gray-600 dark:text-white/60 hover:border-primary/50'"
                @click="toggleDay(day)"
              >{{ day.slice(0, 3) }}</button>
            </div>
          </div>
          <div>
            <p class="text-xs font-medium text-text-secondary mb-1.5">Time range</p>
            <div class="flex items-center gap-2">
              <BaseInput v-model="form.startTime" type="time" />
              <span class="text-text-secondary text-sm flex-shrink-0">–</span>
              <BaseInput v-model="form.endTime" type="time" />
            </div>
          </div>
          <div>
            <p class="text-xs font-medium text-text-secondary mb-1.5">Valid period <span class="font-normal opacity-60">(optional)</span></p>
            <div class="flex gap-2">
              <BaseInput :model-value="form.validFrom ?? ''" type="date" @update:model-value="form.validFrom = $event || null" />
              <BaseInput :model-value="form.validTo ?? ''" type="date" @update:model-value="form.validTo = $event || null" />
            </div>
          </div>
          <div class="flex gap-2 pt-1">
            <BaseButton size="sm" variant="primary" @click="saveAvailability">Save</BaseButton>
            <BaseButton size="sm" variant="ghost" @click="showForm = false">Cancel</BaseButton>
          </div>
        </div>

        <p v-if="availabilities.length === 0 && !showForm" class="text-xs text-text-secondary">
          No availability slots defined.
        </p>
        <div
          v-for="slot in availabilities"
          :key="slot.id"
          class="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-white/[0.05] last:border-0"
        >
          <div class="flex gap-1 flex-wrap flex-1">
            <span
              v-if="slot.daysOfWeek.length === 0"
              class="px-1.5 py-0.5 bg-black/5 dark:bg-white/10 text-text-secondary text-xs rounded-md font-medium"
            >All days</span>
            <span
              v-for="d in slot.daysOfWeek"
              :key="d"
              class="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded-md font-medium"
            >{{ d.slice(0, 3) }}</span>
          </div>
          <span class="text-xs font-mono text-text-primary dark:text-white/70 tabular-nums flex-shrink-0">
            {{ slot.startTime }}–{{ slot.endTime }}
          </span>
          <span class="text-xs text-text-secondary flex-shrink-0 hidden sm:block">
            {{ formatDate(slot.validFrom) }} – {{ formatDate(slot.validTo) }}
          </span>
          <BaseButton size="sm" variant="ghost" @click="emit('deleteAvailability', slot.id)">
            <Trash2 class="w-3.5 h-3.5 text-red-400" />
          </BaseButton>
        </div>
      </div>

      <!-- Qualified Courses -->
      <div>
        <p class="text-xs font-semibold text-text-secondary mb-3">Qualified Courses</p>
        <div class="flex flex-wrap gap-2 mb-3">
          <span
            v-for="assoc in trainerCourses"
            :key="assoc.id"
            class="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-medium"
          >
            {{ courseName(assoc.courseId) }}
            <button
              class="ml-0.5 text-primary/60 hover:text-primary transition-colors"
              @click="emit('removeCourse', assoc.id)"
            >
              <Trash2 class="w-3 h-3" />
            </button>
          </span>
          <span v-if="trainerCourses.length === 0" class="text-xs text-text-secondary">
            No courses assigned.
          </span>
        </div>
        <BaseSelect
          v-model="courseToAssign"
          placeholder="Assign course…"
          :options="availableCourses.map(c => ({ value: c.id!, label: c.name ?? c.id! }))"
          @update:model-value="assignCourse"
        />
      </div>
    </div>
  </div>
</template>
