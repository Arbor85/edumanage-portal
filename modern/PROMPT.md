# Backend prompt – Equipment feature

Add two new API resource groups to the EduManage .NET backend: **Equipment catalog** and **User Equipment**.

---

## 1. Equipment catalog  (`/api/equipment`)

### Domain model

```csharp
public class Equipment
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public EquipmentType EquipmentType { get; set; }   // Bodyweight | Weight
    public List<decimal>? WeightOptions { get; set; }  // null when EquipmentType == Bodyweight
}

public enum EquipmentType { Bodyweight, Weight }
```

### DTOs

```csharp
// GET response / list item
public record EquipmentOut(
    string Id,
    string? Name,
    string EquipmentType,        // "bodyweight" | "weight"
    List<decimal>? WeightOptions
);

// POST / PUT body
public record EquipmentWriteRequest(
    string? Name,
    string EquipmentType,
    List<decimal>? WeightOptions
);
```

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/equipment` | List all equipment (no auth filter – shared catalog) |
| POST | `/api/equipment` | Create equipment (trainer only) |
| PUT | `/api/equipment/{id}` | Update equipment (trainer only) |
| DELETE | `/api/equipment/{id}` | Delete equipment; also removes all UserEquipment rows referencing it |

Validation:
- `Name` required, max 100 chars
- `EquipmentType` must be `"bodyweight"` or `"weight"`
- `WeightOptions` must be null/empty when type is `bodyweight`; each value > 0 when type is `weight`

---

## 2. User Equipment  (`/api/user-equipment`)

Stores which equipment a user owns, and which weight options they have available (a subset of the catalog item's `WeightOptions`).

### Domain model

```csharp
public class UserEquipment
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = default!;   // Auth0 sub
    public Guid EquipmentId { get; set; }
    public Equipment Equipment { get; set; } = default!;
    public List<decimal>? AvailableWeights { get; set; }  // null when bodyweight
}
```

### DTOs

```csharp
// GET response item
public record UserEquipmentOut(
    string EquipmentId,
    string? Name,
    string EquipmentType,
    List<decimal>? AvailableWeights
);

// PUT body – full replacement (send the complete desired state)
public record UserEquipmentBatchUpdate(
    List<UserEquipmentSave> Equipment
);

public record UserEquipmentSave(
    string EquipmentId,
    List<decimal>? AvailableWeights
);
```

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/user-equipment` | Return the current user's owned equipment |
| PUT | `/api/user-equipment` | Full-replace the current user's owned equipment list |

PUT semantics:
- Delete all existing `UserEquipment` rows for the current user.
- Insert one row per item in the request body.
- `AvailableWeights` must be a subset of the referenced `Equipment.WeightOptions`; reject with 400 if a weight value is not in the catalog list.
- Return the saved list as `List<UserEquipmentOut>`.

Authentication: both endpoints require the authenticated user's `sub` claim (same pattern as all other protected endpoints in this project).

---

## 3. Migration

Add a new EF Core migration:
- Create `Equipment` table (`Id`, `Name`, `EquipmentType` (int enum stored as int), `WeightOptions` (JSON column))
- Create `UserEquipment` table (`Id`, `UserId`, `EquipmentId` FK → `Equipment.Id` ON DELETE CASCADE, `AvailableWeights` (JSON column))
- Index `UserEquipment` on `UserId`

---

## 4. Serialisation notes

- Serialize `EquipmentType` enum as lowercase string (`"bodyweight"` / `"weight"`) to match the frontend contract.
- `WeightOptions` and `AvailableWeights` should be stored as JSON arrays in the database and serialised as `number[]` in JSON responses.
