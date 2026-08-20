import { View, Text, ScrollView, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Zap, Clock, Target } from 'lucide-react-native'
import { getProgress } from '../../src/api/progressApi'

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View className="flex-1 bg-surface border border-border rounded-2xl p-4 items-center">
      {icon}
      <Text className="text-foreground text-2xl font-bold mt-2">{value}</Text>
      <Text className="text-muted text-xs mt-1 text-center">{label}</Text>
    </View>
  )
}

export default function ProgressScreen() {
  const { data, isLoading } = useQuery({ queryKey: ['progress'], queryFn: getProgress })

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
        <Text className="text-foreground text-3xl font-bold mb-6">Progress</Text>

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
                {data.records.slice(0, 10).map((pr, i) => (
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
          </>
        ) : (
          <View className="items-center py-16">
            <TrendingUp size={40} color="#71717a" />
            <Text className="text-muted text-center mt-4">Complete workouts to see your progress.</Text>
          </View>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  )
}
