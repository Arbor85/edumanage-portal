<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useOrganizerStore } from '../../stores/organizerStore'
import { useCourseStore } from '../../stores/courseStore'
import { ChevronDown, ChevronUp, Copy, Check, Plus, Trash2, Link } from 'lucide-vue-next'
import type { AvailabilityCreate } from '../../types'

const organizerStore = useOrganizerStore()
const courseStore = useCourseStore()

const expanded = ref<Set<string>>(new Set())
const copied = ref(false)

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

onMounted(async () => {
  await organizerStore.fetchOrg()
  await organizerStore.fetchTrainers()
  await organizerStore.fetchTrainerCourses()
  await courseStore.fetch()
})

function toggle(id: string) {
  if (expanded.value.has(id)) {
    expanded.value.delete(id)
  } else {
    expanded.value.add(id)
    organizerStore.fetchTrainerAvailability(id)
  }
}

async function copyInviteLink() {
  if (!organizerStore.org) return
  await organizerStore.generateInvite()
  const link = `${window.location.origin}/join/${organizerStore.org.inviteCode}`
  await navigator.clipboard.writeText(link)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

// Availability form per trainer
const availForms = ref<Record<string, AvailabilityCreate & { editing: boolean }>>({})

function initAvailForm(trainerId: string) {
  if (!availForms.value[trainerId]) {
    availForms.value[trainerId] = { daysOfWeek: [], startTime: '09:00', endTime: '17:00', validFrom: '', validTo: '', editing: false }
  }
}

async function saveAvailability(trainerId: string) {
  const f = availForms.value[trainerId]
  if (!f || !f.daysOfWeek.length || !f.validFrom || !f.validTo) return
  await organizerStore.addTrainerAvailability(trainerId, { daysOfWeek: f.daysOfWeek, startTime: f.startTime, endTime: f.endTime, validFrom: f.validFrom, validTo: f.validTo })
  f.daysOfWeek = []
  f.validFrom = ''
  f.validTo = ''
  f.editing = false
}

async function removeAvailability(trainerId: string, id: string) {
  await organizerStore.deleteTrainerAvailability(trainerId, id)
}

// Course associations per trainer
function trainerCoursesFor(trainerId: string) {
  return organizerStore.trainerCourses.filter((a) => a.trainerUserId === trainerId)
}

function availableCoursesFor(trainerId: string) {
  const assigned = new Set(trainerCoursesFor(trainerId).map((a) => a.courseId))
  return courseStore.courses.filter((c) => c.id && !assigned.has(c.id))
}

async function assignCourse(trainerId: string, courseId: string) {
  if (!courseId) return
  await organizerStore.addTrainerCourse({ trainerId, courseId })
}

async function removeCourse(id: string) {
  await organizerStore.deleteTrainerCourse(id)
}

async function removeTrainer(trainerId: string) {
  if (!confirm('Remove this trainer from your organization?')) return
  await organizerStore.removeTrainer(trainerId)
}
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Trainers</h1>
      <button
        class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        @click="copyInviteLink"
      >
        <component :is="copied ? Check : Copy" class="w-4 h-4" />
        <Link class="w-4 h-4" />
        {{ copied ? 'Copied!' : 'Invite Link' }}
      </button>
    </div>

    <div v-if="organizerStore.isLoading" class="text-text-secondary text-sm">Loading…</div>

    <div v-else-if="organizerStore.trainers.length === 0" class="text-text-secondary text-sm">
      No trainers yet. Share the invite link to add trainers.
    </div>

    <div v-else class="flex flex-col gap-3">
      <div
        v-for="trainer in organizerStore.trainers"
        :key="trainer.trainerUserId"
        class="bg-surface-card dark:bg-surface-card rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden"
      >
        <!-- Row header -->
        <div
          class="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          @click="toggle(trainer.trainerUserId)"
        >
          <div>
            <p class="text-sm font-semibold text-gray-900 dark:text-white font-mono">{{ trainer.trainerUserId }}</p>
            <p class="text-xs text-text-secondary mt-0.5">Joined {{ new Date(trainer.joinedAt).toLocaleDateString() }}</p>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="p-1.5 rounded-lg text-text-secondary hover:text-red-500 transition-colors"
              @click.stop="removeTrainer(trainer.trainerUserId)"
            >
              <Trash2 class="w-4 h-4" />
            </button>
            <component :is="expanded.has(trainer.trainerUserId) ? ChevronUp : ChevronDown" class="w-4 h-4 text-text-secondary" />
          </div>
        </div>

        <!-- Expanded panel -->
        <div v-if="expanded.has(trainer.trainerUserId)" class="border-t border-gray-200 dark:border-white/10 px-5 py-4 space-y-6">
          <!-- Availability -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <p class="text-xs font-bold uppercase tracking-widest text-text-muted">Availability</p>
              <button
                class="flex items-center gap-1 text-xs text-primary hover:underline"
                @click="initAvailForm(trainer.trainerUserId); availForms[trainer.trainerUserId].editing = true"
              >
                <Plus class="w-3 h-3" /> Add slot
              </button>
            </div>

            <!-- Add form -->
            <div v-if="availForms[trainer.trainerUserId]?.editing" class="mb-4 p-3 rounded-xl bg-black/5 dark:bg-white/5 space-y-3">
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="day in DAYS"
                  :key="day"
                  class="px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors"
                  :class="availForms[trainer.trainerUserId].daysOfWeek.includes(day)
                    ? 'bg-primary text-white border-primary'
                    : 'border-gray-300 dark:border-white/20 text-gray-600 dark:text-white/60'"
                  @click="() => {
                    const f = availForms[trainer.trainerUserId]
                    const idx = f.daysOfWeek.indexOf(day)
                    idx === -1 ? f.daysOfWeek.push(day) : f.daysOfWeek.splice(idx, 1)
                  }"
                >{{ day.slice(0, 3) }}</button>
              </div>
              <div class="flex gap-2">
                <input v-model="availForms[trainer.trainerUserId].startTime" type="time" class="input-field text-xs" />
                <span class="self-center text-text-secondary">–</span>
                <input v-model="availForms[trainer.trainerUserId].endTime" type="time" class="input-field text-xs" />
              </div>
              <div class="flex gap-2">
                <input v-model="availForms[trainer.trainerUserId].validFrom" type="date" class="input-field text-xs flex-1" placeholder="From" />
                <input v-model="availForms[trainer.trainerUserId].validTo" type="date" class="input-field text-xs flex-1" placeholder="To" />
              </div>
              <div class="flex gap-2">
                <button class="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium" @click="saveAvailability(trainer.trainerUserId)">Save</button>
                <button class="px-3 py-1.5 text-text-secondary text-xs hover:text-gray-900 dark:hover:text-white" @click="availForms[trainer.trainerUserId].editing = false">Cancel</button>
              </div>
            </div>

            <!-- Slots list -->
            <div v-if="(organizerStore.trainerAvailabilities[trainer.trainerUserId] ?? []).length === 0" class="text-xs text-text-secondary">No slots defined.</div>
            <div
              v-for="slot in organizerStore.trainerAvailabilities[trainer.trainerUserId] ?? []"
              :key="slot.id"
              class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-white/5 last:border-0"
            >
              <div class="text-xs text-gray-700 dark:text-white/70">
                {{ slot.daysOfWeek.map(d => d.slice(0, 3)).join(', ') }} · {{ slot.startTime }}–{{ slot.endTime }}
                <span class="text-text-muted ml-2">{{ slot.validFrom }} → {{ slot.validTo }}</span>
              </div>
              <button class="p-1 text-text-secondary hover:text-red-500 transition-colors" @click="removeAvailability(trainer.trainerUserId, slot.id)">
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Courses -->
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-text-muted mb-3">Qualified Courses</p>
            <div class="flex flex-wrap gap-2 mb-2">
              <span
                v-for="assoc in trainerCoursesFor(trainer.trainerUserId)"
                :key="assoc.id"
                class="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-medium"
              >
                {{ courseStore.courses.find(c => c.id === assoc.courseId)?.name ?? assoc.courseId }}
                <button @click="removeCourse(assoc.id)"><Trash2 class="w-3 h-3" /></button>
              </span>
            </div>
            <select
              class="input-field text-xs"
              @change="(e) => { assignCourse(trainer.trainerUserId, (e.target as HTMLSelectElement).value); (e.target as HTMLSelectElement).value = '' }"
            >
              <option value="">+ Assign course…</option>
              <option v-for="c in availableCoursesFor(trainer.trainerUserId)" :key="c.id!" :value="c.id!">{{ c.name }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-field {
  @apply rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary;
}
</style>
