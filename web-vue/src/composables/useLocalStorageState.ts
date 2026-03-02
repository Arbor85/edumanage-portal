import { onMounted, ref, watch, type Ref } from 'vue'

export const useLocalStorageState = <T>(
  key: string,
  defaultValue: T,
): Ref<T> => {
  const state = ref(defaultValue) as Ref<T>

  onMounted(() => {
    const rawValue = localStorage.getItem(key)

    if (!rawValue) {
      return
    }

    try {
      state.value = JSON.parse(rawValue) as T
    } catch {
      state.value = defaultValue
    }
  })

  watch(
    state,
    (value) => {
      localStorage.setItem(key, JSON.stringify(value))
    },
    { deep: true },
  )

  return state
}
