<script setup lang="ts">
import { ChevronRight, Trash2 } from 'lucide-vue-next'
import BaseBadge from '../../../../components/BaseBadge.vue'
import BaseButton from '../../../../components/BaseButton.vue'
import type { SchedulePlanOut } from '../../../../types'

defineProps<{ plan: SchedulePlanOut }>()
defineEmits<{ click: []; delete: [id: string] }>()
</script>

<template>
  <div
    class="group flex items-center gap-4 bg-surface dark:bg-surface-card rounded-2xl border border-gray-100 dark:border-white/5 px-5 py-4 shadow-sm cursor-pointer hover:border-primary/30 hover:shadow-md transition-all"
    @click="$emit('click')"
  >
    <div class="flex-1 min-w-0">
      <p class="text-sm font-semibold text-text-primary dark:text-white">{{ plan.name }}</p>
      <p class="text-xs text-text-secondary mt-0.5">
        Created {{ new Date(plan.createdAt).toLocaleDateString() }}
      </p>
    </div>
    <BaseBadge
      :label="plan.status"
      :variant="plan.status === 'Published' ? 'success' : 'default'"
    />
    <BaseButton
      size="sm"
      variant="ghost"
      class="opacity-0 group-hover:opacity-100 transition-opacity"
      @click.stop="$emit('delete', plan.id)"
    >
      <Trash2 class="w-3.5 h-3.5 text-red-400" />
    </BaseButton>
    <ChevronRight class="w-4 h-4 text-text-secondary flex-shrink-0" />
  </div>
</template>
