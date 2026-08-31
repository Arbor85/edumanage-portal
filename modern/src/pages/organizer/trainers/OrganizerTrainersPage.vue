<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useOrganizerStore } from '../../../stores/organizerStore'
import { useCourseStore } from '../../../stores/courseStore'
import { useToast } from '../../../composables/useToast'
import PageHeader from '../../../components/layout/PageHeader.vue'
import EmptyState from '../../../components/EmptyState.vue'
import ConfirmDialog from '../../../components/ConfirmDialog.vue'
import BaseButton from '../../../components/BaseButton.vue'
import TrainerCard from './components/TrainerCard.vue'
import { Users, Copy, Check } from 'lucide-vue-next'
import type { AvailabilityCreate } from '../../../types'

const organizerStore = useOrganizerStore()
const courseStore = useCourseStore()
const toast = useToast()

const copied = ref(false)
const deleteTarget = ref<string | null>(null)

onMounted(async () => {
  await organizerStore.fetchOrg()
  await organizerStore.fetchTrainers()
  await organizerStore.fetchTrainerCourses()
  await courseStore.fetch()
})

async function copyInviteLink() {
  if (!organizerStore.org) return
  await organizerStore.generateInvite()
  const link = `${window.location.origin}/trainer-join/${organizerStore.org.inviteCode}`
  await navigator.clipboard.writeText(link)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

async function handleDelete() {
  if (!deleteTarget.value) return
  try {
    await organizerStore.removeTrainer(deleteTarget.value)
    toast.success('Trainer removed')
  } catch {
    toast.error('Failed to remove trainer')
  } finally {
    deleteTarget.value = null
  }
}

async function handleAddAvailability(trainerId: string, payload: AvailabilityCreate) {
  await organizerStore.addTrainerAvailability(trainerId, payload)
}

async function handleDeleteAvailability(trainerId: string, slotId: string) {
  await organizerStore.deleteTrainerAvailability(trainerId, slotId)
}

async function handleAssignCourse(trainerId: string, courseId: string) {
  await organizerStore.addTrainerCourse({ trainerId, courseId })
}

async function handleRemoveCourse(associationId: string) {
  await organizerStore.deleteTrainerCourse(associationId)
}

function trainerCoursesFor(trainerId: string) {
  return organizerStore.trainerCourses.filter(a => a.trainerUserId === trainerId)
}

function availableCoursesFor(trainerId: string) {
  const assigned = new Set(trainerCoursesFor(trainerId).map(a => a.courseId))
  return courseStore.courses.filter(c => c.id && !assigned.has(c.id))
}
</script>

<template>
  <div>
    <PageHeader title="Trainers" subtitle="Manage your organization's trainers.">
      <BaseButton variant="secondary" @click="copyInviteLink">
        <component :is="copied ? Check : Copy" class="w-4 h-4" />
        {{ copied ? 'Copied!' : 'Copy Invite Link' }}
      </BaseButton>
    </PageHeader>

    <div v-if="organizerStore.isLoading" class="text-text-secondary text-sm">Loading…</div>

    <EmptyState
      v-else-if="organizerStore.trainers.length === 0"
      :icon="Users"
      title="No trainers yet"
      description="Share the invite link so trainers can join your organization."
      action-label="Copy Invite Link"
      @action="copyInviteLink"
    />

    <div v-else class="flex flex-col gap-3">
      <TrainerCard
        v-for="trainer in organizerStore.trainers"
        :key="trainer.trainerUserId"
        :trainer="trainer"
        :availabilities="organizerStore.trainerAvailabilities[trainer.trainerUserId] ?? []"
        :trainer-courses="trainerCoursesFor(trainer.trainerUserId)"
        :available-courses="availableCoursesFor(trainer.trainerUserId)"
        :all-courses="courseStore.courses"
        @delete="deleteTarget = trainer.trainerUserId"
        @expand="organizerStore.fetchTrainerAvailability(trainer.trainerUserId)"
        @add-availability="(payload) => handleAddAvailability(trainer.trainerUserId, payload)"
        @delete-availability="(id) => handleDeleteAvailability(trainer.trainerUserId, id)"
        @assign-course="(courseId) => handleAssignCourse(trainer.trainerUserId, courseId)"
        @remove-course="handleRemoveCourse"
      />
    </div>

    <ConfirmDialog
      :open="!!deleteTarget"
      title="Remove Trainer"
      message="Remove this trainer from your organization? They will lose access immediately."
      confirm-label="Remove"
      variant="danger"
      @confirm="handleDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
