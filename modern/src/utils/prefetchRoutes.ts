let done = false

export function prefetchRoutes(isTrainer: boolean, isOrganizer: boolean) {
  if (done) return
  done = true

  const chunks: (() => Promise<unknown>)[] = [
    () => import('../pages/TodayPage.vue'),
    () => import('../pages/RoutinesPage.vue'),
    () => import('../pages/ProgressPage.vue'),
    () => import('../pages/ExplorePage.vue'),
    () => import('../pages/ProfilePage.vue'),
  ]

  if (isTrainer) {
    chunks.push(
      () => import('../pages/ClientsPage.vue'),
      () => import('../pages/PlansPage.vue'),
      () => import('../pages/MeetingsPage.vue'),
      () => import('../pages/CoursesPage.vue'),
      () => import('../pages/EquipmentPage.vue'),
      () => import('../pages/MySchedulePage.vue'),
    )
  }

  if (isOrganizer) {
    chunks.push(
      () => import('../pages/organizer/OrganizerDashboardPage.vue'),
      () => import('../pages/organizer/trainers/OrganizerTrainersPage.vue'),
      () => import('../pages/organizer/buildings/OrganizerBuildingsPage.vue'),
      () => import('../pages/organizer/schedule-plans/OrganizerSchedulePlansPage.vue'),
    )
  }

  // Fire all in background after a short yield so the current page renders first
  setTimeout(() => {
    for (const load of chunks) load().catch(() => {})
  }, 300)
}
