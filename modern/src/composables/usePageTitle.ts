import { watch, onUnmounted, toValue, type MaybeRefOrGetter } from 'vue'

const APP_NAME = 'EduManage'

/**
 * Sets document.title to "<title> | EduManage" and restores the previous title on unmount.
 *
 * @param title  Static string, ref, or getter returning the title.
 * @param condition  Optional ref/getter. When provided the title is only applied while the
 *                   condition is truthy (e.g. while a dialog is open). The previous title is
 *                   restored as soon as the condition becomes falsy again.
 */
export function usePageTitle(
  title: MaybeRefOrGetter<string>,
  condition?: MaybeRefOrGetter<boolean>,
) {
  let snapshot = ''

  function apply(t: string) {
    document.title = t ? `${t} | ${APP_NAME}` : APP_NAME
  }

  if (condition !== undefined) {
    const stop = watch(
      [() => toValue(title), () => toValue(condition)] as const,
      ([t, active], prev) => {
        const wasActive = prev?.[1] ?? false
        if (active) {
          if (!wasActive) snapshot = document.title
          apply(t)
        } else if (wasActive) {
          document.title = snapshot
          snapshot = ''
        }
      },
      { immediate: true },
    )
    onUnmounted(() => {
      stop()
      if (snapshot) document.title = snapshot
    })
  } else {
    snapshot = document.title
    apply(toValue(title))
    const stop = watch(() => toValue(title), apply)
    onUnmounted(() => {
      stop()
      document.title = snapshot
    })
  }
}
