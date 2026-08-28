<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useSchedulePlanStore } from '../../stores/schedulePlanStore'
import { Plus, X, ChevronRight } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const store = useSchedulePlanStore()
const router = useRouter()

const showCreate = ref(false)
const newName = ref('')
const creating = ref(false)

onMounted(async () => {
  await store.fetchPlans()
})

async function create() {
  if (!newName.value.trim()) return
  creating.value = true
  try {
    const plan = await store.createPlan({ name: newName.value.trim() })
    showCreate.value = false
    newName.value = ''
    router.push(`/organizer/schedule-plans/${plan.id}`)
  } finally {
    creating.value = false
  }
}

async function removePlan(id: string) {
  if (!confirm('Delete this schedule plan?')) return
  await store.removePlan(id)
}
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Schedule Plans</h1>
      <button class="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium" @click="showCreate = true">
        <Plus class="w-4 h-4" /> New Plan
      </button>
    </div>

    <div v-if="store.isLoading" class="text-text-secondary text-sm">Loading…</div>
    <div v-else-if="store.plans.length === 0" class="text-text-secondary text-sm">No schedule plans yet.</div>

    <div class="flex flex-col gap-3">
      <div
        v-for="plan in store.plans"
        :key="plan.id"
        class="flex items-center justify-between bg-surface-card dark:bg-surface-card rounded-2xl border border-gray-200 dark:border-white/10 px-5 py-4 cursor-pointer hover:border-primary/50 transition-colors"
        @click="router.push(`/organizer/schedule-plans/${plan.id}`)"
      >
        <div class="flex items-center gap-3">
          <div>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ plan.name }}</p>
            <p class="text-xs text-text-secondary mt-0.5">Created {{ new Date(plan.createdAt).toLocaleDateString() }}</p>
          </div>
          <span
            class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
            :class="plan.status === 'Published'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/50'"
          >
            {{ plan.status }}
          </span>
        </div>
        <ChevronRight class="w-4 h-4 text-text-secondary" />
      </div>
    </div>

    <!-- Create modal -->
    <div v-if="showCreate" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click.self="showCreate = false">
      <div class="bg-surface-card dark:bg-surface-card rounded-2xl p-6 w-full max-w-sm border border-gray-200 dark:border-white/10">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">New Schedule Plan</h2>
          <button @click="showCreate = false"><X class="w-5 h-5 text-text-secondary" /></button>
        </div>
        <input
          v-model="newName"
          type="text"
          placeholder="Plan name"
          class="w-full rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary mb-4"
          @keyup.enter="create"
        />
        <div class="flex gap-3">
          <button :disabled="creating" class="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium disabled:opacity-50" @click="create">Create</button>
          <button class="px-4 text-text-secondary text-sm" @click="showCreate = false">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>
