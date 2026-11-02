<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Timer } from '@lucide/vue'
import AppLayout from '../components/layout/AppLayout.vue'

const router = useRouter()

const tools = [
  {
    to: '/tools/emom-timer',
    icon: Timer,
    title: 'EMOM',
    description: 'Every Minute On the Minute workout timer',
  },
]
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto">
      <div class="pt-2 pb-8">
        <p class="text-xs font-bold tracking-widest uppercase text-text-muted mb-1">Utilities</p>
        <h1 class="text-3xl font-black text-text-primary dark:text-white">Tools</h1>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          v-for="tool in tools"
          :key="tool.to"
          class="group text-left bg-surface-card border border-white/8 rounded-2xl p-6
                 hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98]
                 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary"
          @click="router.push(tool.to)"
        >
          <div class="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mb-4
                      group-hover:bg-primary/25 transition-colors">
            <component :is="tool.icon" class="w-6 h-6 text-primary" />
          </div>
          <h2 class="text-base font-bold text-text-primary dark:text-white mb-1">{{ tool.title }}</h2>
          <p class="text-sm text-text-muted">{{ tool.description }}</p>
        </button>
      </div>
    </div>
  </AppLayout>
</template>
