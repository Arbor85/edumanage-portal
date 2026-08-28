<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useSchedulePlanStore } from '../../stores/schedulePlanStore'
import { ChevronDown, ChevronUp, Plus, Trash2, Pencil, X, Check } from 'lucide-vue-next'
import type { BuildingCreate, BuildingAvailabilityCreate } from '../../types'

const store = useSchedulePlanStore()

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const expanded = ref<Set<string>>(new Set())
const showCreateModal = ref(false)
const editingBuilding = ref<{ id: string; name: string; address: string; capacity: number } | null>(null)

const form = ref<BuildingCreate>({ name: '', address: '', capacity: 0 })
const availForms = ref<Record<string, BuildingAvailabilityCreate & { editing: boolean }>>({})

onMounted(async () => {
  await store.fetchBuildings()
})

function toggle(id: string) {
  if (expanded.value.has(id)) {
    expanded.value.delete(id)
  } else {
    expanded.value.add(id)
    store.fetchBuildingAvailability(id)
  }
}

async function saveBuilding() {
  if (!form.value.name.trim()) return
  if (editingBuilding.value) {
    await store.updateBuilding(editingBuilding.value.id, { ...form.value })
  } else {
    await store.addBuilding({ ...form.value })
  }
  closeModal()
}

function openEdit(b: typeof store.buildings[0]) {
  editingBuilding.value = { id: b.id, name: b.name, address: b.address, capacity: b.capacity }
  form.value = { name: b.name, address: b.address, capacity: b.capacity }
  showCreateModal.value = true
}

function closeModal() {
  showCreateModal.value = false
  editingBuilding.value = null
  form.value = { name: '', address: '', capacity: 0 }
}

async function removeBuilding(id: string) {
  if (!confirm('Delete this building?')) return
  await store.removeBuilding(id)
  expanded.value.delete(id)
}

function initAvailForm(buildingId: string) {
  if (!availForms.value[buildingId]) {
    availForms.value[buildingId] = { daysOfWeek: [], startTime: '09:00', endTime: '17:00', validFrom: '', validTo: '', editing: false }
  }
  availForms.value[buildingId].editing = true
}

async function saveAvailability(buildingId: string) {
  const f = availForms.value[buildingId]
  if (!f || !f.daysOfWeek.length || !f.validFrom || !f.validTo) return
  await store.addBuildingAvailability(buildingId, { daysOfWeek: f.daysOfWeek, startTime: f.startTime, endTime: f.endTime, validFrom: f.validFrom, validTo: f.validTo })
  f.daysOfWeek = []
  f.validFrom = ''
  f.validTo = ''
  f.editing = false
}
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Buildings</h1>
      <button
        class="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium"
        @click="showCreateModal = true"
      >
        <Plus class="w-4 h-4" /> Add Building
      </button>
    </div>

    <div v-if="store.buildings.length === 0" class="text-text-secondary text-sm">No buildings yet.</div>

    <div class="flex flex-col gap-3">
      <div
        v-for="building in store.buildings"
        :key="building.id"
        class="bg-surface-card dark:bg-surface-card rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden"
      >
        <div
          class="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          @click="toggle(building.id)"
        >
          <div>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ building.name }}</p>
            <p class="text-xs text-text-secondary mt-0.5">{{ building.address }} · Capacity: {{ building.capacity }}</p>
          </div>
          <div class="flex items-center gap-2">
            <button class="p-1.5 rounded-lg text-text-secondary hover:text-primary transition-colors" @click.stop="openEdit(building)">
              <Pencil class="w-4 h-4" />
            </button>
            <button class="p-1.5 rounded-lg text-text-secondary hover:text-red-500 transition-colors" @click.stop="removeBuilding(building.id)">
              <Trash2 class="w-4 h-4" />
            </button>
            <component :is="expanded.has(building.id) ? ChevronUp : ChevronDown" class="w-4 h-4 text-text-secondary" />
          </div>
        </div>

        <!-- Availability panel -->
        <div v-if="expanded.has(building.id)" class="border-t border-gray-200 dark:border-white/10 px-5 py-4">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs font-bold uppercase tracking-widest text-text-muted">Availability</p>
            <button class="flex items-center gap-1 text-xs text-primary hover:underline" @click="initAvailForm(building.id)">
              <Plus class="w-3 h-3" /> Add slot
            </button>
          </div>

          <div v-if="availForms[building.id]?.editing" class="mb-4 p-3 rounded-xl bg-black/5 dark:bg-white/5 space-y-3">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="day in DAYS"
                :key="day"
                class="px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors"
                :class="availForms[building.id].daysOfWeek.includes(day)
                  ? 'bg-primary text-white border-primary'
                  : 'border-gray-300 dark:border-white/20 text-gray-600 dark:text-white/60'"
                @click="() => {
                  const f = availForms[building.id]
                  const idx = f.daysOfWeek.indexOf(day)
                  idx === -1 ? f.daysOfWeek.push(day) : f.daysOfWeek.splice(idx, 1)
                }"
              >{{ day.slice(0, 3) }}</button>
            </div>
            <div class="flex gap-2">
              <input v-model="availForms[building.id].startTime" type="time" class="input-field text-xs" />
              <span class="self-center text-text-secondary">–</span>
              <input v-model="availForms[building.id].endTime" type="time" class="input-field text-xs" />
            </div>
            <div class="flex gap-2">
              <input v-model="availForms[building.id].validFrom" type="date" class="input-field text-xs flex-1" />
              <input v-model="availForms[building.id].validTo" type="date" class="input-field text-xs flex-1" />
            </div>
            <div class="flex gap-2">
              <button class="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium" @click="saveAvailability(building.id)">Save</button>
              <button class="px-3 py-1.5 text-text-secondary text-xs" @click="availForms[building.id].editing = false">Cancel</button>
            </div>
          </div>

          <div v-if="(store.buildingAvailabilities[building.id] ?? []).length === 0" class="text-xs text-text-secondary">No slots defined.</div>
          <div
            v-for="slot in store.buildingAvailabilities[building.id] ?? []"
            :key="slot.id"
            class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-white/5 last:border-0"
          >
            <div class="text-xs text-gray-700 dark:text-white/70">
              {{ slot.daysOfWeek.map(d => d.slice(0, 3)).join(', ') }} · {{ slot.startTime }}–{{ slot.endTime }}
              <span class="text-text-muted ml-2">{{ slot.validFrom }} → {{ slot.validTo }}</span>
            </div>
            <button class="p-1 text-text-secondary hover:text-red-500 transition-colors" @click="store.deleteBuildingAvailability(building.id, slot.id)">
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click.self="closeModal">
      <div class="bg-surface-card dark:bg-surface-card rounded-2xl p-6 w-full max-w-md border border-gray-200 dark:border-white/10">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ editingBuilding ? 'Edit Building' : 'New Building' }}</h2>
          <button @click="closeModal"><X class="w-5 h-5 text-text-secondary" /></button>
        </div>
        <div class="space-y-3">
          <input v-model="form.name" type="text" placeholder="Name" class="input-field w-full" />
          <input v-model="form.address" type="text" placeholder="Address" class="input-field w-full" />
          <input v-model.number="form.capacity" type="number" placeholder="Capacity" min="1" class="input-field w-full" />
        </div>
        <div class="flex gap-3 mt-5">
          <button class="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium" @click="saveBuilding">
            {{ editingBuilding ? 'Save' : 'Create' }}
          </button>
          <button class="px-4 py-2.5 text-text-secondary text-sm hover:text-gray-900 dark:hover:text-white" @click="closeModal">Cancel</button>
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
