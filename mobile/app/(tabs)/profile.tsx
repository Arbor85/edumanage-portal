import { View, Text, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LogOut, User, Shield } from 'lucide-react-native'
import { useAppAuth } from '../../src/context/AuthContext'

export default function ProfileScreen() {
  const { logout, isTrainer } = useAppAuth()

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ])
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4 pt-6">
        <Text className="text-foreground text-3xl font-bold mb-8">Profile</Text>

        <View className="bg-surface border border-border rounded-2xl p-4 mb-4 flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-accent/20 items-center justify-center mr-3">
            <User size={24} color="#a78bfa" />
          </View>
          <View>
            <Text className="text-foreground font-semibold">Your Account</Text>
            {isTrainer && <Text className="text-accent text-xs mt-0.5">Trainer</Text>}
          </View>
        </View>

        {isTrainer && (
          <View className="bg-surface border border-border rounded-2xl p-4 mb-4 flex-row items-center">
            <Shield size={20} color="#a78bfa" />
            <Text className="text-foreground ml-3">Coach features available</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={handleLogout}
          className="bg-surface border border-border rounded-2xl p-4 flex-row items-center"
        >
          <LogOut size={20} color="#ef4444" />
          <Text className="text-red-400 font-medium ml-3">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
