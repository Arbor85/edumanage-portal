<script setup lang="ts">
import type { WorkoutHistoryOut } from '../types'

const props = defineProps<{
  historyItem: WorkoutHistoryOut
}>()

function fmtDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}h ${m % 60}m`
  return `${m}m`
}
</script>

<!-- Off-screen share card sized for social (1200×630 → rendered at 600×315) -->
<template>
  <div
    id="workout-share-card"
    style="
      position: fixed;
      left: -9999px;
      top: 0;
      width: 600px;
      height: 315px;
      background: linear-gradient(135deg, #141720 0%, #1C2030 100%);
      border-radius: 16px;
      padding: 40px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      font-family: system-ui, -apple-system, sans-serif;
      color: white;
      overflow: hidden;
    "
  >
    <!-- Glow accent -->
    <div style="
      position: absolute;
      top: -60px;
      right: -60px;
      width: 200px;
      height: 200px;
      background: rgba(255,107,53,0.25);
      border-radius: 50%;
      filter: blur(60px);
      pointer-events: none;
    " />

    <!-- Top: app brand -->
    <div style="display: flex; align-items: center; gap: 10px;">
      <div style="
        width: 32px;
        height: 32px;
        background: #FF6B35;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: 16px;
      ">E</div>
      <span style="font-size: 14px; font-weight: 700; opacity: 0.6; letter-spacing: 0.1em; text-transform: uppercase;">EduManage</span>
    </div>

    <!-- Middle: workout name -->
    <div>
      <p style="font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.5; margin-bottom: 8px;">Workout complete</p>
      <h1 style="font-size: 36px; font-weight: 900; line-height: 1.1; margin: 0;">
        {{ props.historyItem.name ?? props.historyItem.sourceWorkout?.name ?? 'Workout' }}
      </h1>
    </div>

    <!-- Bottom: stats row -->
    <div style="display: flex; gap: 32px;">
      <div>
        <p style="font-size: 28px; font-weight: 900; color: #FF6B35; margin: 0;">{{ fmtDuration(props.historyItem.durationSeconds) }}</p>
        <p style="font-size: 11px; font-weight: 600; opacity: 0.5; text-transform: uppercase; letter-spacing: 0.08em; margin: 0;">Duration</p>
      </div>
      <div>
        <p style="font-size: 28px; font-weight: 900; color: #FF6B35; margin: 0;">{{ props.historyItem.completedSets }}</p>
        <p style="font-size: 11px; font-weight: 600; opacity: 0.5; text-transform: uppercase; letter-spacing: 0.08em; margin: 0;">Sets done</p>
      </div>
      <div>
        <p style="font-size: 28px; font-weight: 900; color: #FF6B35; margin: 0;">{{ (props.historyItem.excercises ?? []).length }}</p>
        <p style="font-size: 11px; font-weight: 600; opacity: 0.5; text-transform: uppercase; letter-spacing: 0.08em; margin: 0;">Exercises</p>
      </div>
    </div>
  </div>
</template>
