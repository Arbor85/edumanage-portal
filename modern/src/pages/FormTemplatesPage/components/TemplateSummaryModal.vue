<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormTemplateOut, StandaloneFormResponsesSummaryOut, FieldSummaryOut } from '../../../types'
import * as formsApi from '../../../services/formsApi'
import BaseModal from '../../../components/BaseModal.vue'
import SkeletonLoader from '../../../components/SkeletonLoader.vue'

const props = defineProps<{ open: boolean; template: FormTemplateOut | null }>()
const emit = defineEmits<{ close: [] }>()

const loading = ref(false)
const summary = ref<StandaloneFormResponsesSummaryOut | null>(null)

watch(() => props.open, async (val) => {
  if (!val || !props.template) return
  loading.value = true
  try {
    summary.value = await formsApi.getStandaloneFormResponsesSummary(props.template.id)
  } finally {
    loading.value = false
  }
})

function isNumeric(field: FieldSummaryOut) {
  return field.type === 'Number' || field.type === 'Scale' || field.type === 'Range'
}

function isOption(field: FieldSummaryOut) {
  return field.type === 'SingleChoice' || field.type === 'MultiChoice' || field.type === 'Boolean'
}

function totalOptionCount(optionCounts: Record<string, number>): number {
  return Object.values(optionCounts).reduce((s, c) => s + c, 0)
}

function barWidth(count: number, total: number): string {
  if (!total) return '0%'
  return `${Math.round((count / total) * 100)}%`
}
</script>

<template>
  <BaseModal :open="open" :title="template ? `Summary: ${template.name}` : 'Summary'" size="lg" @close="emit('close')">
    <div
      class="flex flex-col gap-4 overflow-y-auto"
      style="max-height: 65vh; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.15) transparent;"
    >
      <div v-if="loading" class="flex flex-col gap-4">
        <SkeletonLoader v-for="i in 4" :key="i" height="80px" rounded="rounded-xl" />
      </div>

      <template v-else-if="summary">
        <div class="flex items-center gap-3 pb-3 border-b border-white/10">
          <div class="text-center">
            <p class="text-2xl font-bold text-white">{{ summary.totalResponses }}</p>
            <p class="text-xs text-text-muted">Total responses</p>
          </div>
        </div>

        <p v-if="!summary.fields.length" class="text-sm text-text-secondary text-center py-4">
          No fields defined in this template.
        </p>

        <div
          v-for="field in summary.fields"
          :key="field.fieldId"
          class="bg-white/5 rounded-xl p-4 flex flex-col gap-3"
        >
          <div class="flex items-center justify-between gap-2">
            <p class="font-semibold text-white text-sm">{{ field.label }}</p>
            <span class="text-xs text-text-muted bg-white/10 rounded-full px-2 py-0.5">
              {{ field.type }} · {{ field.responseCount }} response{{ field.responseCount !== 1 ? 's' : '' }}
            </span>
          </div>

          <!-- Numeric / Scale -->
          <template v-if="isNumeric(field)">
            <div v-if="field.responseCount > 0" class="grid grid-cols-3 gap-2">
              <div class="text-center bg-white/5 rounded-lg py-2">
                <p class="text-lg font-bold text-primary">{{ field.avg }}</p>
                <p class="text-xs text-text-muted">Average</p>
              </div>
              <div class="text-center bg-white/5 rounded-lg py-2">
                <p class="text-lg font-bold text-white">{{ field.min }}</p>
                <p class="text-xs text-text-muted">Min</p>
              </div>
              <div class="text-center bg-white/5 rounded-lg py-2">
                <p class="text-lg font-bold text-white">{{ field.max }}</p>
                <p class="text-xs text-text-muted">Max</p>
              </div>
            </div>
            <p v-else class="text-sm text-text-muted">No numeric responses yet.</p>
          </template>

          <!-- SingleChoice / MultiChoice / Boolean -->
          <template v-else-if="isOption(field) && field.optionCounts">
            <div v-if="Object.keys(field.optionCounts).length" class="flex flex-col gap-2">
              <div
                v-for="(count, option) in field.optionCounts"
                :key="option"
                class="flex items-center gap-2"
              >
                <span class="text-sm text-text-secondary w-20 shrink-0 truncate">
                  {{ field.type === 'Boolean' ? (option === 'true' ? 'Yes' : 'No') : option }}
                </span>
                <div class="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    class="h-full bg-primary rounded-full transition-all"
                    :style="{ width: barWidth(count, totalOptionCount(field.optionCounts!)) }"
                  />
                </div>
                <span class="text-xs text-text-muted w-8 text-right shrink-0">{{ count }}</span>
              </div>
            </div>
            <p v-else class="text-sm text-text-muted">No responses yet.</p>
          </template>

          <!-- Text / TextArea / Date -->
          <template v-else>
            <div
              v-if="field.textValues?.length"
              class="flex flex-col gap-1.5 max-h-36 overflow-y-auto"
              style="scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.15) transparent;"
            >
              <p
                v-for="(text, i) in field.textValues"
                :key="i"
                class="text-sm text-text-secondary bg-white/5 rounded-lg px-3 py-1.5"
              >{{ text }}</p>
            </div>
            <p v-else class="text-sm text-text-muted">No text responses yet.</p>
          </template>
        </div>
      </template>

      <p v-else class="text-sm text-text-secondary text-center py-8">Could not load summary.</p>
    </div>

    <template #footer>
      <div class="flex justify-end">
        <button
          class="text-sm text-text-secondary hover:text-white transition-colors"
          @click="emit('close')"
        >Close</button>
      </div>
    </template>
  </BaseModal>
</template>
