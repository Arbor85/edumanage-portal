import { Tabs } from 'expo-router'
import { Home, Dumbbell, TrendingUp, User, Users } from 'lucide-react-native'
import { useAppAuth } from '../../src/context/AuthContext'

export default function TabLayout() {
  const { isTrainer } = useAppAuth()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#18181b', borderTopColor: '#27272a', height: 64 },
        tabBarActiveTintColor: '#a78bfa',
        tabBarInactiveTintColor: '#71717a',
        tabBarLabelStyle: { fontSize: 11, marginBottom: 6 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Today', tabBarIcon: ({ color }) => <Home size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="train"
        options={{ title: 'Train', tabBarIcon: ({ color }) => <Dumbbell size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="progress"
        options={{ title: 'Progress', tabBarIcon: ({ color }) => <TrendingUp size={22} color={color} /> }}
      />
      {isTrainer && (
        <Tabs.Screen
          name="../coach"
          options={{ title: 'Coach', tabBarIcon: ({ color }) => <Users size={22} color={color} />, href: '/coach' }}
        />
      )}
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color }) => <User size={22} color={color} /> }}
      />
    </Tabs>
  )
}
