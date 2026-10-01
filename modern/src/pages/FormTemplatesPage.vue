<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePageTitle } from '../composables/usePageTitle'
usePageTitle('Form Templates')
import type { FormTemplateOut, StandaloneFormResponseOut } from '../types'
import { useFormTemplateStore } from '../stores/formTemplateStore'
import { useToast } from '../composables/useToast'
import AppLayout from '../components/layout/AppLayout.vue'
import PageHeader from '../components/layout/PageHeader.vue'
import ListSearchBar from '../components/ListSearchBar.vue'
import BaseButton from '../components/BaseButton.vue'
import FormTemplateList from './FormTemplatesPage/components/FormTemplateList.vue'
import FormTemplateFormModal from './FormTemplatesPage/components/FormTemplateFormModal.vue'
import FillTemplateModal from './FormTemplatesPage/components/FillTemplateModal.vue'
import TemplateAnswersModal from './FormTemplatesPage/components/TemplateAnswersModal.vue'
import TemplateSummaryModal from './FormTemplatesPage/components/TemplateSummaryModal.vue'

const route = useRoute()
const router = useRouter()
const store = useFormTemplateStore()
const toast = useToast()

const search = ref('')
const isCreateOpen = ref(false)
const editTarget = ref<FormTemplateOut | null>(null)

const fillTarget = ref<FormTemplateOut | null>(null)
const editResponse = ref<StandaloneFormResponseOut | null>(null)
const answersTarget = ref<FormTemplateOut | null>(null)
const summaryTarget = ref<FormTemplateOut | null>(null)

onMounted(() => {
  store.fetch()
})

function openEdit(template: FormTemplateOut) {
  editTarget.value = template
  router.push({ query: { edit: template.id } })
}

function openCreate() {
  isCreateOpen.value = true
  router.push({ query: { new: '1' } })
}

function handleEditResponse(template: FormTemplateOut, response: StandaloneFormResponseOut) {
  answersTarget.value = null
  editResponse.value = response
  fillTarget.value = template
}

function closeFillModal() {
  fillTarget.value = null
  editResponse.value = null
}

watch(() => route.query, async (query) => {
  if (query.edit) {
    if (editTarget.value?.id === query.edit) return
    try {
      editTarget.value = await store.get(query.edit as string)
      isCreateOpen.value = false
    } catch {
      toast.error('Form template not found')
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

const filtered = () =>
  store.templates.filter((t) =>
    !search.value || t.name.toLowerCase().includes(search.value.toLowerCase())
  )
</script>

<template>
  <AppLayout>
    <PageHeader title="Form Templates" subtitle="Define reusable questionnaires to fill in after client sessions.">
      <BaseButton variant="primary" @click="openCreate">+ New Template</BaseButton>
    </PageHeader>

    <div class="mb-4">
      <ListSearchBar v-model="search" placeholder="Search templates..." :loading="store.isLoading" @refresh="store.fetch()" />
    </div>

    <FormTemplateList
      :templates="filtered()"
      :loading="store.isLoading"
      @edit="openEdit"
      @fill="(t) => { fillTarget = t; editResponse = null }"
      @answers="(t) => answersTarget = t"
      @summary="(t) => summaryTarget = t"
    />

    <FormTemplateFormModal
      :open="isCreateOpen || editTarget !== null"
      :template="editTarget"
      @close="router.replace({ query: {} })"
    />

    <FillTemplateModal
      :open="fillTarget !== null"
      :template="fillTarget"
      :existing-response="editResponse"
      @close="closeFillModal"
      @submitted="closeFillModal"
    />

    <TemplateAnswersModal
      :open="answersTarget !== null"
      :template="answersTarget"
      @close="answersTarget = null"
      @edit="(response) => handleEditResponse(answersTarget!, response)"
    />

    <TemplateSummaryModal
      :open="summaryTarget !== null"
      :template="summaryTarget"
      @close="summaryTarget = null"
    />
  </AppLayout>
</template>
