<script setup lang="ts">
import { ref, watch } from 'vue'
import { usePageTitle } from '../../../composables/usePageTitle'
import type { FormTemplateOut, FormTemplateCreate, FormTemplateUpdate, FormFieldDefinition, FormFieldType } from '../../../types'
import { useFormTemplateStore } from '../../../stores/formTemplateStore'
import { useToast } from '../../../composables/useToast'
import BaseModal from '../../../components/BaseModal.vue'
import BaseInput from '../../../components/BaseInput.vue'
import BaseTextarea from '../../../components/BaseTextarea.vue'
import BaseSelect from '../../../components/BaseSelect.vue'
import BaseCheckbox from '../../../components/BaseCheckbox.vue'
import BaseButton from '../../../components/BaseButton.vue'
import TagInput from '../../../components/TagInput.vue'
import ConfirmDialog from '../../../components/ConfirmDialog.vue'
import { Plus, Trash2, GripVertical } from 'lucide-vue-next'

const FIELD_TYPE_OPTIONS: { value: FormFieldType; label: string }[] = [
  { value: 'Text', label: 'Short text' },
  { value: 'TextArea', label: 'Long text' },
  { value: 'Number', label: 'Number' },
  { value: 'SingleChoice', label: 'Single choice (radio)' },
  { value: 'MultiChoice', label: 'Multi choice (checkboxes)' },
  { value: 'Boolean', label: 'Yes / No' },
  { value: 'Scale', label: 'Scale / rating' },
  { value: 'Range', label: 'Range slider' },
  { value: 'Date', label: 'Date' },
]

const props = defineProps<{ open: boolean; template: FormTemplateOut | null }>()
const emit = defineEmits<{ close: [] }>()

usePageTitle(() => props.template ? 'Edit Form Template' : 'New Form Template', () => props.open)

const store = useFormTemplateStore()
const toast = useToast()

const form = ref<{ name: string; description: string; isActive: boolean; fields: FormFieldDefinition[] }>({
  name: '', description: '', isActive: true, fields: [],
})
const saving = ref(false)
const confirmDeactivate = ref(false)

function blankField(order: number): FormFieldDefinition {
  return {
    id: crypto.randomUUID(),
    label: '',
    type: 'Text',
    required: false,
    order,
    options: [],
    min: null,
    max: null,
    helpText: null,
  }
}

watch(() => props.open, (val) => {
  if (!val) return
  form.value = props.template
    ? {
        name: props.template.name,
        description: props.template.description ?? '',
        isActive: props.template.isActive,
        fields: props.template.fields.map((f) => ({ ...f, options: [...(f.options ?? [])] })),
      }
    : { name: '', description: '', isActive: true, fields: [blankField(0)] }
})

function addField() {
  form.value.fields.push(blankField(form.value.fields.length))
}

function removeField(index: number) {
  form.value.fields.splice(index, 1)
  form.value.fields.forEach((f, i) => { f.order = i })
}

function needsOptions(type: FormFieldType) {
  return type === 'SingleChoice' || type === 'MultiChoice'
}

function needsRange(type: FormFieldType) {
  return type === 'Number' || type === 'Scale' || type === 'Range'
}

async function save() {
  if (!form.value.name.trim()) {
    toast.error('Name is required')
    return
  }
  if (!form.value.fields.length) {
    toast.error('Add at least one field')
    return
  }
  if (form.value.fields.some((f) => !f.label.trim())) {
    toast.error('Every field needs a label')
    return
  }

  saving.value = true
  try {
    if (props.template) {
      await store.update(props.template.id, {
        name: form.value.name,
        description: form.value.description || null,
        isActive: form.value.isActive,
        fields: form.value.fields,
      } as FormTemplateUpdate)
      toast.success('Form template updated')
    } else {
      await store.create({
        name: form.value.name,
        description: form.value.description || null,
        fields: form.value.fields,
      } as FormTemplateCreate)
      toast.success('Form template created')
    }
    emit('close')
  } catch {
    toast.error('Failed to save form template')
  } finally {
    saving.value = false
  }
}

async function doDeactivate() {
  if (!props.template) return
  try {
    await store.deactivate(props.template.id)
    toast.success('Form template deactivated')
    confirmDeactivate.value = false
    emit('close')
  } catch {
    toast.error('Failed to deactivate form template')
  }
}
</script>

<template>
  <BaseModal :open="open" :title="template ? 'Edit Form Template' : 'New Form Template'" size="lg" @close="emit('close')">
    <form class="flex flex-col gap-4" @submit.prevent="save">
      <BaseInput v-model="form.name" label="Name" placeholder="e.g. Post-Physiotherapy Session Form" />
      <BaseTextarea v-model="form.description" label="Description" :rows="2" placeholder="Optional context for trainers filling this in" />
      <BaseCheckbox v-if="template" v-model="form.isActive" label="Active (selectable when submitting session forms)" />

      <div class="flex items-center justify-between mt-2">
        <p class="text-xs font-bold tracking-widest uppercase text-text-muted">Fields</p>
        <BaseButton variant="secondary" size="sm" @click="addField">
          <Plus class="w-4 h-4" /> Add field
        </BaseButton>
      </div>

      <div v-if="!form.fields.length" class="text-sm text-text-secondary text-center py-4">No fields yet.</div>

      <div
        v-for="(field, index) in form.fields"
        :key="field.id"
        class="flex flex-col gap-3 p-4 bg-surface-input border border-white/5 rounded-xl"
      >
        <div class="flex items-start gap-2">
          <GripVertical class="w-4 h-4 text-text-muted mt-3 flex-shrink-0" />
          <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <BaseInput v-model="field.label" label="Question / label" placeholder="e.g. Pain level today" />
            <BaseSelect v-model="field.type" label="Field type" :options="FIELD_TYPE_OPTIONS" />
          </div>
          <button
            type="button"
            class="mt-7 p-2 text-text-muted hover:text-red-400 transition-colors flex-shrink-0"
            aria-label="Remove field"
            @click="removeField(index)"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>

        <TagInput
          v-if="needsOptions(field.type)"
          v-model="field.options as string[]"
          label="Options"
          placeholder="Add an option…"
        />

        <div v-if="needsRange(field.type)" class="grid grid-cols-2 gap-3">
          <BaseInput v-model.number="field.min" type="number" label="Min" />
          <BaseInput v-model.number="field.max" type="number" label="Max" />
        </div>

        <BaseInput v-model="field.helpText" label="Help text (optional)" placeholder="Shown to the trainer while filling the field" />
        <BaseCheckbox v-model="field.required" label="Required" />
      </div>
    </form>

    <template #footer>
      <div class="flex items-center gap-2">
        <BaseButton v-if="template" variant="danger" @click="confirmDeactivate = true">Deactivate</BaseButton>
        <div class="flex-1" />
        <BaseButton variant="ghost" @click="emit('close')">Cancel</BaseButton>
        <BaseButton variant="primary" :loading="saving" @click="save">{{ template ? 'Save' : 'Create' }}</BaseButton>
      </div>
    </template>
  </BaseModal>

  <ConfirmDialog
    :open="confirmDeactivate"
    title="Deactivate Form Template"
    message="This template will no longer be selectable for new session forms. Existing responses are kept."
    confirm-label="Deactivate"
    variant="danger"
    @confirm="doDeactivate"
    @cancel="confirmDeactivate = false"
  />
</template>
