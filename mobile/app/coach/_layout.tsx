import { Stack } from 'expo-router'

export default function CoachLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#09090b' } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[clientId]" />
    </Stack>
  )
}
