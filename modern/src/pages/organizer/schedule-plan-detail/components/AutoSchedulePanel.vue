<script setup lang="ts">
import { ref } from 'vue'
import { Zap, AlertTriangle } from 'lucide-vue-next'
import BaseButton from '../../../../components/BaseButton.vue'
import type { OrganizationMemberOut, BuildingOut, CourseOut, AutoScheduleResult } from '../../../../types'

const props = defineProps<{
  trainers: OrganizationMemberOut[]
  buildings: BuildingOut[]
  courses: CourseOut[]
  proposal: AutoScheduleResult | null
  running: boolean
  confirming: boolean
}>()

const emit = defineEmits<{
  run: [selection: { courseIds: string[]; buildingIds: string[]; trainerIds: string[] }]
  confirm: []
}>()

const selection = ref({ courseIds: [] as string[], buildingIds: [] as string[], trainerIds: [] as string[] })

function toggle(arr: string[], val: string) {
  const idx = arr.indexOf(val)
  idx === -1 ? arr.push(val) : arr.splice(idx, 1)
}

function trainerLabel(t: OrganizationMemberOut) {
  if (t.firstName || t.lastName) return [t.firstName, t.lastName].filter(Boolean).join(' ')
  const parts = t.trainerUserId.split('|')
  const hash = parts.length > 1 ? parts[1] : t.trainerUserId
  return hash.length > 10 ? '···' + hash.slice(-10) : hash
}

function buildingName(id: string) {
  return props.buildings.find(b => b.id === id)?.name ?? id
}

function courseName(id: string) {
  return props.courses.find(c => c.id === id)?.name ?? id
}

function recurrenceLabel(e: { recurrenceType: string; recurrenceInterval?: number | null }) {
  if (e.recurrenceType === 'none') return 'Once'
  if (e.recurrenceType === 'daily') return 'Daily'
  if (e.recurrenceType === 'weekly') return 'Weekly'
  if (e.recurrenceType === 'every-n-days') return `Every ${e.recurrenceInterval ?? '?'} days`
  return e.recurrenceType
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function run() {
  emit('run', {
    courseIds: selection.value.courseIds,
    buildingIds: selection.value.buildingIds.length
      ? selection.value.buildingIds
      : props.buildings.map(b => b.id),
    trainerIds: selection.value.trainerIds.length
      ? selection.value.trainerIds
      : props.trainers.map(t => t.trainerUserId),
  })
}
</script>

<template>
  <div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <!-- Courses -->
      <div class="bg-surface dark:bg-surface-card rounded-2xl border border-gray-100 dark:border-white/5 p-4 shadow-sm">
        <p class="text-xs font-semibold text-text-secondary mb-3">Courses</p>
        <div class="space-y-0.5 max-h-48 overflow-y-auto custom-scrollbar">
          <button
            v-for="c in courses"
            :key="c.id!"
            class="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-left text-xs transition-colors"
            :class="selection.courseIds.includes(c.id!)
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-text-primary dark:text-white/70 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'"
            @click="toggle(selection.courseIds, c.id!)"
          >
            <span
              class="w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors"
              :class="selection.courseIds.includes(c.id!) ? 'bg-primary border-primary' : 'border-gray-400 dark:border-white/30'"
            >
              <svg v-if="selection.courseIds.includes(c.id!)" class="w-2 h-2 text-white" viewBox="0 0 8 8" fill="none">
                <path d="M1.5 4L3.5 6L6.5 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            {{ c.name }}
          </button>
        </div>
      </div>

      <!-- Buildings -->
      <div class="bg-surface dark:bg-surface-card rounded-2xl border border-gray-100 dark:border-white/5 p-4 shadow-sm">
        <p class="text-xs font-semibold text-text-secondary mb-1">Buildings</p>
        <p class="text-xs text-text-secondary mb-3">(all if none selected)</p>
        <div class="space-y-0.5 max-h-48 overflow-y-auto custom-scrollbar">
          <button
            v-for="b in buildings"
            :key="b.id"
            class="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-left text-xs transition-colors"
            :class="selection.buildingIds.includes(b.id)
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-text-primary dark:text-white/70 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'"
            @click="toggle(selection.buildingIds, b.id)"
          >
            <span
              class="w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors"
              :class="selection.buildingIds.includes(b.id) ? 'bg-primary border-primary' : 'border-gray-400 dark:border-white/30'"
            >
              <svg v-if="selection.buildingIds.includes(b.id)" class="w-2 h-2 text-white" viewBox="0 0 8 8" fill="none">
                <path d="M1.5 4L3.5 6L6.5 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            {{ b.name }}
          </button>
        </div>
      </div>

      <!-- Trainers -->
      <div class="bg-surface dark:bg-surface-card rounded-2xl border border-gray-100 dark:border-white/5 p-4 shadow-sm">
        <p class="text-xs font-semibold text-text-secondary mb-1">Trainers</p>
        <p class="text-xs text-text-secondary mb-3">(all if none selected)</p>
        <div class="space-y-0.5 max-h-48 overflow-y-auto custom-scrollbar">
          <button
            v-for="t in trainers"
            :key="t.trainerUserId"
            class="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-left text-xs transition-colors"
            :class="selection.trainerIds.includes(t.trainerUserId)
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-text-primary dark:text-white/70 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'"
            @click="toggle(selection.trainerIds, t.trainerUserId)"
          >
            <span
              class="w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors"
              :class="selection.trainerIds.includes(t.trainerUserId) ? 'bg-primary border-primary' : 'border-gray-400 dark:border-white/30'"
            >
              <svg v-if="selection.trainerIds.includes(t.trainerUserId)" class="w-2 h-2 text-white" viewBox="0 0 8 8" fill="none">
                <path d="M1.5 4L3.5 6L6.5 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            {{ trainerLabel(t) }}
          </button>
        </div>
      </div>
    </div>

    <BaseButton
      variant="primary"
      :loading="running"
      :disabled="!selection.courseIds.length"
      class="mb-6"
      @click="run"
    >
      <Zap class="w-4 h-4" />
      {{ running ? 'Generating…' : 'Generate Schedule' }}
    </BaseButton>

    <!-- Proposal results -->
    <div v-if="proposal" class="space-y-4">
      <div>
        <p class="text-sm font-semibold text-text-primary dark:text-white mb-2">
          Scheduled
          <span class="text-text-secondary font-normal">({{ proposal.scheduled.length }})</span>
        </p>
        <div class="flex flex-col gap-2">
          <div
            v-for="(entry, i) in proposal.scheduled"
            :key="i"
            class="flex items-start gap-3 bg-surface dark:bg-surface-card rounded-xl border border-gray-100 dark:border-white/5 px-4 py-3 shadow-sm"
          >
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-text-primary dark:text-white mb-1">
                {{ courseName(entry.courseId) }}
              </p>
              <div class="flex items-center gap-1.5 flex-wrap mb-1">
                <span class="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded-md font-medium">
                  {{ recurrenceLabel(entry) }}
                </span>
                <span class="text-xs text-text-secondary">{{ formatDate(entry.startDate) }}</span>
                <span class="text-xs font-mono text-text-secondary tabular-nums">
                  · {{ entry.startTime }}–{{ entry.endTime }}
                </span>
                <span v-if="entry.validUntil && entry.recurrenceType !== 'none'" class="text-xs text-text-secondary">
                  · until {{ formatDate(entry.validUntil) }}
                </span>
              </div>
              <p class="text-xs text-text-secondary">
                {{ trainerLabel(trainers.find(t => t.trainerUserId === entry.trainerUserId) ?? { trainerUserId: entry.trainerUserId, joinedAt: '' }) }}
                · {{ buildingName(entry.buildingId) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="proposal.unscheduled.length">
        <p class="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
          Unscheduled
          <span class="font-normal">({{ proposal.unscheduled.length }})</span>
        </p>
        <div class="flex flex-col gap-2">
          <div
            v-for="item in proposal.unscheduled"
            :key="item.courseId"
            class="flex items-center gap-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800/40 px-4 py-3"
          >
            <AlertTriangle class="w-4 h-4 text-red-500 flex-shrink-0" />
            <div>
              <p class="text-sm font-medium text-red-700 dark:text-red-400">{{ item.courseName }}</p>
              <p class="text-xs text-red-500/80 mt-0.5">{{ item.reason }}</p>
            </div>
          </div>
        </div>
      </div>

      <BaseButton
        variant="primary"
        :loading="confirming"
        :disabled="!proposal.scheduled.length"
        @click="emit('confirm')"
      >
        {{ confirming ? 'Saving…' : 'Confirm & Save' }}
      </BaseButton>
    </div>
  </div>
</template>
