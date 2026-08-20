import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, TrendingUp, Zap, Clock, Target } from 'lucide-react-native'
import { getClientProgress } from '../../src/api/clientsApi'

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View className="flex-1 bg-surface border border-border rounded-2xl p-4 items-center">
      {icon}
      <Text className="text-foreground text-2xl font-bold mt-2">{value}</Text>
      <Text className="text-muted text-xs mt-1 text-center">{label}</Text>
    </View>
  )
}

export default function ClientProgressScreen() {
  const { clientId } = useLocalSearchParams<{ clientId: string }>()
  const router = useRouter()
  const { data, isLoading } = useQuery({
    queryKey: ['client-progress', clientId],
    queryFn: () => getClientProgress(clientId),
    enabled: !!clientId,
  })

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center px-4 pt-6 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={22} color="#71717a" />
        </TouchableOpacity>
        <Text className="text-foreground text-2xl font-bold flex-1">Client Progress</Text>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator color="#a78bfa" style={{ marginTop: 32 }} />
        ) : data ? (
          <>
            <View className="flex-row mb-6" style={{ gap: 12 }}>
              <StatCard
                icon={<Zap size={20} color="#a78bfa" />}
                label="Workouts"
                value={String(data.totalWorkouts ?? 0)}
              />
              <StatCard
                icon={<Target size={20} color="#a78bfa" />}
                label="Total Sets"
                value={String(data.totalSets ?? 0)}
              />
              <StatCard
                icon={<Clock size={20} color="#a78bfa" />}
                label="Hours"
                value={String(data.totalHours ?? 0)}
              />
            </View>

            {data.records && data.records.length > 0 && (
              <>
                <Text className="text-foreground text-lg font-semibold mb-3">Personal Records</Text>
                {data.records.map((pr, i) => (
                  <View
                    key={i}
                    className="bg-surface border border-border rounded-xl p-4 mb-2 flex-row items-center justify-between"
                  >
                    <View>
                      <Text className="text-foreground font-medium">{pr.exerciseName}</Text>
                      <Text className="text-muted text-sm">
                        {new Date(pr.completedAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View className="items-end">
                      {pr.weight != null && (
                        <Text className="text-accent font-bold text-lg">{pr.weight} kg</Text>
                      )}
                      {pr.reps != null && (
                        <Text className="text-muted text-sm">{pr.reps} reps</Text>
                      )}
                    </View>
                  </View>
                ))}
              </>
            )}

            {(!data.records || data.records.length === 0) && (
              <View className="items-center py-8">
                <TrendingUp size={36} color="#71717a" />
                <Text className="text-muted text-center mt-3">
                  No progress data yet for this client.
                </Text>
              </View>
            )}
          </>
        ) : (
          <View className="items-center py-16">
            <Text className="text-muted">Could not load client progress.</Text>
          </View>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  )
}
