<script setup lang="ts">
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'

defineProps<{
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  variant?: 'danger' | 'primary'
}>()
const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <BaseModal :open="open" :title="title" size="sm" @close="emit('cancel')">
    <p class="text-sm text-text-secondary dark:text-white/70 mb-6">{{ message }}</p>
    <div class="flex gap-3 justify-end">
      <BaseButton variant="ghost" @click="emit('cancel')">Cancel</BaseButton>
      <BaseButton :variant="variant === 'danger' ? 'danger' : 'primary'" @click="emit('confirm')">
        {{ confirmLabel ?? 'Confirm' }}
      </BaseButton>
    </div>
  </BaseModal>
</template>
