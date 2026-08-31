<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePageTitle } from '../composables/usePageTitle'
import { useRoute, useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import * as organizerApi from '../services/organizerApi'
import AuthLayout from '../components/layout/AuthLayout.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseInput from '../components/BaseInput.vue'
import BaseSpinner from '../components/BaseSpinner.vue'
import { useToast } from '../composables/useToast'
import { Users, Plus, Trash2 } from 'lucide-vue-next'
import type { AvailabilityCreate } from '../types'

usePageTitle('Join as Trainer')

const route = useRoute()
const router = useRouter()
const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0()
const toast = useToast()

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const code = route.params.code as string
const joining = ref(false)
const joined = ref(false)

const firstName = ref('')
const lastName = ref('')
const availabilities = ref<AvailabilityCreate[]>([])

onMounted(async () => {
  while (isLoading.value) await new Promise((r) => setTimeout(r, 50))

  if (!isAuthenticated.value) {
    sessionStorage.setItem('pendingTrainerJoinCode', code)
    loginWithRedirect({ appState: { returnTo: `/trainer-join/${code}` } })
  }
})

function addSlot() {
  availabilities.value.push({ daysOfWeek: [], startTime: '09:00', endTime: '17:00', validFrom: null, validTo: null })
}

function removeSlot(index: number) {
  availabilities.value.splice(index, 1)
}

function toggleDay(slotIndex: number, day: string) {
  const days = availabilities.value[slotIndex].daysOfWeek
  const idx = days.indexOf(day)
  idx === -1 ? days.push(day) : days.splice(idx, 1)
}

async function join() {
  joining.value = true
  try {
    await organizerApi.joinOrganization(code, {
      firstName: firstName.value.trim() || null,
      lastName: lastName.value.trim() || null,
      initialAvailabilities: availabilities.value.length > 0 ? availabilities.value : undefined,
    })
    joined.value = true
    toast.success('You joined the organization as a trainer.')
    setTimeout(() => router.push('/'), 1500)
  } catch {
    toast.error('Failed to join. The invite link may be invalid or expired.')
  } finally {
    joining.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-lg p-8 w-full max-w-md flex flex-col items-center text-center gap-5">
      <div v-if="isLoading">
        <BaseSpinner size="md" />
      </div>

      <template v-else-if="joined">
        <div class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Users class="w-7 h-7 text-primary" />
        </div>
        <p class="text-lg font-semibold text-text-primary dark:text-white">You're in!</p>
        <p class="text-sm text-text-secondary">Redirecting you to the app…</p>
      </template>

      <template v-else>
        <div class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Users class="w-7 h-7 text-primary" />
        </div>
        <div>
          <p class="text-lg font-semibold text-text-primary dark:text-white mb-1">Trainer Invitation</p>
          <p class="text-sm text-text-secondary">You've been invited to join an organization as a trainer.</p>
        </div>

        <!-- Name fields -->
        <div class="w-full text-left space-y-3">
          <p class="text-xs font-semibold text-text-secondary uppercase tracking-wide">Your name <span class="font-normal normal-case opacity-60">(optional)</span></p>
          <div class="flex gap-2">
            <BaseInput v-model="firstName" placeholder="First name" />
            <BaseInput v-model="lastName" placeholder="Last name" />
          </div>
        </div>

        <!-- Availability -->
        <div class="w-full text-left space-y-3">
          <div class="flex items-center justify-between">
            <p class="text-xs font-semibold text-text-secondary uppercase tracking-wide">Availability <span class="font-normal normal-case opacity-60">(optional)</span></p>
            <BaseButton size="sm" variant="ghost" @click="addSlot">
              <Plus class="w-3.5 h-3.5" /> Add slot
            </BaseButton>
          </div>
          <p v-if="availabilities.length === 0" class="text-xs text-text-secondary">
            You can define your availability now or skip — the organizer can add it later.
          </p>

          <div
            v-for="(slot, i) in availabilities"
            :key="i"
            class="p-4 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] space-y-3"
          >
            <div class="flex items-center justify-between">
              <p class="text-xs font-medium text-text-secondary">Slot {{ i + 1 }}</p>
              <button class="text-text-secondary hover:text-red-400 transition-colors" @click="removeSlot(i)">
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <p class="text-xs font-medium text-text-secondary mb-2">Days <span class="font-normal opacity-60">(empty = all days)</span></p>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="day in DAYS"
                  :key="day"
                  class="px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors"
                  :class="slot.daysOfWeek.includes(day)
                    ? 'bg-primary text-white border-primary'
                    : 'border-gray-300 dark:border-white/20 text-gray-600 dark:text-white/60 hover:border-primary/50'"
                  @click="toggleDay(i, day)"
                >{{ day.slice(0, 3) }}</button>
              </div>
            </div>

            <div>
              <p class="text-xs font-medium text-text-secondary mb-1.5">Time range</p>
              <div class="flex items-center gap-2">
                <BaseInput v-model="slot.startTime" type="time" />
                <span class="text-text-secondary text-sm flex-shrink-0">–</span>
                <BaseInput v-model="slot.endTime" type="time" />
              </div>
            </div>

            <div>
              <p class="text-xs font-medium text-text-secondary mb-1.5">Valid period <span class="font-normal opacity-60">(optional)</span></p>
              <div class="flex gap-2">
                <BaseInput
                  :model-value="slot.validFrom ?? ''"
                  type="date"
                  placeholder="From"
                  @update:model-value="slot.validFrom = $event || null"
                />
                <BaseInput
                  :model-value="slot.validTo ?? ''"
                  type="date"
                  placeholder="To"
                  @update:model-value="slot.validTo = $event || null"
                />
              </div>
            </div>
          </div>
        </div>

        <BaseButton variant="primary" :full-width="true" :loading="joining" @click="join">
          Accept &amp; Join
        </BaseButton>
      </template>
    </div>
  </AuthLayout>
</template>
