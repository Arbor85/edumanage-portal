<script setup lang="ts">
import type { FormTemplateOut } from '../../../types'
import SkeletonLoader from '../../../components/SkeletonLoader.vue'
import EmptyState from '../../../components/EmptyState.vue'
import { ClipboardList } from 'lucide-vue-next'

defineProps<{ templates: FormTemplateOut[]; loading: boolean }>()
const emit = defineEmits<{ edit: [template: FormTemplateOut] }>()
</script>

<template>
  <div v-if="loading" class="flex flex-col gap-3">
    <SkeletonLoader v-for="i in 3" :key="i" height="76px" rounded="rounded-2xl" />
  </div>

  <EmptyState
    v-else-if="!templates.length"
    :icon="ClipboardList"
    title="No form templates yet"
    description="Create a questionnaire template (e.g. Post-Physiotherapy Session Form) to fill in after client sessions."
  />

  <div v-else class="flex flex-col gap-3">
    <button
      v-for="template in templates"
      :key="template.id"
      class="w-full text-left flex items-center justify-between gap-3 p-4 bg-surface-card border border-white/5 rounded-2xl hover:border-white/10 hover:-translate-y-0.5 active:scale-[0.99] transition-all"
      @click="emit('edit', template)"
    >
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <p class="font-bold text-white truncate">{{ template.name }}</p>
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0"
            :class="template.isActive ? 'bg-primary/15 text-primary' : 'bg-white/10 text-text-secondary'"
          >{{ template.isActive ? 'Active' : 'Inactive' }}</span>
        </div>
        <p v-if="template.description" class="text-sm text-text-secondary truncate mt-0.5">{{ template.description }}</p>
        <p class="text-xs text-text-muted mt-1">{{ template.fields.length }} field(s) · v{{ template.currentVersion }}</p>
      </div>
    </button>
  </div>
</template>
