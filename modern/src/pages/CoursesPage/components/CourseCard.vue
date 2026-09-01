<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown, ChevronUp, Plus, Trash2, Pencil, GraduationCap, Clock } from 'lucide-vue-next'
import BaseButton from '../../../components/BaseButton.vue'
import BaseInput from '../../../components/BaseInput.vue'
import BaseBadge from '../../../components/BaseBadge.vue'
import type { CourseOut, CourseAvailabilityOut, CourseAvailabilityCreate } from '../../../types'

const props = defineProps<{
  course: CourseOut
  availabilities: CourseAvailabilityOut[]
}>()

const emit = defineEmits<{
  edit: [course: CourseOut]
  delete: [id: string]
  addAvailability: [payload: CourseAvailabilityCreate]
  deleteAvailability: [id: string]
  expand: []
}>()

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const expanded = ref(false)
const showForm = ref(false)
const form = ref<CourseAvailabilityCreate>({
  daysOfWeek: [], startTime: '09:00', endTime: '17:00', validFrom: null, validTo: null,
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

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDuration(minutes: number | null) {
  if (!minutes) return null
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}
</script>

<template>
  <div class="bg-surface dark:bg-surface-card rounded-2xl border border-gray-100/80 dark:border-white/5 overflow-hidden shadow-card">
    <!-- Header row -->
    <div
      class="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
      @click="toggle"
    >
      <div class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <GraduationCap class="w-4 h-4 text-primary" />
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <p class="text-sm font-semibold text-text-primary dark:text-white">{{ course.name }}</p>
          <BaseBadge :label="course.type ?? 'online'" />
        </div>
        <div class="flex items-center gap-3 mt-0.5">
          <p v-if="course.description" class="text-xs text-text-secondary truncate max-w-xs">{{ course.description }}</p>
          <span v-if="course.durationMinutes" class="flex items-center gap-1 text-xs text-text-secondary flex-shrink-0">
            <Clock class="w-3 h-3" />{{ formatDuration(course.durationMinutes) }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-1.5 flex-shrink-0">
        <BaseBadge v-if="availabilities.length > 0" :label="`${availabilities.length} slot${availabilities.length !== 1 ? 's' : ''}`" variant="primary" />
        <BaseButton size="sm" variant="ghost" @click.stop="emit('edit', course)">
          <Pencil class="w-3.5 h-3.5" />
        </BaseButton>
        <BaseButton size="sm" variant="ghost" @click.stop="emit('delete', course.id ?? '')">
          <Trash2 class="w-3.5 h-3.5 text-red-400" />
        </BaseButton>
        <component :is="expanded ? ChevronUp : ChevronDown" class="w-4 h-4 text-text-secondary ml-1" />
      </div>
    </div>

    <!-- Availability panel -->
    <div v-if="expanded" class="border-t border-gray-100 dark:border-white/5 px-5 py-4">
      <div class="flex items-center justify-between mb-4">
        <p class="text-xs font-semibold text-text-secondary uppercase tracking-wide">Availability</p>
        <BaseButton size="sm" variant="ghost" @click="showForm = !showForm">
          <Plus class="w-3.5 h-3.5" /> Add slot
        </BaseButton>
      </div>

      <!-- Add slot form -->
      <div v-if="showForm" class="mb-4 p-4 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] space-y-3">
        <div>
          <p class="text-xs font-semibold text-text-secondary mb-2">Days <span class="font-normal opacity-60">(empty = all days)</span></p>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="day in DAYS"
              :key="day"
              class="px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all duration-150"
              :class="form.daysOfWeek.includes(day)
                ? 'bg-primary text-white border-primary'
                : 'border-gray-300 dark:border-white/20 text-gray-600 dark:text-white/60 hover:border-primary/50 hover:text-primary'"
              @click="toggleDay(day)"
            >{{ day.slice(0, 3) }}</button>
          </div>
        </div>
        <div>
          <p class="text-xs font-semibold text-text-secondary mb-1.5">Time range</p>
          <div class="flex items-center gap-2">
            <BaseInput v-model="form.startTime" type="time" />
            <span class="text-text-secondary text-sm flex-shrink-0">–</span>
            <BaseInput v-model="form.endTime" type="time" />
          </div>
        </div>
        <div>
          <p class="text-xs font-semibold text-text-secondary mb-1.5">Valid period <span class="font-normal opacity-60">(optional)</span></p>
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

      <!-- Slot list -->
      <p v-if="availabilities.length === 0 && !showForm" class="text-xs text-text-secondary py-2">
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
        <span class="text-xs font-mono tabular-nums text-text-primary dark:text-white/70 flex-shrink-0">
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
  </div>
</template>
