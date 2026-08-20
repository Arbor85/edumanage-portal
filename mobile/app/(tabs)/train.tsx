import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Search, Play } from 'lucide-react-native'
import { getRoutines } from '../../src/api/routinesApi'
import { useWorkoutStore } from '../../src/stores/workoutStore'
import type { RoutineOut } from '../../src/types'

export default function TrainScreen() {
  const router = useRouter()
  const { data: routines, isLoading } = useQuery({ queryKey: ['routines'], queryFn: getRoutines })
  const startFromRoutine = useWorkoutStore(s => s.startFromRoutine)
  const [search, setSearch] = useState('')

  const filtered = routines?.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  const handleStart = (routine: RoutineOut) => {
    startFromRoutine(routine)
    router.push(`/workout/${routine.id}`)
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 pt-6 pb-4">
        <Text className="text-foreground text-3xl font-bold mb-4">Train</Text>
        <View className="flex-row items-center bg-surface border border-border rounded-xl px-3">
          <Search size={16} color="#71717a" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search routines..."
            placeholderTextColor="#71717a"
            className="flex-1 text-foreground py-3 ml-2"
          />
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator color="#a78bfa" style={{ marginTop: 32 }} />
      ) : (
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <View className="items-center py-16">
              <Text className="text-muted text-center">
                {search ? 'No routines match your search.' : 'No routines yet. Create one on the web app.'}
              </Text>
            </View>
          ) : (
            filtered.map(routine => (
              <View key={routine.id} className="bg-surface border border-border rounded-2xl p-4 mb-3">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-1 mr-3">
                    <Text className="text-foreground text-lg font-semibold">{routine.name}</Text>
                    {routine.note && (
                      <Text className="text-muted text-sm mt-0.5" numberOfLines={1}>{routine.note}</Text>
                    )}
                  </View>
                </View>

                <View className="flex-row mb-3">
                  <View className="bg-accent/10 px-2 py-1 rounded-lg mr-2">
                    <Text className="text-accent text-xs">{routine.excercises?.length ?? 0} exercises</Text>
                  </View>
                  {(routine.supersetGroups?.length ?? 0) > 0 && (
                    <View className="bg-violet-500/10 px-2 py-1 rounded-lg">
                      <Text className="text-violet-400 text-xs">{routine.supersetGroups.length} supersets</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  onPress={() => handleStart(routine)}
                  className="bg-accent rounded-xl py-2.5 flex-row items-center justify-center"
                >
                  <Play size={16} color="#09090b" fill="#09090b" />
                  <Text className="text-background font-semibold text-sm ml-2">Start Workout</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  )
}
