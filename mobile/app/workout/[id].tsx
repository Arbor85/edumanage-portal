import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { X, SkipForward, Timer, CheckCircle } from 'lucide-react-native'
import { useWorkoutStore } from '../../src/stores/workoutStore'

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

function RestTimerOverlay({
  seconds,
  total,
  onSkip,
}: {
  seconds: number
  total: number
  onSkip: () => void
}) {
  const progress = total > 0 ? seconds / total : 0
  return (
    <View
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(9,9,11,0.95)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
    >
      <View className="items-center">
        <Timer size={32} color="#a78bfa" />
        <Text className="text-foreground text-7xl font-bold mt-4">{seconds}</Text>
        <Text className="text-muted text-base mt-2">Rest</Text>
        <View className="w-48 h-1 bg-surface rounded-full mt-6 overflow-hidden">
          <View
            className="h-full bg-accent rounded-full"
            style={{ width: `${progress * 100}%` }}
          />
        </View>
        <TouchableOpacity
          onPress={onSkip}
          className="mt-8 bg-surface border border-border rounded-xl px-8 py-3"
        >
          <Text className="text-foreground font-medium">Skip Rest</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function WorkoutComplete({
  workout,
  onDone,
}: {
  workout: { name: string; completedSets: number; totalSets: number; durationSeconds: number }
  onDone: () => void
}) {
  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <CheckCircle size={64} color="#a78bfa" />
      <Text className="text-foreground text-3xl font-bold mt-6 text-center">Workout Complete!</Text>
      <Text className="text-muted text-base mt-2 text-center">{workout.name}</Text>

      <View className="flex-row mt-8" style={{ gap: 24 }}>
        <View className="items-center">
          <Text className="text-accent text-3xl font-bold">{workout.completedSets}</Text>
          <Text className="text-muted text-sm">Sets Done</Text>
        </View>
        <View className="w-px bg-border" />
        <View className="items-center">
          <Text className="text-accent text-3xl font-bold">{formatTime(workout.durationSeconds)}</Text>
          <Text className="text-muted text-sm">Duration</Text>
        </View>
      </View>

      <TouchableOpacity onPress={onDone} className="mt-10 bg-accent rounded-2xl py-4 px-12">
        <Text className="text-background font-semibold text-base">Done</Text>
      </TouchableOpacity>
    </View>
  )
}

export default function WorkoutScreen() {
  const router = useRouter()
  const {
    activeWorkout,
    elapsedSeconds,
    isResting,
    restSecondsLeft,
    restTotalSeconds,
    completeSet,
    completeSupersetItem,
    skipRest,
    skipExercise,
    finishWorkout,
    completedWorkout,
    clearCompleted,
  } = useWorkoutStore()

  const [actualReps, setActualReps] = useState('')
  const [actualWeight, setActualWeight] = useState('')
  const [finishing, setFinishing] = useState(false)

  const handleDone = () => {
    clearCompleted()
    router.replace('/(tabs)')
  }

  if (completedWorkout) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <WorkoutComplete
          workout={{
            name: completedWorkout.name ?? '',
            completedSets: completedWorkout.completedSets,
            totalSets: completedWorkout.totalSets,
            durationSeconds: completedWorkout.durationSeconds,
          }}
          onDone={handleDone}
        />
      </SafeAreaView>
    )
  }

  if (!activeWorkout) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted">No active workout.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-accent">Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const step = activeWorkout.steps[activeWorkout.currentStepIndex]
  const isFinished = activeWorkout.currentStepIndex >= activeWorkout.steps.length

  if (isFinished) {
    const handleFinish = async () => {
      setFinishing(true)
      try {
        await finishWorkout()
      } catch {
        setFinishing(false)
      }
    }
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
        <CheckCircle size={48} color="#a78bfa" />
        <Text className="text-foreground text-2xl font-bold mt-4 text-center">All sets done!</Text>
        <TouchableOpacity
          onPress={handleFinish}
          disabled={finishing}
          className="mt-8 bg-accent rounded-2xl py-4 px-12"
        >
          <Text className="text-background font-semibold text-base">
            {finishing ? 'Saving...' : 'Finish Workout'}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const handleCompleteSet = () => {
    if (!step) return
    const reps = actualReps ? parseInt(actualReps, 10) : null
    const weight = actualWeight ? parseFloat(actualWeight) : null
    if (step.type === 'normal-set' || step.type === 'drop-set') {
      completeSet(reps, weight)
    }
    setActualReps('')
    setActualWeight('')
  }

  const handleCompleteSupersetItem = () => {
    const reps = actualReps ? parseInt(actualReps, 10) : null
    const weight = actualWeight ? parseFloat(actualWeight) : null
    completeSupersetItem(reps, weight)
    setActualReps('')
    setActualWeight('')
  }

  const handleSkipExercise = () => {
    Alert.alert('Skip Exercise', 'Skip this exercise?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Skip', onPress: skipExercise },
    ])
  }

  const handleQuit = () => {
    Alert.alert('Quit Workout', 'Your progress will be lost.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Quit', style: 'destructive', onPress: () => router.replace('/(tabs)') },
    ])
  }

  // Derive display info from the current step
  let exerciseName = ''
  let setLabel = ''
  let targetReps: number | null = null
  let targetWeight: number | null = null
  let isSupersetRound = false
  let supersetItems: { name: string; setIndex: number; exerciseIndex: number; completed: boolean }[] = []
  let activeItemIndex = 0

  if (step && (step.type === 'normal-set' || step.type === 'drop-set')) {
    const ex = activeWorkout.exercises[step.exerciseIndex]
    const s = ex?.sets[step.setIndex]
    exerciseName = ex?.name ?? ''
    setLabel = `Set ${step.setIndex + 1} of ${ex?.sets.length ?? 0}`
    targetReps = s?.targetReps ?? null
    targetWeight = s?.targetWeight ?? null
  } else if (step && step.type === 'superset-round') {
    isSupersetRound = true
    setLabel = `Round ${step.roundIndex + 1}`
    supersetItems = step.items.map(item => ({
      name: activeWorkout.exercises[item.exerciseIndex]?.name ?? '',
      setIndex: item.setIndex,
      exerciseIndex: item.exerciseIndex,
      completed: item.completed,
    }))
    activeItemIndex = supersetItems.findIndex(i => !i.completed)
    if (activeItemIndex >= 0) {
      exerciseName = supersetItems[activeItemIndex].name
      const ex = activeWorkout.exercises[supersetItems[activeItemIndex].exerciseIndex]
      const s = ex?.sets[supersetItems[activeItemIndex].setIndex]
      targetReps = s?.targetReps ?? null
      targetWeight = s?.targetWeight ?? null
    }
  }

  const totalSteps = activeWorkout.steps.length
  const currentStep = activeWorkout.currentStepIndex + 1
  const progressPct = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-border">
        <TouchableOpacity onPress={handleQuit} className="mr-3">
          <X size={22} color="#71717a" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-foreground font-semibold" numberOfLines={1}>
            {activeWorkout.routineName}
          </Text>
          <Text className="text-muted text-xs">{formatTime(elapsedSeconds)}</Text>
        </View>
        <TouchableOpacity onPress={handleSkipExercise}>
          <SkipForward size={20} color="#71717a" />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View className="h-1 bg-surface mx-4 mt-2 rounded-full overflow-hidden">
        <View className="h-full bg-accent rounded-full" style={{ width: `${progressPct}%` }} />
      </View>
      <Text className="text-muted text-xs px-4 mt-1">
        {currentStep} / {totalSteps} steps
      </Text>

      <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
        {/* Step label */}
        <Text className="text-muted text-sm mb-1">{setLabel}</Text>

        {isSupersetRound ? (
          <>
            <Text className="text-accent text-xs font-semibold uppercase tracking-wider mb-3">
              Superset
            </Text>
            {supersetItems.map((item, i) => (
              <View
                key={i}
                className={`rounded-xl p-3 mb-2 border ${
                  i === activeItemIndex
                    ? 'bg-accent/10 border-accent/40'
                    : item.completed
                    ? 'bg-surface border-border opacity-50'
                    : 'bg-surface border-border'
                }`}
              >
                <Text
                  className={`font-medium ${i === activeItemIndex ? 'text-foreground' : 'text-muted'}`}
                >
                  {item.completed ? '\u2713 ' : ''}{item.name}
                </Text>
              </View>
            ))}
            <Text className="text-foreground text-2xl font-bold mt-4 mb-1">{exerciseName}</Text>
          </>
        ) : (
          <Text className="text-foreground text-3xl font-bold mb-1">{exerciseName}</Text>
        )}

        {/* Targets */}
        <View className="flex-row mt-3 mb-6" style={{ gap: 16 }}>
          {targetWeight != null && (
            <View className="bg-surface border border-border rounded-xl px-4 py-2">
              <Text className="text-muted text-xs">Target Weight</Text>
              <Text className="text-foreground text-lg font-semibold">{targetWeight} kg</Text>
            </View>
          )}
          {targetReps != null && (
            <View className="bg-surface border border-border rounded-xl px-4 py-2">
              <Text className="text-muted text-xs">Target Reps</Text>
              <Text className="text-foreground text-lg font-semibold">{targetReps}</Text>
            </View>
          )}
        </View>

        {/* Actual input */}
        <View className="flex-row mb-8" style={{ gap: 12 }}>
          <View className="flex-1">
            <Text className="text-muted text-xs mb-1">Reps</Text>
            <TextInput
              value={actualReps}
              onChangeText={setActualReps}
              placeholder={targetReps != null ? String(targetReps) : ''}
              placeholderTextColor="#71717a"
              keyboardType="numeric"
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground text-center text-xl font-bold"
            />
          </View>
          <View className="flex-1">
            <Text className="text-muted text-xs mb-1">Weight (kg)</Text>
            <TextInput
              value={actualWeight}
              onChangeText={setActualWeight}
              placeholder={targetWeight != null ? String(targetWeight) : ''}
              placeholderTextColor="#71717a"
              keyboardType="numeric"
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground text-center text-xl font-bold"
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={isSupersetRound ? handleCompleteSupersetItem : handleCompleteSet}
          className="bg-accent rounded-2xl py-4 items-center"
        >
          <Text className="text-background font-semibold text-lg">Done</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Rest timer overlay */}
      {isResting && restSecondsLeft != null && (
        <RestTimerOverlay
          seconds={restSecondsLeft}
          total={restTotalSeconds}
          onSkip={skipRest}
        />
      )}
    </SafeAreaView>
  )
}
