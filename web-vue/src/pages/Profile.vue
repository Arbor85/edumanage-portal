<template>
    <div class="max-w-2xl">
        <h1 class="text-2xl font-bold mb-4">Profile</h1>

        <div v-if="isLoading" class="text-gray-600">Loading profile...</div>

        <div v-else-if="!isAuthenticated" class="text-gray-700">
            You are not logged in.
        </div>

        <div v-else-if="user" class="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div class="flex items-center gap-4 mb-6">
                <img
                    v-if="user.picture"
                    :src="user.picture"
                    :alt="user.name || 'User avatar'"
                    class="w-16 h-16 rounded-full object-cover border border-gray-200"
                />
                <div>
                    <p class="text-lg font-semibold">{{ user.name || user.nickname || 'User' }}</p>
                    <p class="text-sm text-gray-600">{{ user.email || 'No email available' }}</p>
                </div>
            </div>

            <dl class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                    <dt class="text-gray-500">Nickname</dt>
                    <dd class="text-gray-900">{{ user.nickname || '-' }}</dd>
                </div>
                <div>
                    <dt class="text-gray-500">Email verified</dt>
                    <dd class="text-gray-900">{{ user.email_verified ? 'Yes' : 'No' }}</dd>
                </div>
                <div class="md:col-span-2">
                    <dt class="text-gray-500">Auth0 user ID</dt>
                    <dd class="text-gray-900 break-all">{{ user.sub || '-' }}</dd>
                </div>
            </dl>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue'

const { isLoading, isAuthenticated, user } = useAuth0()
</script>