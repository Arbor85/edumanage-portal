import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Dumbbell } from 'lucide-react-native'
import { useAppAuth } from '../../src/context/AuthContext'
import { useState } from 'react'

export default function LoginScreen() {
  const { login } = useAppAuth()
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try { await login() } finally { setLoading(false) }
  }

  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
      <View className="items-center mb-12">
        <View className="w-20 h-20 rounded-2xl bg-accent/20 items-center justify-center mb-6">
          <Dumbbell size={40} color="#a78bfa" />
        </View>
        <Text className="text-foreground text-4xl font-bold mb-2">EduManage</Text>
        <Text className="text-muted text-base text-center">Your personal training companion</Text>
      </View>

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        className="w-full bg-accent rounded-2xl py-4 items-center"
      >
        {loading ? (
          <ActivityIndicator color="#09090b" />
        ) : (
          <Text className="text-background text-base font-semibold">Sign In</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  )
}
