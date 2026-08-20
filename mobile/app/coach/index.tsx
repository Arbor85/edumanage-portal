import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { Users, ChevronRight, ArrowLeft } from 'lucide-react-native'
import { getClients } from '../../src/api/clientsApi'

export default function ClientListScreen() {
  const router = useRouter()
  const { data: clients, isLoading } = useQuery({ queryKey: ['clients'], queryFn: getClients })

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center px-4 pt-6 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={22} color="#71717a" />
        </TouchableOpacity>
        <Text className="text-foreground text-2xl font-bold flex-1">Clients</Text>
        <Users size={22} color="#71717a" />
      </View>

      {isLoading ? (
        <ActivityIndicator color="#a78bfa" style={{ marginTop: 32 }} />
      ) : (
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {!clients?.length ? (
            <View className="items-center py-16">
              <Users size={40} color="#71717a" />
              <Text className="text-muted text-center mt-4">No clients yet.</Text>
            </View>
          ) : (
            clients.map(client => (
              <TouchableOpacity
                key={client.id}
                onPress={() => router.push(`/coach/${client.id}`)}
                className="bg-surface border border-border rounded-2xl p-4 mb-3 flex-row items-center"
              >
                <View className="w-10 h-10 rounded-full bg-accent/20 items-center justify-center mr-3">
                  <Text className="text-accent font-bold">
                    {(client.firstName?.[0] ?? client.name?.[0] ?? '?').toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-semibold">
                    {client.firstName && client.lastName
                      ? `${client.firstName} ${client.lastName}`
                      : client.name}
                  </Text>
                  {client.email && (
                    <Text className="text-muted text-sm">{client.email}</Text>
                  )}
                </View>
                <ChevronRight size={18} color="#71717a" />
              </TouchableOpacity>
            ))
          )}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  )
}
