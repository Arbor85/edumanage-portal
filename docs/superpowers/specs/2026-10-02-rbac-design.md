# RBAC Design — EduManage Portal

**Date:** 2026-10-02  
**Scope:** Backend endpoint authorization + frontend route guards using Auth0 roles and permissions

---

## Roles

| Role | Description |
|---|---|
| `regular` | Standard gym member. Authenticated JWT is sufficient. No permissions required. |
| `gym-trainer` | Coach. Manages clients, plans, meetings, courses, equipment, forms. |
| `gym-organizer` | Gym owner/admin. Manages org settings, trainers, buildings, schedule plans. |

Roles are assigned in Auth0 and appear in the ID token under `https://edumanage.app/roles`.

---

## Permissions

Auth0 assigns permissions to roles. They appear in the access token under the `permissions` claim.

| Permission | Assigned to role | Description |
|---|---|---|
| `manage:clients` | `gym-trainer` | Clients, plans, meetings, courses, MCP API keys |
| `manage:equipment` | `gym-trainer` | Equipment catalog |
| `manage:forms` | `gym-trainer` | Form templates, standalone form responses |
| `view:schedule` | `gym-trainer` | Trainer's own schedule |
| `manage:organization` | `gym-organizer` | Org settings, trainers, invitations |
| `manage:buildings` | `gym-organizer` | Buildings and availability |
| `manage:schedule-plans` | `gym-organizer` | Schedule plans and entries |

---

## Backend — Controller Authorization

### New policies to add to `Program.cs`

Three new policies alongside the existing four:

```csharp
options.AddPolicy("manage:forms", ...);
options.AddPolicy("manage:buildings", ...);
options.AddPolicy("manage:schedule-plans", ...);
```

`HasPermissionHandler` requires no changes — it already reads the `permissions` claim.

### Controller → policy mapping

| Controller | Authorization |
|---|---|
| `ClientsController` | `[Authorize(Policy="manage:clients")]` on controller |
| `PlansController` | `[Authorize(Policy="manage:clients")]` on controller |
| `MeetingsController` | `[Authorize(Policy="manage:clients")]` on controller |
| `CoursesController` | `[Authorize(Policy="manage:clients")]` on controller |
| `ApiKeysController` | `[Authorize(Policy="manage:clients")]` on controller |
| `EquipmentController` | `[Authorize(Policy="manage:equipment")]` on controller |
| `FormTemplatesController` | `[Authorize(Policy="manage:forms")]` on controller |
| `StandaloneFormResponsesController` | `[Authorize(Policy="manage:forms")]` on controller |
| `MyScheduleController` | `[Authorize(Policy="view:schedule")]` on controller |
| `BuildingsController` | `[Authorize(Policy="manage:buildings")]` on controller |
| `SchedulePlansController` | `[Authorize(Policy="manage:schedule-plans")]` on controller |
| `OrganizationsController` | `[Authorize(Policy="manage:organization")]` on controller |

### Mixed endpoints (per-action authorization)

| Controller | Endpoint | Authorization |
|---|---|---|
| `ExcercisesController` | GET `/` and GET `/{id}` | `[Authorize]` (all authenticated) |
| `ExcercisesController` | POST, PUT, DELETE | `[Authorize(Policy="manage:clients")]` |
| `ExcercisesController` | POST `/{id}/favourite` | `[Authorize]` |
| `GymProfileController` | GET, PUT, DELETE own | `[Authorize]` |
| `GymProfileController` | GET `/client/{userId}` | `[Authorize(Policy="manage:clients")]` |
| `InvitationsController` | All | `[Authorize]` |
| `FormResponsesController` | All | `[Authorize]` |
| `RoutinesController` | All | `[Authorize]` |
| `UserEquipmentController` | All | `[Authorize]` |
| `UsersController` | All | `[Authorize]` |

---

## Frontend — Auth Store

**File:** `modern/src/stores/authStore.ts`

### Changes

- Add `permissions = ref<string[]>([])`
- Add `loadPermissions()`: calls `getAccessTokenSilently()`, decodes the JWT payload (base64), reads `payload.permissions ?? []`, stores in `permissions`
- Add `hasPermission(permission: string): boolean` — returns `permissions.value.includes(permission)`
- Call `loadPermissions()` after authentication is confirmed (same lifecycle point as `fetchUserProfile()`)
- Remove `isTrainer` and `isOrganizer` computed properties — replaced by `hasPermission()` calls at usage sites

---

## Frontend — Router

**File:** `modern/src/router/index.ts`

### Meta type change

Replace `requiresTrainer: boolean` and `requiresOrganizer: boolean` with:

```typescript
requiresPermission?: string
```

### Route → permission mapping

| Route | `requiresPermission` |
|---|---|
| `/coach/clients` | `manage:clients` |
| `/coach/clients/:id` | `manage:clients` |
| `/coach/plans` | `manage:clients` |
| `/coach/meetings` | `manage:clients` |
| `/coach/courses` | `manage:clients` |
| `/coach/mcp-keys` | `manage:clients` |
| `/coach/equipment` | `manage:equipment` |
| `/coach/form-templates` | `manage:forms` |
| `/my-schedule` | `view:schedule` |
| `/gym-profile/client/:userId` | `manage:clients` |
| `/organizer` | `manage:organization` |
| `/organizer/trainers` | `manage:organization` |
| `/organizer/buildings` | `manage:buildings` |
| `/organizer/schedule-plans` | `manage:schedule-plans` |
| `/organizer/schedule-plans/:id` | `manage:schedule-plans` |

### Guard change

```typescript
if (to.meta.requiresPermission && !authStore.hasPermission(to.meta.requiresPermission)) {
  return { path: '/' }
}
```

Remove the existing `requiresTrainer` and `requiresOrganizer` guard branches.

---

## Frontend — Navigation Components

Any nav component currently using `authStore.isTrainer` or `authStore.isOrganizer` to show/hide links switches to `authStore.hasPermission('manage:clients')` / `authStore.hasPermission('manage:organization')` etc., matching the permission that guards the target route.

---

## Auth0 Configuration (manual steps)

1. In Auth0 dashboard → **APIs** → your API → **Permissions tab**: add the 3 new permissions (`manage:forms`, `manage:buildings`, `manage:schedule-plans`)
2. **Roles** → `gym-trainer`: assign `manage:clients`, `manage:equipment`, `manage:forms`, `view:schedule`
3. **Roles** → `gym-organizer`: assign `manage:organization`, `manage:buildings`, `manage:schedule-plans`
4. **APIs** → your API → **Settings**: ensure "Enable RBAC" and "Add Permissions in the Access Token" are both ON

---

## Files Changed

| File | Change |
|---|---|
| `netbackend/src/EduManage.Api/Program.cs` | Add 3 new policies |
| `netbackend/src/EduManage.Api/Controllers/*.cs` | Add `[Authorize(Policy="...")]` to 12 controllers |
| `modern/src/stores/authStore.ts` | Add permissions ref, loadPermissions, hasPermission; remove isTrainer/isOrganizer |
| `modern/src/router/index.ts` | Replace requiresTrainer/requiresOrganizer meta with requiresPermission; update guard |
| Nav components (to be identified during impl) | Replace role checks with hasPermission calls |
