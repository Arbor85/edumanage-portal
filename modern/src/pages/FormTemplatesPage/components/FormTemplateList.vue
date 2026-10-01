<script setup lang="ts">
import type { FormTemplateOut } from '../../../types'
import SkeletonLoader from '../../../components/SkeletonLoader.vue'
import EmptyState from '../../../components/EmptyState.vue'
import { ClipboardList, PencilLine, List, BarChart2 } from '@lucide/vue'

defineProps<{ templates: FormTemplateOut[]; loading: boolean }>()
const emit = defineEmits<{
  edit: [template: FormTemplateOut]
  fill: [template: FormTemplateOut]
  answers: [template: FormTemplateOut]
  summary: [template: FormTemplateOut]
}>()
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
    <div
      v-for="template in templates"
      :key="template.id"
      class="flex items-center justify-between gap-3 p-4 bg-surface-card border border-white/5 rounded-2xl hover:border-white/10 transition-all"
    >
      <button
        class="flex-1 min-w-0 text-left hover:-translate-y-0.5 active:scale-[0.99] transition-transform"
        @click="emit('edit', template)"
      >
        <div class="flex items-center gap-2">
          <p class="font-bold text-white truncate">{{ template.name }}</p>
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0"
            :class="template.isActive ? 'bg-primary/15 text-primary' : 'bg-white/10 text-text-secondary'"
          >{{ template.isActive ? 'Active' : 'Inactive' }}</span>
        </div>
        <p v-if="template.description" class="text-sm text-text-secondary truncate mt-0.5">{{ template.description }}</p>
        <p class="text-xs text-text-muted mt-1">{{ template.fields.length }} field(s) · v{{ template.currentVersion }}</p>
      </button>

      <div class="flex items-center gap-1 flex-shrink-0">
        <button
          class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-primary/15 text-primary hover:bg-primary/25 active:scale-95 transition-all"
          title="Fill form"
          @click="emit('fill', template)"
        >
          <PencilLine class="w-3.5 h-3.5" />
          Fill
        </button>
        <button
          class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white/10 text-text-secondary hover:text-white hover:bg-white/15 active:scale-95 transition-all"
          title="View answers"
          @click="emit('answers', template)"
        >
          <List class="w-3.5 h-3.5" />
          Answers
        </button>
        <button
          class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white/10 text-text-secondary hover:text-white hover:bg-white/15 active:scale-95 transition-all"
          title="View summary"
          @click="emit('summary', template)"
        >
          <BarChart2 class="w-3.5 h-3.5" />
          Summary
        </button>
      </div>
    </div>
  </div>
</template>
