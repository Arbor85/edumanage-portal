<script setup lang="ts">
import { onMounted } from 'vue'
import { useBodyMeasurementStore } from '../../../stores/bodyMeasurementStore'
import MeasurementLogForm from './MeasurementLogForm.vue'
import MeasurementChart from './MeasurementChart.vue'
import MeasurementList from './MeasurementList.vue'

const store = useBodyMeasurementStore()
onMounted(() => store.fetch())
</script>

<template>
  <div class="space-y-6">
    <MeasurementLogForm />
    <MeasurementChart :measurements="store.measurements" />
    <MeasurementList :measurements="store.measurements" />
  </div>
</template>
