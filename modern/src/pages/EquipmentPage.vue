<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePageTitle } from '../composables/usePageTitle'
usePageTitle('Equipment')
import type { EquipmentOut, UserEquipmentSave } from '../types'
import { useEquipmentStore } from '../stores/equipmentStore'
import { useToast } from '../composables/useToast'
import AppLayout from '../components/layout/AppLayout.vue'
import PageHeader from '../components/layout/PageHeader.vue'
import BaseButton from '../components/BaseButton.vue'
import EquipmentList from './EquipmentPage/components/EquipmentList.vue'
import EquipmentFormModal from './EquipmentPage/components/EquipmentFormModal.vue'
import { Search } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const store = useEquipmentStore()
const toast = useToast()

const search = ref('')
const isCreateOpen = ref(false)
const editTarget = ref<EquipmentOut | null>(null)

function openEdit(equipment: EquipmentOut) {
  editTarget.value = equipment
  router.push({ query: { edit: equipment.id } })
}

function openCreate() {
  isCreateOpen.value = true
  router.push({ query: { new: '1' } })
}

watch(() => route.query, async (query) => {
  if (query.edit) {
    if (editTarget.value?.id === query.edit) return
    try {
      editTarget.value = await store.get(query.edit as string)
      isCreateOpen.value = false
    } catch {
      toast.error('Equipment not found')
      router.replace({ query: {} })
    }
  } else if (query.new) {
    if (isCreateOpen.value) return
    isCreateOpen.value = true
    editTarget.value = null
  } else {
    isCreateOpen.value = false
    editTarget.value = null
  }
}, { immediate: true })
const userSelections = ref<Map<string, UserEquipmentSave>>(new Map())
const isDirty = ref(false)

onMounted(async () => {
  await store.fetch()
  userSelections.value = new Map(
    store.userEquipment.map((e) => [e.equipmentId, {
      equipmentId: e.equipmentId,
      availableWeights: e.availableWeights ? [...e.availableWeights] : null,
    }])
  )
})

const filtered = computed(() =>
  store.equipment.filter((e) =>
    !search.value || e.name?.toLowerCase().includes(search.value.toLowerCase())
  )
)

function onSelectionsUpdate(next: Map<string, UserEquipmentSave>) {
  userSelections.value = next
  isDirty.value = true
}

async function saveSelections() {
  try {
    await store.saveUserEquipment([...userSelections.value.values()])
    isDirty.value = false
    toast.success('Equipment saved')
  } catch {
    toast.error('Failed to save equipment')
  }
}
</script>

<template>
  <AppLayout>
    <PageHeader title="Equipment" subtitle="Manage your equipment catalog and track what you own.">
      <BaseButton variant="secondary" @click="openCreate">+ New Equipment</BaseButton>
    </PageHeader>

    <div class="flex items-center gap-3 mb-6">
      <div class="relative flex-1">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
          <Search class="w-4 h-4" />
        </span>
        <input
          v-model="search"
          placeholder="Search equipment..."
          class="w-full pl-9 pr-4 py-2.5 min-h-[44px] rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark text-sm text-text-primary dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      </div>
    </div>

    <EquipmentList
      :equipment="filtered"
      :loading="store.isLoading"
      :user-selections="userSelections"
      @edit="openEdit"
      @update:user-selections="onSelectionsUpdate"
    />

    <Transition name="slide-up">
      <div
        v-if="isDirty"
        class="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3 shadow-xl z-30"
      >
        <p class="text-sm text-text-primary dark:text-white font-medium">Unsaved changes</p>
        <BaseButton variant="ghost" size="sm" @click="isDirty = false; store.fetch().then(() => { userSelections = new Map(store.userEquipment.map((e) => [e.equipmentId, { equipmentId: e.equipmentId, availableWeights: e.availableWeights ? [...e.availableWeights] : null }])) })">
          Discard
        </BaseButton>
        <BaseButton variant="primary" size="sm" :loading="store.isSaving" @click="saveSelections">
          Save My Equipment
        </BaseButton>
      </div>
    </Transition>

    <EquipmentFormModal
      :open="isCreateOpen || editTarget !== null"
      :equipment="editTarget"
      @close="router.replace({ query: {} })"
    />
  </AppLayout>
</template>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.2s ease, opacity 0.2s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateX(-50%) translateY(20px); opacity: 0; }
</style>
