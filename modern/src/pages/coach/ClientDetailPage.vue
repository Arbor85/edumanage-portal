<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ChevronLeft, Mail, CalendarDays, ClipboardList, Dumbbell,
  Users, FileText, CheckCircle2, FilePlus2, ChevronDown,
} from '@lucide/vue'
import AppLayout from '../../components/layout/AppLayout.vue'
import NudgeButton from '../../components/NudgeButton.vue'
import TrainingHeatmap from '../../components/TrainingHeatmap.vue'
import SkeletonLoader from '../../components/SkeletonLoader.vue'
import FillFormModal from './components/FillFormModal.vue'
import { useClientStore } from '../../stores/clientStore'
import { usePlanStore } from '../../stores/planStore'
import { useToast } from '../../composables/useToast'
import * as formsApi from '../../services/formsApi'
import type { HeatmapDay } from '../../stores/progressStore'
import type { FormResponseOut } from '../../types'

const route = useRoute()
const router = useRouter()
const clientStore = useClientStore()
const planStore = usePlanStore()
const toast = useToast()

const id = computed(() => route.params.id as string)

const client = computed(
  () => clientStore.clients.find((c) => c.invitationCode === id.value) ?? null
)

const clientPlan = computed(
  () => planStore.plans.find((p) => p.clientId === id.value || p.clientId === client.value?.email) ?? null
)

const planWorkouts = computed(() => {
  if (!clientPlan.value?.workouts) return []
  return [...clientPlan.value.workouts]
    .filter((w) => w.date)
    .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
})

const todayISO = new Date().toISOString().split('T')[0]

const pastWorkouts = computed(() =>
  planWorkouts.value.filter((w) => w.date && w.date < todayISO)
)

// Plan progress: past workouts / total workouts (we don't have completion data)
const planProgress = computed(() => {
  if (!planWorkouts.value.length) return 0
  return Math.round((pastWorkouts.value.length / planWorkouts.value.length) * 100)
})

// Empty heatmap until backend provides real data
const emptyHeatmap = computed<HeatmapDay[]>(() => {
  const days: HeatmapDay[] = []
  for (let i = 83; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000)
    days.push({ date: d.toISOString().split('T')[0], intensity: 0 })
  }
  return days
})

// Local notes per client
const noteKey = computed(() => `client_note_${id.value}`)
const note = ref('')

// Session forms
const formResponses = ref<FormResponseOut[]>([])
const formResponsesLoading = ref(false)
const isFillFormOpen = ref(false)
const expandedResponseId = ref<string | null>(null)

async function loadFormResponses() {
  formResponsesLoading.value = true
  try {
    formResponses.value = await formsApi.listFormResponsesForClient(id.value)
  } catch {
    toast.error('Failed to load session forms')
  } finally {
    formResponsesLoading.value = false
  }
}

function toggleResponse(responseId: string) {
  expandedResponseId.value = expandedResponseId.value === responseId ? null : responseId
}

onMounted(async () => {
  if (!clientStore.clients.length) await clientStore.fetch()
  if (!planStore.plans.length) planStore.fetch()
  note.value = localStorage.getItem(noteKey.value) ?? ''
  loadFormResponses()
})

watch(note, (v) => localStorage.setItem(noteKey.value, v))

function ringClass(): string {
  return client.value?.status === 'Active'
    ? 'ring-2 ring-primary/60'
    : 'ring-2 ring-amber-400/60'
}

function initials(name: string | null): string {
  if (!name) return '?'
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2)
}
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto">
      <!-- Back button -->
      <button
        class="flex items-center gap-1.5 text-sm text-text-muted hover:text-white transition-colors mb-4 -ml-1"
        @click="router.push('/coach/clients')"
      >
        <ChevronLeft class="w-4 h-4" />
        Clients
      </button>

      <!-- Not found -->
      <div v-if="clientStore.isLoading" class="space-y-4">
        <SkeletonLoader height="96px" rounded="rounded-2xl" />
        <SkeletonLoader height="160px" rounded="rounded-2xl" />
      </div>

      <div v-else-if="!client" class="text-center py-16">
        <Users class="w-10 h-10 text-text-muted mx-auto mb-3" />
        <p class="text-lg font-bold text-text-primary dark:text-white mb-1">Client not found</p>
        <p class="text-sm text-text-secondary">This client may have been removed.</p>
      </div>

      <template v-else>
        <!-- ── Header ────────────────────────────────────── -->
        <div class="bg-surface-card border border-white/5 rounded-2xl p-5 mb-4">
          <div class="flex items-start gap-4">
            <!-- Avatar with engagement ring -->
            <div
              class="w-14 h-14 rounded-full flex items-center justify-center
                     bg-primary/20 text-primary font-black text-lg flex-shrink-0"
              :class="ringClass()"
            >
              {{ initials(client.name) }}
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h1 class="text-xl font-black text-text-primary dark:text-white">{{ client.name }}</h1>
                <span
                  class="px-2.5 py-0.5 rounded-full text-xs font-bold"
                  :class="client.status === 'Active'
                    ? 'bg-primary/15 text-primary'
                    : 'bg-amber-400/15 text-amber-400'"
                >
                  {{ client.status ?? 'Invited' }}
                </span>
              </div>
              <div class="flex flex-col gap-1 mt-1.5">
                <p
                  v-if="client.firstName || client.lastName"
                  class="text-sm text-text-secondary"
                >{{ [client.firstName, client.lastName].filter(Boolean).join(' ') }}</p>
                <a
                  v-if="client.email"
                  :href="`mailto:${client.email}`"
                  class="flex items-center gap-1.5 text-xs text-text-muted hover:text-primary transition-colors"
                >
                  <Mail class="w-3 h-3" />
                  {{ client.email }}
                </a>
              </div>
            </div>

            <!-- Nudge -->
            <NudgeButton :client-id="id" class="flex-shrink-0 !w-10 !h-10" />
          </div>
        </div>

        <!-- ── Quick actions ──────────────────────────────── -->
        <div class="grid grid-cols-4 gap-3 mb-4">
          <button
            class="flex flex-col items-center gap-2 p-4 bg-surface-card border border-white/5 rounded-2xl
                   hover:border-white/10 hover:-translate-y-0.5 active:scale-[0.97] transition-all"
            @click="router.push('/coach/plans')"
          >
            <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ClipboardList class="w-5 h-5 text-primary" />
            </div>
            <span class="text-xs font-bold text-text-secondary">Assign Plan</span>
          </button>

          <button
            class="flex flex-col items-center gap-2 p-4 bg-surface-card border border-white/5 rounded-2xl
                   hover:border-white/10 hover:-translate-y-0.5 active:scale-[0.97] transition-all"
            @click="router.push('/coach/meetings')"
          >
            <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <CalendarDays class="w-5 h-5 text-primary" />
            </div>
            <span class="text-xs font-bold text-text-secondary">Schedule</span>
          </button>

          <button
            class="flex flex-col items-center gap-2 p-4 bg-surface-card border border-white/5 rounded-2xl
                   hover:border-white/10 hover:-translate-y-0.5 active:scale-[0.97] transition-all"
            @click="($el as HTMLElement).closest('[data-notes]')?.querySelector('textarea')?.focus()"
          >
            <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText class="w-5 h-5 text-primary" />
            </div>
            <span class="text-xs font-bold text-text-secondary">Leave Note</span>
          </button>

          <button
            v-if="client?.userId"
            class="flex flex-col items-center gap-2 p-4 bg-surface-card border border-white/5 rounded-2xl
                   hover:border-white/10 hover:-translate-y-0.5 active:scale-[0.97] transition-all"
            @click="router.push(`/gym-profile/client/${client.userId}`)"
          >
            <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Dumbbell class="w-5 h-5 text-primary" />
            </div>
            <span class="text-xs font-bold text-text-secondary">Gym Profile</span>
            class="flex flex-col items-center gap-2 p-4 bg-surface-card border border-white/5 rounded-2xl
                   hover:border-white/10 hover:-translate-y-0.5 active:scale-[0.97] transition-all"
            @click="isFillFormOpen = true"
          >
            <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FilePlus2 class="w-5 h-5 text-primary" />
            </div>
            <span class="text-xs font-bold text-text-secondary">Fill Form</span>
          </button>
        </div>

        <!-- ── Active plan ────────────────────────────────── -->
        <section class="bg-surface-card border border-white/5 rounded-2xl p-5 mb-4">
          <p class="text-xs font-bold tracking-widest uppercase text-text-muted mb-3">Active plan</p>

          <div v-if="!clientPlan" class="text-center py-6">
            <p class="text-sm text-text-secondary">No plan assigned.</p>
            <button
              class="mt-3 px-4 py-2 text-xs font-bold text-primary bg-primary/10 rounded-xl
                     hover:bg-primary/20 active:scale-[0.97] transition-all"
              @click="router.push('/coach/plans')"
            >
              Assign a plan
            </button>
          </div>

          <template v-else>
            <div class="flex items-start justify-between mb-3">
              <div>
                <p class="font-bold text-text-primary dark:text-white">{{ clientPlan.name }}</p>
                <p class="text-xs text-text-muted mt-0.5">{{ planWorkouts.length }} workouts scheduled</p>
              </div>
              <span
                class="px-2.5 py-1 rounded-full text-xs font-bold"
                :class="clientPlan.status === 'active'
                  ? 'bg-primary/15 text-primary'
                  : 'bg-white/10 text-text-secondary'"
              >{{ clientPlan.status }}</span>
            </div>

            <!-- Progress bar -->
            <div class="mb-2">
              <div class="flex justify-between mb-1.5">
                <span class="text-xs text-text-muted">Timeline progress</span>
                <span class="text-xs font-bold text-text-primary dark:text-white">{{ planProgress }}%</span>
              </div>
              <div class="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  class="h-full bg-primary rounded-full transition-all duration-700"
                  :style="{ width: `${planProgress}%` }"
                />
              </div>
            </div>

            <!-- Upcoming workouts (next 3) -->
            <div class="mt-4 flex flex-col gap-2">
              <div
                v-for="w in planWorkouts.filter(w => w.date && w.date >= todayISO).slice(0, 3)"
                :key="w.id ?? w.date ?? ''"
                class="flex items-center gap-3 text-sm"
              >
                <CheckCircle2
                  v-if="w.date === todayISO"
                  class="w-4 h-4 text-primary flex-shrink-0"
                />
                <div v-else class="w-4 h-4 rounded-full border border-white/20 flex-shrink-0" />
                <span class="text-text-secondary flex-1 truncate">{{ w.name ?? 'Workout' }}</span>
                <span class="text-xs text-text-muted flex-shrink-0">
                  {{ new Date(w.date!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}
                </span>
              </div>
            </div>
          </template>
        </section>

        <!-- ── Training pattern ──────────────────────────── -->
        <section class="bg-surface-card border border-white/5 rounded-2xl p-5 mb-4">
          <p class="text-xs font-bold tracking-widest uppercase text-text-muted mb-4">
            Training pattern
          </p>
          <TrainingHeatmap :data="emptyHeatmap" />
          <p class="text-xs text-text-muted text-center mt-3">
            Workout activity will appear here once data is available.
          </p>
        </section>

        <!-- ── Session forms ──────────────────────────────── -->
        <section class="bg-surface-card border border-white/5 rounded-2xl p-5 mb-4">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs font-bold tracking-widest uppercase text-text-muted">Session forms</p>
            <button
              class="text-xs font-bold text-primary hover:text-primary-dark transition-colors"
              @click="isFillFormOpen = true"
            >+ Fill form</button>
          </div>

          <div v-if="formResponsesLoading" class="flex flex-col gap-2">
            <SkeletonLoader height="48px" rounded="rounded-xl" />
          </div>

          <div v-else-if="!formResponses.length" class="text-center py-6">
            <p class="text-sm text-text-secondary">No session forms submitted yet.</p>
          </div>

          <div v-else class="flex flex-col gap-2">
            <div
              v-for="response in formResponses"
              :key="response.id"
              class="border border-white/5 rounded-xl overflow-hidden"
            >
              <button
                class="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors"
                @click="toggleResponse(response.id)"
              >
                <span class="text-sm text-text-primary dark:text-white font-semibold">
                  {{ new Date(response.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) }}
                </span>
                <ChevronDown
                  class="w-4 h-4 text-text-muted flex-shrink-0 transition-transform"
                  :class="expandedResponseId === response.id ? 'rotate-180' : ''"
                />
              </button>
              <div v-if="expandedResponseId === response.id" class="px-4 pb-3 flex flex-col gap-2">
                <div v-for="answer in response.answers" :key="answer.fieldId" class="text-sm">
                  <span class="text-text-muted">{{ answer.fieldId }}:</span>
                  <span class="text-text-secondary ml-1">{{ answer.values?.length ? answer.values.join(', ') : (answer.value ?? '—') }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ── Notes ─────────────────────────────────────── -->
        <section data-notes class="bg-surface-card border border-white/5 rounded-2xl p-5 mb-8">
          <p class="text-xs font-bold tracking-widest uppercase text-text-muted mb-3">Your notes</p>
          <textarea
            v-model="note"
            placeholder="Add notes about this client…"
            rows="4"
            class="w-full bg-surface-input border border-white/5 rounded-xl px-4 py-3 text-sm text-white
                   placeholder:text-text-muted outline-none resize-none
                   focus-visible:ring-2 focus-visible:ring-primary/50 transition-all custom-scrollbar"
          />
          <p class="text-[10px] text-text-muted mt-1.5">Saved locally on this device.</p>
        </section>
      </template>
    </div>

    <FillFormModal
      v-if="client"
      :open="isFillFormOpen"
      :client-id="id"
      @close="isFillFormOpen = false"
      @submitted="loadFormResponses"
    />
  </AppLayout>
</template>
