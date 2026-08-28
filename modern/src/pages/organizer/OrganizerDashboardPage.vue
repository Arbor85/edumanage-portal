<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useOrganizerStore } from '../../stores/organizerStore'
import { useSchedulePlanStore } from '../../stores/schedulePlanStore'
import { Users, Building2, CalendarDays, AlertCircle, Plus } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const organizerStore = useOrganizerStore()
const schedulePlanStore = useSchedulePlanStore()
const router = useRouter()

const hasOrg = computed(() => organizerStore.org !== null)
const newOrgName = ref('')
const creatingOrg = ref(false)

onMounted(async () => {
  try {
    await organizerStore.fetchOrg()
    await Promise.all([
      organizerStore.fetchTrainers(),
      schedulePlanStore.fetchBuildings(),
      schedulePlanStore.fetchPlans(),
    ])
  } catch {
    // org not created yet
  }
})

async function createOrg() {
  if (!newOrgName.value.trim()) return
  creatingOrg.value = true
  try {
    await organizerStore.createOrg({ name: newOrgName.value.trim() })
    await Promise.all([
      organizerStore.fetchTrainers(),
      schedulePlanStore.fetchBuildings(),
      schedulePlanStore.fetchPlans(),
    ])
  } finally {
    creatingOrg.value = false
  }
}

const publishedPlans = computed(() => schedulePlanStore.plans.filter((p) => p.status === 'Published').length)
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Organizer Dashboard</h1>

    <!-- Create org prompt -->
    <div v-if="!hasOrg" class="bg-surface-card dark:bg-surface-card rounded-2xl p-6 border border-gray-200 dark:border-white/10">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create your organization</h2>
      <div class="flex gap-3">
        <input
          v-model="newOrgName"
          type="text"
          placeholder="Organization name"
          class="flex-1 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          @keyup.enter="createOrg"
        />
        <button
          :disabled="creatingOrg || !newOrgName.trim()"
          class="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium disabled:opacity-50"
          @click="createOrg"
        >
          <Plus class="w-4 h-4" />
          Create
        </button>
      </div>
    </div>

    <!-- Dashboard cards -->
    <template v-else>
      <div class="mb-4">
        <p class="text-sm text-text-secondary">{{ organizerStore.org?.name }}</p>
      </div>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          class="bg-surface-card dark:bg-surface-card rounded-2xl p-5 border border-gray-200 dark:border-white/10 cursor-pointer hover:border-primary/50 transition-colors"
          @click="router.push('/organizer/trainers')"
        >
          <Users class="w-6 h-6 text-primary mb-3" />
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ organizerStore.trainers.length }}</p>
          <p class="text-sm text-text-secondary mt-1">Trainers</p>
        </div>
        <div
          class="bg-surface-card dark:bg-surface-card rounded-2xl p-5 border border-gray-200 dark:border-white/10 cursor-pointer hover:border-primary/50 transition-colors"
          @click="router.push('/organizer/buildings')"
        >
          <Building2 class="w-6 h-6 text-primary mb-3" />
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ schedulePlanStore.buildings.length }}</p>
          <p class="text-sm text-text-secondary mt-1">Buildings</p>
        </div>
        <div
          class="bg-surface-card dark:bg-surface-card rounded-2xl p-5 border border-gray-200 dark:border-white/10 cursor-pointer hover:border-primary/50 transition-colors"
          @click="router.push('/organizer/schedule-plans')"
        >
          <CalendarDays class="w-6 h-6 text-primary mb-3" />
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ publishedPlans }}</p>
          <p class="text-sm text-text-secondary mt-1">Published Plans</p>
        </div>
        <div class="bg-surface-card dark:bg-surface-card rounded-2xl p-5 border border-gray-200 dark:border-white/10">
          <AlertCircle class="w-6 h-6 text-amber-500 mb-3" />
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ schedulePlanStore.plans.length }}</p>
          <p class="text-sm text-text-secondary mt-1">Total Plans</p>
        </div>
      </div>
    </template>
  </div>
</template>
