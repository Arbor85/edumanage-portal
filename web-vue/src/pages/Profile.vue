<template>
    <div class="max-w-2xl">
        <h1 class="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">Profile</h1>

        <div v-if="isLoading" class="text-slate-600 dark:text-slate-300">Loading profile...</div>

        <div v-else-if="!isAuthenticated" class="text-slate-700 dark:text-slate-200">
            You are not logged in.
        </div>

        <div v-else-if="user" class="bg-white rounded-lg shadow p-6 border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
            <div class="flex items-center gap-4 mb-6">
                <img
                    v-if="user.picture"
                    :src="user.picture"
                    :alt="user.name || 'User avatar'"
                    class="w-16 h-16 rounded-full object-cover border border-gray-200 dark:border-slate-600"
                />
                <div>
                    <p class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ user.name || user.nickname || 'User' }}</p>
                    <p class="text-sm text-slate-600 dark:text-slate-300">{{ user.email || 'No email available' }}</p>
                </div>
            </div>

            <dl class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                    <dt class="text-slate-500 dark:text-slate-400">Nickname</dt>
                    <dd class="text-slate-900 dark:text-slate-100">{{ user.nickname || '-' }}</dd>
                </div>
                <div>
                    <dt class="text-slate-500 dark:text-slate-400">Email verified</dt>
                    <dd class="text-slate-900 dark:text-slate-100">{{ user.email_verified ? 'Yes' : 'No' }}</dd>
                </div>
                <div class="md:col-span-2">
                    <dt class="text-slate-500 dark:text-slate-400">Auth0 user ID</dt>
                    <dd class="text-slate-900 dark:text-slate-100 break-all">{{ user.sub || '-' }}</dd>
                </div>
            </dl>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue'

const { isLoading, isAuthenticated, user } = useAuth0()
</script>