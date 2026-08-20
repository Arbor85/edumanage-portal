import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { Play, Calendar } from 'lucide-react-native'
import { getRoutines } from '../../src/api/routinesApi'
import { useWorkoutStore } from '../../src/stores/workoutStore'
import type { RoutineOut } from '../../src/types'

export default function TodayScreen() {
  const router = useRouter()
  const { data: routines, isLoading } = useQuery({ queryKey: ['routines'], queryFn: getRoutines })
  const startFromRoutine = useWorkoutStore(s => s.startFromRoutine)
  const activeWorkout = useWorkoutStore(s => s.activeWorkout)

  const suggested = routines?.[0] ?? null

  const handleStart = (routine: RoutineOut) => {
    startFromRoutine(routine)
    router.push(`/workout/${routine.id}`)
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center mb-1">
          <Calendar size={14} color="#71717a" />
          <Text className="text-muted text-sm ml-1">{today}</Text>
        </View>
        <Text className="text-foreground text-3xl font-bold mb-6">Today</Text>

        {activeWorkout && (
          <TouchableOpacity
            onPress={() => router.push(`/workout/${activeWorkout.sourceWorkout?.id ?? 'current'}`)}
            className="bg-accent/20 border border-accent/40 rounded-2xl p-4 mb-4"
          >
            <Text className="text-accent text-xs font-semibold mb-1 uppercase tracking-wide">In Progress</Text>
            <Text className="text-foreground text-lg font-semibold">{activeWorkout.routineName}</Text>
            <Text className="text-muted text-sm mt-1">Tap to continue</Text>
          </TouchableOpacity>
        )}

        <Text className="text-foreground text-lg font-semibold mb-3">Suggested Workout</Text>

        {isLoading ? (
          <ActivityIndicator color="#a78bfa" style={{ paddingVertical: 32 }} />
        ) : suggested ? (
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-foreground text-xl font-bold mb-1">{suggested.name}</Text>
            <Text className="text-muted text-sm mb-4">
              {suggested.excercises?.length ?? 0} exercises
            </Text>
            <TouchableOpacity
              onPress={() => handleStart(suggested)}
              className="bg-accent rounded-xl py-3 flex-row items-center justify-center"
            >
              <Play size={18} color="#09090b" fill="#09090b" />
              <Text className="text-background font-semibold ml-2">Start Workout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="bg-surface rounded-2xl p-6 border border-border items-center">
            <Text className="text-muted text-center">No routines yet. Create one on the web app first.</Text>
          </View>
        )}

        {routines && routines.length > 1 && (
          <>
            <Text className="text-foreground text-lg font-semibold mt-6 mb-3">All Routines</Text>
            {routines.slice(1).map(r => (
              <TouchableOpacity
                key={r.id}
                onPress={() => handleStart(r)}
                className="bg-surface border border-border rounded-xl p-4 mb-2 flex-row items-center justify-between"
              >
                <View>
                  <Text className="text-foreground font-medium">{r.name}</Text>
                  <Text className="text-muted text-sm">{r.excercises?.length ?? 0} exercises</Text>
                </View>
                <Play size={16} color="#71717a" />
              </TouchableOpacity>
            ))}
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  )
}
