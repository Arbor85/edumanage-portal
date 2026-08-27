# Implementation Plan: Routine Exercise Picker Redesign

**Spec:** `2026-08-27-routine-exercise-picker-redesign.md`
**Date:** 2026-08-27

---

## Phase 1 — Backend: `UserExercisePreference` entity + repository

### Step 1 — Domain entity

Create `netbackend/src/EduManage.Domain/Entities/UserExercisePreference.cs`:

```csharp
public class UserExercisePreference
{
    public string UserId { get; set; } = string.Empty;
    public int ExerciseId { get; set; }
    public bool IsDirectFavourite { get; set; }
    public int UsageCount { get; set; }
}
```

### Step 2 — EF configuration

Create `netbackend/src/EduManage.Infrastructure/Persistence/Configurations/UserExercisePreferenceConfiguration.cs`:

```csharp
public class UserExercisePreferenceConfiguration : IEntityTypeConfiguration<UserExercisePreference>
{
    public void Configure(EntityTypeBuilder<UserExercisePreference> builder)
    {
        builder.HasKey(x => new { x.UserId, x.ExerciseId });
    }
}
```

### Step 3 — Repository interface

Create `netbackend/src/EduManage.Application/Contracts/IUserExercisePreferenceRepository.cs`:

```csharp
public interface IUserExercisePreferenceRepository
{
    Task<List<UserExercisePreference>> GetByUserIdAsync(string userId);
    Task UpsertAsync(string userId, int exerciseId, Action<UserExercisePreference> update);
}
```

`UpsertAsync` finds or creates the preference row then applies the `update` action before saving — used by both toggle-favourite and usage-tracking paths.

### Step 4 — Repository implementation

Create `netbackend/src/EduManage.Infrastructure/Persistence/Repositories/UserExercisePreferenceRepository.cs`:

- Inject `AppDbContext` (or whatever the DbContext is named — check existing repos).
- `GetByUserIdAsync`: `Context.Set<UserExercisePreference>().Where(x => x.UserId == userId).ToListAsync()`
- `UpsertAsync`: `FindAsync(userId, exerciseId)` → create if null → apply `update(entity)` → `SaveChangesAsync()`

### Step 5 — Register in DI

In the Infrastructure DI registration file (e.g. `ServiceCollectionExtensions.cs` or `DependencyInjection.cs`), add:

```csharp
services.AddScoped<IUserExercisePreferenceRepository, UserExercisePreferenceRepository>();
```

Follow the exact pattern used for `IExerciseRepository` registration.

---

## Phase 2 — Backend: toggle direct favourite endpoint

### Step 6 — MediatR command + handler

Create `netbackend/src/EduManage.Application/Features/Excercises/ToggleExerciseFavouriteCommand.cs`:

```csharp
public sealed record ToggleExerciseFavouriteCommand(int ExerciseId, string CurrentUserId)
    : IRequest;

internal sealed class ToggleExerciseFavouriteHandler(
    IUserExercisePreferenceRepository prefRepo,
    IExerciseRepository exerciseRepo)
    : IRequestHandler<ToggleExerciseFavouriteCommand>
{
    public async Task Handle(ToggleExerciseFavouriteCommand request, CancellationToken ct)
    {
        var exercise = await exerciseRepo.GetByIdAsync(request.ExerciseId)
            ?? throw new NotFoundException(nameof(Exercise), request.ExerciseId);

        await prefRepo.UpsertAsync(
            request.CurrentUserId,
            request.ExerciseId,
            pref => pref.IsDirectFavourite = !pref.IsDirectFavourite);
    }
}
```

### Step 7 — Controller endpoint

In `netbackend/src/EduManage.Api/Controllers/ExcercisesController.cs`, add:

```csharp
[HttpPost("{id}/favourite")]
[Authorize]
public async Task<IActionResult> ToggleFavourite(int id)
{
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    await _mediator.Send(new ToggleExerciseFavouriteCommand(id, userId));
    return NoContent();
}
```

Check the existing `UpdateRoutineCommand` handler to see exactly how `CurrentUserId` is extracted from the JWT (it uses a claim — replicate that pattern exactly).

---

## Phase 3 — Backend: enrich `GET /api/excercises`

### Step 8 — Update `ExcerciseOut` response type

In the file that defines `ExcerciseOut` (Application layer DTO), add:

```csharp
public bool IsDirectFavourite { get; init; }
public int UsageCount { get; init; }
```

### Step 9 — Update `ListExcercisesQuery` handler

Find `netbackend/src/EduManage.Application/Features/Excercises/ListExcercisesQuery.cs`.

Modify the handler to:
1. Accept an optional `CurrentUserId` (nullable string — null when unauthenticated).
2. If `CurrentUserId` is not null: fetch preferences via `prefRepo.GetByUserIdAsync(userId)`, build a lookup dict by `ExerciseId`.
3. When mapping each exercise to `ExcerciseOut`, populate `IsDirectFavourite` and `UsageCount` from the lookup (default to `false` / `0` if not found).

Update the controller's `ListExcercises` method to extract the user ID from the JWT when present (use `User.FindFirstValue(...)`, which returns null for anonymous) and pass it to the query.

The endpoint remains open (no `[Authorize]`) so anonymous access still works.

---

## Phase 4 — Backend: usage tracking on routine save

### Step 10 — Update `AddRoutineCommand` handler

In `netbackend/src/EduManage.Application/Features/Routines/AddRoutineCommand.cs`, after the routine is persisted:

```csharp
foreach (var exercise in request.Request.Excercises)
{
    await prefRepo.UpsertAsync(
        request.CurrentUserId,
        exercise.ExcerciseId,
        pref => pref.UsageCount++);
}
```

Inject `IUserExercisePreferenceRepository` into the handler constructor.

### Step 11 — Update `UpdateRoutineCommand` handler

Same change in `netbackend/src/EduManage.Application/Features/Routines/UpdateRoutineCommand.cs` — after the update is saved, iterate exercises and increment `UsageCount`.

---

## Phase 5 — Frontend: types + API service

### Step 12 — Update `ExcerciseOut` type

In `modern/src/types/index.ts`, add to the `ExcerciseOut` interface:

```typescript
isDirectFavourite: boolean
usageCount: number
```

### Step 13 — Add `toggleFavourite` to exercises API

In `modern/src/services/exercisesApi.ts`, add:

```typescript
toggleFavourite: (id: number): Promise<void> =>
  apiClient.post(`/api/excercises/${id}/favourite`).then(() => undefined),
```

Follow the exact style of existing methods in that file.

---

## Phase 6 — Frontend: `useExercisePicker` composable

### Step 14 — Create composable

Create `modern/src/composables/useExercisePicker.ts`:

```typescript
export function useExercisePicker() {
  const exerciseStore = useExerciseStore()

  const selectedIds = ref<Set<number>>(new Set())
  const searchQuery = ref('')
  const muscleFilter = ref<string[]>([])

  const sortedExercises = computed(() => {
    return [...exerciseStore.exercises].sort((a, b) => {
      if (a.isDirectFavourite !== b.isDirectFavourite)
        return a.isDirectFavourite ? -1 : 1
      if (a.usageCount !== b.usageCount)
        return b.usageCount - a.usageCount
      return (a.name ?? '').localeCompare(b.name ?? '')
    })
  })

  const filteredExercises = computed(() => {
    let list = sortedExercises.value
    if (searchQuery.value.trim())
      list = list.filter(e => e.name?.toLowerCase().includes(searchQuery.value.toLowerCase()))
    if (muscleFilter.value.length)
      list = list.filter(e => muscleFilter.value.includes(e.primaryMuscle ?? ''))
    return list
  })

  const selectedExercises = computed(() =>
    filteredExercises.value.filter(e => selectedIds.value.has(e.id))
  )

  const hasMultipleSelected = computed(() => selectedIds.value.size >= 2)

  function toggleSelection(id: number) {
    const next = new Set(selectedIds.value)
    next.has(id) ? next.delete(id) : next.add(id)
    selectedIds.value = next
  }

  async function toggleDirectFavourite(id: number) {
    // optimistic update
    const exercise = exerciseStore.exercises.find(e => e.id === id)
    if (exercise) exercise.isDirectFavourite = !exercise.isDirectFavourite
    try {
      await exercisesApi.toggleFavourite(id)
    } catch {
      // revert on failure
      if (exercise) exercise.isDirectFavourite = !exercise.isDirectFavourite
    }
  }

  function clearSelection() {
    selectedIds.value = new Set()
  }

  function reset() {
    selectedIds.value = new Set()
    searchQuery.value = ''
    muscleFilter.value = []
  }

  return {
    selectedIds,
    searchQuery,
    muscleFilter,
    sortedExercises,
    filteredExercises,
    selectedExercises,
    hasMultipleSelected,
    toggleSelection,
    toggleDirectFavourite,
    clearSelection,
    reset,
  }
}
```

Check `useExerciseStore()` to confirm the exercises array is directly mutable (for optimistic update) — if it uses a getter, adjust accordingly.

---

## Phase 7 — Frontend: `ExercisePickerDialog` refactor

### Step 15 — Refactor the component

**File:** `modern/src/components/ExercisePickerDialog/index.vue`

Key changes (read the existing file fully before editing):

1. **Remove** the existing single-select click handler (currently emits `select` on row tap).
2. **Add** `useExercisePicker()` — replace local `searchQuery` and `muscleFilter` state with composable refs.
3. **Emits** — replace `select` with `add` and `addAsSuperset`.

**Template changes:**

- Each exercise row: wrap existing content in a `<button>` or `<div @click="toggleSelection(exercise.id)">`.
- Apply highlight class when `selectedIds.has(exercise.id)`: e.g. `bg-blue-50 dark:bg-blue-950`.
- Add `<Star>` icon button before the thumbnail (from `lucide-vue-next`). Use `:class` to fill it when `exercise.isDirectFavourite`. `@click.stop="toggleDirectFavourite(exercise.id)"`.
- Add `<Check>` icon (from `lucide-vue-next`) on the right, `v-show="selectedIds.has(exercise.id)"`.

**Section dividers** (above the list, not inside the scroll):
- `v-if="sortedExercises.some(e => e.isDirectFavourite)"` — show a "Favourites" label at the top and an "All exercises" label at the boundary. Use a computed `favouriteCount` to split the rendered list. Consider rendering two `v-for` lists separated by a `<div>` divider rather than injecting dividers mid-list.

**Bottom action bar** (outside the scroll container, sticky at bottom):
```html
<div class="flex items-center justify-between px-4 py-3 border-t">
  <span v-if="selectedIds.size > 0" class="text-sm text-gray-500">
    {{ selectedIds.size }} selected
  </span>
  <div class="flex gap-2 ml-auto">
    <BaseButton
      v-if="hasMultipleSelected"
      variant="secondary"
      @click="onAddAsSuperset"
    >Add as Superset</BaseButton>
    <BaseButton
      :disabled="selectedIds.size === 0"
      @click="onAdd"
    >Add</BaseButton>
  </div>
</div>
```

**Handlers:**
```typescript
function onAdd() {
  emit('add', selectedExercises.value)
  reset()
  // close dialog
}
function onAddAsSuperset() {
  emit('addAsSuperset', selectedExercises.value)
  reset()
  // close dialog
}
```

Use the existing dialog-close mechanism (check how the current `select` emit triggers close in the parent and replicate).

---

## Phase 8 — Frontend: `RoutineFormModal` wiring

### Step 16 — Handle new picker emits

**File:** `modern/src/pages/RoutinesPage/components/RoutineFormModal.vue`

Find where `ExercisePickerDialog` is used. Replace `@select="onExerciseSelected"` with:

```html
@add="onExercisesAdded"
@addAsSuperset="onExercisesAddedAsSuperset"
```

Add handler:
```typescript
function onExercisesAdded(exercises: ExcerciseOut[]) {
  for (const exercise of exercises) {
    addExerciseToForm(exercise) // existing single-exercise add logic
  }
}

function onExercisesAddedAsSuperset(exercises: ExcerciseOut[]) {
  const color = nextSupersetColor() // use existing color cycling logic
  const group: SupersetGroup = {
    id: Math.random().toString(36).slice(2),
    name: exercises.map(e => e.name).join(' / '),
    color,
  }
  form.supersetGroups.push(group)
  for (const exercise of exercises) {
    addExerciseToForm(exercise, group.id)
  }
}
```

Check existing superset creation code in `RoutineFormModal` (the "Create new superset" path) and replicate the ID generation and color assignment exactly.

### Step 17 — Muscle targeting button + sheet

Still in `RoutineFormModal.vue`:

**Computed:**
```typescript
const routineMuscles = computed(() => {
  const primary = new Set<string>()
  const secondary = new Set<string>()
  for (const ex of form.excercises) {
    if (ex.primaryMuscle) primary.add(ex.primaryMuscle)
    for (const m of ex.secondaryMuscles ?? []) secondary.add(m)
  }
  return {
    primary: [...primary],
    secondary: [...secondary].filter(m => !primary.has(m)),
  }
})
```

Note: `form.excercises` stores IDs not full objects — check the actual form shape and resolve full exercise objects from `useExerciseStore()` if needed.

**Button** (in header row, after routine name input):
```html
<button
  :disabled="form.excercises.length === 0"
  @click="showMuscleSheet = true"
  class="..."
>
  <Dumbbell class="w-5 h-5" />
</button>
```

**Sheet** (teleported, follow existing sheet pattern in the file):
```html
<BaseSheet v-model="showMuscleSheet" title="Muscle targets">
  <MuscleDistributionDialog :muscles="routineMuscles" />
</BaseSheet>
```

Check how `MuscleDistributionDialog` expects its props — read the component before wiring.

Add `showMuscleSheet = ref(false)` to the component state.

---

## Testing checklist

- [ ] `dotnet test` passes after backend changes
- [ ] Toggling favourite via the star button updates the sort order immediately (optimistic)
- [ ] Saving a routine increments usage count (verify via enriched GET response)
- [ ] Multi-select: selecting 1 exercise shows only "Add"; selecting 2+ shows "Add as Superset"
- [ ] "Add as Superset" creates a correctly coloured superset group with all selected exercises
- [ ] Muscle sheet shows correct muscles; updates as exercises are added/removed
- [ ] Muscle button is disabled when no exercises in routine
- [ ] Anonymous (no JWT) exercise list still loads without errors
- [ ] `npm run build` in `modern/` passes (type-check)
