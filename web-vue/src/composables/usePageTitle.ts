import { onBeforeUnmount, onMounted } from 'vue'

export const usePageTitle = (title: string) => {
  onMounted(() => {
    document.title = title
  })

  onBeforeUnmount(() => {
    document.title = 'Edu Manage'
  })
}
