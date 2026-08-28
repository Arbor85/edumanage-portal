<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSchedulePlanStore } from '../../stores/schedulePlanStore'
import { useOrganizerStore } from '../../stores/organizerStore'
import { useCourseStore } from '../../stores/courseStore'
import { AlertTriangle, Plus, Trash2, ChevronLeft, Zap, ClipboardList } from 'lucide-vue-next'
import type { ScheduleEntryCreate } from '../../types'

const route = useRoute()
const router = useRouter()
const store = useSchedulePlanStore()
const organizerStore = useOrganizerStore()
const courseStore = useCourseStore()

const planId = route.params.id as string
const activeTab = ref<'manual' | 'auto'>('manual')

const plan = computed(() => store.plans.find((p) => p.id === planId))

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// Manual entry form
const showAddEntry = ref(false)
const entryForm = ref<ScheduleEntryCreate>({
  trainerUserId: '',
  buildingId: '',
  courseId: '',
  isRecurring: true,
  daysOfWeek: [],
  validFrom: '',
  validTo: '',
  date: '',
  startTime: '09:00',
  endTime: '10:00',
})

// Auto-schedule selection
const autoSelection = ref({ courseIds: [] as string[], buildingIds: [] as string[], trainerIds: [] as string[] })
const autoRunning = ref(false)
const confirming = ref(false)

// Qualified courses for selected trainer
const qualifiedCourses = computed(() => {
  if (!entryForm.value.trainerUserId) return courseStore.courses
  const courseIds = new Set(
    organizerStore.trainerCourses
      .filter((a) => a.trainerUserId === entryForm.value.trainerUserId)
      .map((a) => a.courseId)
  )
  return courseStore.courses.filter((c) => c.id && courseIds.has(c.id))
})

onMounted(async () => {
  await Promise.all([
    store.fetchPlans(),
    store.fetchEntries(planId),
    store.fetchBuildings(),
    organizerStore.fetchOrg(),
    organizerStore.fetchTrainers(),
    organizerStore.fetchTrainerCourses(),
    courseStore.fetch(),
  ])
})

async function togglePublish() {
  if (!plan.value) return
  if (plan.value.status === 'Published') {
    await store.unpublishPlan(planId)
  } else {
    await store.publishPlan(planId)
  }
}

async function addEntry() {
  const d: ScheduleEntryCreate = {
    trainerUserId: entryForm.value.trainerUserId,
    buildingId: entryForm.value.buildingId,
    courseId: entryForm.value.courseId,
    isRecurring: entryForm.value.isRecurring,
    startTime: entryForm.value.startTime,
    endTime: entryForm.value.endTime,
  }
  if (entryForm.value.isRecurring) {
    d.daysOfWeek = [...(entryForm.value.daysOfWeek ?? [])]
    d.validFrom = entryForm.value.validFrom
    d.validTo = entryForm.value.validTo
  } else {
    d.date = entryForm.value.date
  }
  await store.addEntry(planId, d)
  showAddEntry.value = false
  entryForm.value = { trainerUserId: '', buildingId: '', courseId: '', isRecurring: true, daysOfWeek: [], validFrom: '', validTo: '', date: '', startTime: '09:00', endTime: '10:00' }
}

async function removeEntry(entryId: string) {
  await store.removeEntry(planId, entryId)
}

async function runAutoSchedule() {
  if (!autoSelection.value.courseIds.length) return
  autoRunning.value = true
  try {
    await store.runAutoSchedule(planId, {
      courseIds: autoSelection.value.courseIds,
      buildingIds: autoSelection.value.buildingIds.length ? autoSelection.value.buildingIds : store.buildings.map(b => b.id),
      trainerIds: autoSelection.value.trainerIds.length ? autoSelection.value.trainerIds : organizerStore.trainers.map(t => t.trainerUserId),
    })
  } finally {
    autoRunning.value = false
  }
}

async function confirmAuto() {
  confirming.value = true
  try {
    await store.confirmAutoSchedule(planId)
    activeTab.value = 'manual'
  } finally {
    confirming.value = false
  }
}

function trainerName(id: string) {
  return id.slice(0, 12) + '…'
}

function buildingName(id: string) {
  return store.buildings.find(b => b.id === id)?.name ?? id
}

function courseName(id: string) {
  return courseStore.courses.find(c => c.id === id)?.name ?? id
}

function toggleMulti(arr: string[], val: string) {
  const idx = arr.indexOf(val)
  idx === -1 ? arr.push(val) : arr.splice(idx, 1)
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <button class="p-2 rounded-xl text-text-secondary hover:bg-black/5 dark:hover:bg-white/5" @click="router.push('/organizer/schedule-plans')">
        <ChevronLeft class="w-5 h-5" />
      </button>
      <div class="flex-1">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ plan?.name ?? 'Schedule Plan' }}</h1>
      </div>
      <span
        class="px-3 py-1 rounded-full text-xs font-semibold"
        :class="plan?.status === 'Published'
          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
          : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/50'"
      >{{ plan?.status }}</span>
      <button
        :disabled="!plan || store.entries.length === 0"
        class="px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
        :class="plan?.status === 'Published'
          ? 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-white/20'
          : 'bg-primary text-white hover:bg-primary/90'"
        @click="togglePublish"
      >
        {{ plan?.status === 'Published' ? 'Unpublish' : 'Publish' }}
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 mb-6 bg-black/5 dark:bg-white/5 rounded-xl p-1 w-fit">
      <button
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="activeTab === 'manual' ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-text-secondary'"
        @click="activeTab = 'manual'"
      >
        <ClipboardList class="w-4 h-4" /> Manual
      </button>
      <button
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="activeTab === 'auto' ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-text-secondary'"
        @click="activeTab = 'auto'"
      >
        <Zap class="w-4 h-4" /> Auto
      </button>
    </div>

    <!-- Manual tab -->
    <div v-if="activeTab === 'manual'">
      <div class="flex justify-between items-center mb-4">
        <p class="text-sm text-text-secondary">{{ store.entries.length }} entries</p>
        <button class="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-xl text-sm font-medium" @click="showAddEntry = !showAddEntry">
          <Plus class="w-4 h-4" /> Add Entry
        </button>
      </div>

      <!-- Add entry form -->
      <div v-if="showAddEntry" class="mb-4 p-5 rounded-2xl bg-surface-card dark:bg-surface-card border border-gray-200 dark:border-white/10 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-xs text-text-secondary mb-1">Trainer</label>
            <select v-model="entryForm.trainerUserId" class="input-field w-full">
              <option value="">Select trainer…</option>
              <option v-for="t in organizerStore.trainers" :key="t.trainerUserId" :value="t.trainerUserId">{{ trainerName(t.trainerUserId) }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-text-secondary mb-1">Course</label>
            <select v-model="entryForm.courseId" class="input-field w-full">
              <option value="">Select course…</option>
              <option v-for="c in qualifiedCourses" :key="c.id!" :value="c.id!">{{ c.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-text-secondary mb-1">Building</label>
            <select v-model="entryForm.buildingId" class="input-field w-full">
              <option value="">Select building…</option>
              <option v-for="b in store.buildings" :key="b.id" :value="b.id">{{ b.name }}</option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <label class="text-sm text-gray-700 dark:text-white/70">Recurring</label>
          <button
            class="w-10 h-5 rounded-full transition-colors relative"
            :class="entryForm.isRecurring ? 'bg-primary' : 'bg-gray-300 dark:bg-white/20'"
            @click="entryForm.isRecurring = !entryForm.isRecurring"
          >
            <span class="block w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform" :class="entryForm.isRecurring ? 'left-5' : 'left-0.5'" />
          </button>
        </div>

        <div v-if="entryForm.isRecurring" class="space-y-3">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="day in DAYS"
              :key="day"
              class="px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors"
              :class="(entryForm.daysOfWeek ?? []).includes(day)
                ? 'bg-primary text-white border-primary'
                : 'border-gray-300 dark:border-white/20 text-gray-600 dark:text-white/60'"
              @click="toggleMulti(entryForm.daysOfWeek!, day)"
            >{{ day.slice(0, 3) }}</button>
          </div>
          <div class="flex gap-2">
            <input v-model="entryForm.validFrom" type="date" class="input-field text-xs flex-1" placeholder="Valid from" />
            <input v-model="entryForm.validTo" type="date" class="input-field text-xs flex-1" placeholder="Valid to" />
          </div>
        </div>

        <div v-else>
          <input v-model="entryForm.date" type="date" class="input-field text-xs" />
        </div>

        <div class="flex gap-2">
          <input v-model="entryForm.startTime" type="time" class="input-field text-xs" />
          <span class="self-center text-text-secondary">–</span>
          <input v-model="entryForm.endTime" type="time" class="input-field text-xs" />
        </div>

        <div class="flex gap-3">
          <button class="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium" @click="addEntry">Add</button>
          <button class="px-4 py-2 text-text-secondary text-sm" @click="showAddEntry = false">Cancel</button>
        </div>
      </div>

      <!-- Entries table -->
      <div v-if="store.entries.length === 0" class="text-text-secondary text-sm">No entries yet.</div>
      <div class="flex flex-col gap-2">
        <div
          v-for="entry in store.entries"
          :key="entry.id"
          class="flex items-center justify-between bg-surface-card dark:bg-surface-card rounded-xl border px-4 py-3 transition-colors"
          :class="entry.hasMismatch ? 'border-amber-400/60 bg-amber-50/50 dark:bg-amber-900/10' : 'border-gray-200 dark:border-white/10'"
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ courseName(entry.courseId) }}</span>
              <span class="text-xs text-text-secondary">{{ trainerName(entry.trainerUserId) }}</span>
              <span class="text-xs text-text-secondary">{{ buildingName(entry.buildingId) }}</span>
              <AlertTriangle v-if="entry.hasMismatch" class="w-3.5 h-3.5 text-amber-500 flex-shrink-0" title="Outside declared availability" />
            </div>
            <p class="text-xs text-text-secondary mt-1">
              <template v-if="entry.isRecurring">
                {{ entry.daysOfWeek.map(d => d.slice(0, 3)).join(', ') }} · {{ entry.startTime }}–{{ entry.endTime }} · {{ entry.validFrom }} → {{ entry.validTo }}
              </template>
              <template v-else>
                {{ entry.date }} · {{ entry.startTime }}–{{ entry.endTime }}
              </template>
            </p>
          </div>
          <button class="p-1.5 text-text-secondary hover:text-red-500 transition-colors ml-3" @click="removeEntry(entry.id)">
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Auto tab -->
    <div v-else>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <!-- Courses -->
        <div class="bg-surface-card dark:bg-surface-card rounded-2xl border border-gray-200 dark:border-white/10 p-4">
          <p class="text-xs font-bold uppercase tracking-widest text-text-muted mb-3">Courses</p>
          <div class="space-y-1.5 max-h-48 overflow-y-auto">
            <label v-for="c in courseStore.courses" :key="c.id!" class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" :value="c.id" v-model="autoSelection.courseIds" class="rounded text-primary" />
              <span class="text-sm text-gray-700 dark:text-white/70">{{ c.name }}</span>
            </label>
          </div>
        </div>

        <!-- Buildings -->
        <div class="bg-surface-card dark:bg-surface-card rounded-2xl border border-gray-200 dark:border-white/10 p-4">
          <p class="text-xs font-bold uppercase tracking-widest text-text-muted mb-3">Buildings</p>
          <div class="space-y-1.5 max-h-48 overflow-y-auto">
            <label v-for="b in store.buildings" :key="b.id" class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" :value="b.id" v-model="autoSelection.buildingIds" class="rounded text-primary" />
              <span class="text-sm text-gray-700 dark:text-white/70">{{ b.name }}</span>
            </label>
          </div>
        </div>

        <!-- Trainers -->
        <div class="bg-surface-card dark:bg-surface-card rounded-2xl border border-gray-200 dark:border-white/10 p-4">
          <p class="text-xs font-bold uppercase tracking-widest text-text-muted mb-3">Trainers</p>
          <div class="space-y-1.5 max-h-48 overflow-y-auto">
            <label v-for="t in organizerStore.trainers" :key="t.trainerUserId" class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" :value="t.trainerUserId" v-model="autoSelection.trainerIds" class="rounded text-primary" />
              <span class="text-sm text-gray-700 dark:text-white/70 font-mono">{{ trainerName(t.trainerUserId) }}</span>
            </label>
          </div>
        </div>
      </div>

      <button
        :disabled="autoRunning || !autoSelection.courseIds.length"
        class="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium disabled:opacity-50 mb-6"
        @click="runAutoSchedule"
      >
        <Zap class="w-4 h-4" />
        {{ autoRunning ? 'Generating…' : 'Generate Schedule' }}
      </button>

      <!-- Proposal results -->
      <div v-if="store.autoScheduleProposal">
        <!-- Scheduled -->
        <div class="mb-4">
          <p class="text-sm font-semibold text-gray-900 dark:text-white mb-2">Scheduled ({{ store.autoScheduleProposal.scheduled.length }})</p>
          <div class="flex flex-col gap-2">
            <div
              v-for="(entry, i) in store.autoScheduleProposal.scheduled"
              :key="i"
              class="flex items-center gap-3 bg-surface-card dark:bg-surface-card rounded-xl border border-gray-200 dark:border-white/10 px-4 py-3"
            >
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ courseName(entry.courseId) }}</p>
                <p class="text-xs text-text-secondary">{{ trainerName(entry.trainerUserId) }} · {{ buildingName(entry.buildingId) }} · {{ entry.daysOfWeek.map(d => d.slice(0,3)).join(', ') }} {{ entry.startTime }}–{{ entry.endTime }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Unscheduled -->
        <div v-if="store.autoScheduleProposal.unscheduled.length" class="mb-6">
          <p class="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Unscheduled ({{ store.autoScheduleProposal.unscheduled.length }})</p>
          <div class="flex flex-col gap-2">
            <div
              v-for="item in store.autoScheduleProposal.unscheduled"
              :key="item.courseId"
              class="flex items-center gap-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800/40 px-4 py-3"
            >
              <AlertTriangle class="w-4 h-4 text-red-500 flex-shrink-0" />
              <div>
                <p class="text-sm font-medium text-red-700 dark:text-red-400">{{ item.courseName }}</p>
                <p class="text-xs text-red-500 dark:text-red-500/70">{{ item.reason }}</p>
              </div>
            </div>
          </div>
        </div>

        <button
          :disabled="confirming || !store.autoScheduleProposal.scheduled.length"
          class="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium disabled:opacity-50"
          @click="confirmAuto"
        >
          {{ confirming ? 'Saving…' : 'Confirm & Save' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-field {
  @apply rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary;
}
</style>
