<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseModal from '../../../../components/BaseModal.vue'
import BaseSelect from '../../../../components/BaseSelect.vue'
import BaseInput from '../../../../components/BaseInput.vue'
import BaseButton from '../../../../components/BaseButton.vue'
import type {
  OrganizationMemberOut,
  BuildingOut,
  CourseOut,
  TrainerCourseAssociationOut,
  ScheduleEntryCreate,
  ScheduleEntryOut,
} from '../../../../types'

const props = defineProps<{
  open: boolean
  trainers: OrganizationMemberOut[]
  buildings: BuildingOut[]
  courses: CourseOut[]
  trainerCourses: TrainerCourseAssociationOut[]
  entry?: ScheduleEntryOut | null
}>()
const emit = defineEmits<{ close: []; saved: [entry: ScheduleEntryCreate] }>()

type RecurrenceType = 'none' | 'daily' | 'weekly' | 'every-n-days'
type DurationShortcut = 30 | 60 | 90 | 120 | 'custom'

const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: 'none', label: 'Once' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'every-n-days', label: 'Every N days' },
]

const DURATION_SHORTCUTS: { value: DurationShortcut; label: string }[] = [
  { value: 30, label: '30 min' },
  { value: 60, label: '1 h' },
  { value: 90, label: '1.5 h' },
  { value: 120, label: '2 h' },
  { value: 'custom', label: 'Custom' },
]

const form = ref({
  trainerUserId: '',
  buildingId: '',
  courseId: '',
  startDate: '',
  startTime: '09:00',
  endTime: '10:00',
  recurrenceType: 'none' as RecurrenceType,
  recurrenceInterval: 2,
  validUntil: '',
})

const durationShortcut = ref<DurationShortcut>(60)

watch(() => props.open, (val) => {
  if (val) {
    if (props.entry) {
      const e = props.entry
      form.value = {
        trainerUserId: e.trainerUserId,
        buildingId: e.buildingId,
        courseId: e.courseId,
        startDate: e.startDate,
        startTime: e.startTime,
        endTime: e.endTime,
        recurrenceType: e.recurrenceType,
        recurrenceInterval: e.recurrenceInterval ?? 2,
        validUntil: e.validUntil ?? '',
      }
      const [sh, sm] = e.startTime.split(':').map(Number)
      const [eh, em] = e.endTime.split(':').map(Number)
      const dur = (eh * 60 + em) - (sh * 60 + sm)
      const exact = ([30, 60, 90, 120] as const).find(v => v === dur)
      durationShortcut.value = exact ?? 'custom'
    } else {
      const today = new Date().toISOString().slice(0, 10)
      form.value = {
        trainerUserId: '',
        buildingId: '',
        courseId: '',
        startDate: today,
        startTime: '09:00',
        endTime: '10:00',
        recurrenceType: 'none',
        recurrenceInterval: 2,
        validUntil: '',
      }
      durationShortcut.value = 60
    }
  }
})

function applyDuration(shortcut: DurationShortcut) {
  if (shortcut === 'custom') {
    durationShortcut.value = 'custom'
    return
  }
  durationShortcut.value = shortcut
  const [h, m] = form.value.startTime.split(':').map(Number)
  const totalMinutes = h * 60 + m + shortcut
  const endH = Math.floor(totalMinutes / 60) % 24
  const endM = totalMinutes % 60
  form.value.endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
}

watch(() => form.value.startTime, () => {
  if (durationShortcut.value !== 'custom') {
    applyDuration(durationShortcut.value)
  }
})

watch(() => form.value.courseId, (id) => {
  const course = props.courses.find(c => c.id === id)
  const mins = course?.durationMinutes
  if (!mins) return
  const exact = ([30, 60, 90, 120] as const).find(v => v === mins)
  if (exact) {
    applyDuration(exact)
  } else {
    durationShortcut.value = 'custom'
    const [h, m] = form.value.startTime.split(':').map(Number)
    const total = h * 60 + m + mins
    form.value.endTime = `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
  }
})

const qualifiedCourses = computed(() => {
  if (!form.value.trainerUserId) return props.courses
  const ids = new Set(
    props.trainerCourses
      .filter(a => a.trainerUserId === form.value.trainerUserId)
      .map(a => a.courseId)
  )
  return props.courses.filter(c => c.id && ids.has(c.id))
})

function trainerLabel(t: OrganizationMemberOut) {
  if (t.firstName || t.lastName) return [t.firstName, t.lastName].filter(Boolean).join(' ')
  const parts = t.trainerUserId.split('|')
  const hash = parts.length > 1 ? parts[1] : t.trainerUserId
  return hash.length > 10 ? '···' + hash.slice(-10) : hash
}

function save() {
  const entry: ScheduleEntryCreate = {
    trainerUserId: form.value.trainerUserId,
    buildingId: form.value.buildingId,
    courseId: form.value.courseId,
    startDate: form.value.startDate,
    startTime: form.value.startTime,
    endTime: form.value.endTime,
    recurrenceType: form.value.recurrenceType,
    recurrenceInterval: form.value.recurrenceType === 'every-n-days' ? form.value.recurrenceInterval : null,
    validUntil: form.value.recurrenceType !== 'none' && form.value.validUntil ? form.value.validUntil : null,
  }
  emit('saved', entry)
  emit('close')
}
</script>

<template>
  <BaseModal :open="open" :title="entry ? 'Edit Schedule Entry' : 'New Schedule Entry'" size="lg" @close="emit('close')">
    <div class="space-y-5">
      <!-- Trainer / Course / Building -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <BaseSelect
          v-model="form.trainerUserId"
          label="Trainer"
          placeholder="Select trainer…"
          :options="trainers.map(t => ({ value: t.trainerUserId, label: trainerLabel(t) }))"
        />
        <BaseSelect
          v-model="form.courseId"
          label="Course"
          placeholder="Select course…"
          :options="qualifiedCourses.map(c => ({ value: c.id!, label: c.name ?? c.id! }))"
        />
        <BaseSelect
          v-model="form.buildingId"
          label="Building"
          placeholder="Select building…"
          :options="buildings.map(b => ({ value: b.id, label: b.name }))"
        />
      </div>

      <!-- Date -->
      <BaseInput v-model="form.startDate" label="Start date" type="date" />

      <!-- Time + duration shortcuts -->
      <div>
        <p class="text-xs font-medium text-text-secondary mb-2">Time</p>
        <div class="flex items-center gap-2 mb-3">
          <BaseInput v-model="form.startTime" type="time" />
          <span class="text-text-secondary flex-shrink-0">–</span>
          <BaseInput v-model="form.endTime" type="time" />
        </div>
        <div class="flex gap-1.5 flex-wrap">
          <button
            v-for="s in DURATION_SHORTCUTS"
            :key="s.value"
            class="px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors"
            :class="durationShortcut === s.value
              ? 'bg-primary text-white border-primary'
              : 'border-gray-300 dark:border-white/20 text-gray-600 dark:text-white/60 hover:border-primary/50'"
            @click="applyDuration(s.value)"
          >{{ s.label }}</button>
        </div>
      </div>

      <!-- Recurrence -->
      <div>
        <p class="text-xs font-medium text-text-secondary mb-2">Recurrence</p>
        <div class="flex gap-1 bg-black/5 dark:bg-white/5 rounded-xl p-1 w-fit">
          <button
            v-for="opt in RECURRENCE_OPTIONS"
            :key="opt.value"
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            :class="form.recurrenceType === opt.value
              ? 'bg-white dark:bg-white/10 text-text-primary dark:text-white shadow-sm'
              : 'text-text-secondary'"
            @click="form.recurrenceType = opt.value"
          >{{ opt.label }}</button>
        </div>

        <div v-if="form.recurrenceType === 'every-n-days'" class="mt-3 flex items-center gap-2">
          <p class="text-xs text-text-secondary">Every</p>
          <input
            v-model.number="form.recurrenceInterval"
            type="number"
            min="2"
            max="365"
            class="w-16 text-center text-sm border border-gray-300 dark:border-white/20 rounded-lg px-2 py-1 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <p class="text-xs text-text-secondary">days</p>
        </div>

        <div v-if="form.recurrenceType !== 'none'" class="mt-3">
          <p class="text-xs font-medium text-text-secondary mb-1.5">Valid until (optional)</p>
          <BaseInput v-model="form.validUntil" type="date" />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-3 justify-end">
        <BaseButton variant="ghost" @click="emit('close')">Cancel</BaseButton>
        <BaseButton
          variant="primary"
          :disabled="!form.trainerUserId || !form.buildingId || !form.courseId || !form.startDate"
          @click="save"
        >
          {{ entry ? 'Save' : 'Add Entry' }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
