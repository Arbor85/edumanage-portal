import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { FormTemplateOut, FormTemplateCreate, FormTemplateUpdate } from '../types'
import * as formsApi from '../services/formsApi'

export const useFormTemplateStore = defineStore('formTemplate', () => {
  const templates = ref<FormTemplateOut[]>([])
  const isLoading = ref(false)

  async function fetch() {
    isLoading.value = true
    try {
      templates.value = await formsApi.listFormTemplates()
    } finally {
      isLoading.value = false
    }
  }

  async function get(id: string) {
    const cached = templates.value.find((t) => t.id === id)
    if (cached) return cached
    return formsApi.getFormTemplate(id)
  }

  async function create(d: FormTemplateCreate) {
    const created = await formsApi.createFormTemplate(d)
    templates.value.push(created)
    return created
  }

  async function update(id: string, d: FormTemplateUpdate) {
    const updated = await formsApi.updateFormTemplate(id, d)
    const idx = templates.value.findIndex((t) => t.id === id)
    if (idx !== -1) templates.value[idx] = updated
    return updated
  }

  async function deactivate(id: string) {
    await formsApi.deactivateFormTemplate(id)
    const idx = templates.value.findIndex((t) => t.id === id)
    if (idx !== -1) templates.value[idx] = { ...templates.value[idx], isActive: false }
  }

  return { templates, isLoading, fetch, get, create, update, deactivate }
})
