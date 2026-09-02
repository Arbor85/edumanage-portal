# MCP Routines & API Key Management Design

**Date:** 2026-09-02  
**Status:** Approved

## Overview

Two additions to the existing MCP server:

1. **Routine tools** — expose the existing routine CRUD to AI agents via MCP
2. **API key management** — store MCP API keys in the database, provide a REST API to manage them, and update the MCP middleware to validate keys from the DB with per-key trainer identity

## Goals

- AI agents can list, get, create, update, and delete routines
- Trainer manages MCP API keys via authenticated REST endpoints
- Each API key is scoped to a trainer (by UserId) — no shared global key
- MCP middleware resolves trainer identity from the validated key, removing the hardcoded `TrainerUserId` from config

## What Is Not In Scope

- Key hashing / show-once semantics (noted as future hardening)
- Key expiry or rate limiting
- Client-facing key management

---

## Entity: McpApiKey

**Project:** `EduManage.Domain/Entities/McpApiKey.cs`

| Property | Type | Notes |
|----------|------|-------|
| `Id` | `string` (Guid) | Primary key |
| `Name` | `string` | Human label, e.g. "Claude Desktop" |
| `Key` | `string` | Secret value, stored plaintext |
| `UserId` | `string` | Trainer's Auth0 sub — owner of this key |
| `CreatedAt` | `string` | ISO 8601 |

---

## Application Layer

**Project:** `EduManage.Application`

### Repository contract

`Contracts/IApiKeyRepository.cs` — extends `IRepository<McpApiKey, string>`. No extra methods needed.

### MediatR handlers

| File | Input | Output |
|------|-------|--------|
| `Features/ApiKeys/ListApiKeysQuery.cs` | `CurrentUserId` | `IReadOnlyList<ApiKeyOut>` — Id, Name, CreatedAt (no Key) |
| `Features/ApiKeys/AddApiKeyCommand.cs` | `Name`, `CurrentUserId` | `ApiKeyCreatedOut` — Id, Name, Key, CreatedAt (full key, returned once) |
| `Features/ApiKeys/DeleteApiKeyCommand.cs` | `KeyId`, `CurrentUserId` | `Dictionary<string, string>` — same as DeletePlanCommand |

`AddApiKeyCommand` generates the key value with `Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N")` (64 hex chars).

### DTOs

Added to `Contracts/Dtos.cs`:
```
ApiKeyOut(string Id, string Name, string CreatedAt)
ApiKeyCreatedOut(string Id, string Name, string Key, string CreatedAt)
ApiKeyCreate(string Name)
```

### GetRoutineQuery

`Features/Routines/GetRoutineQuery.cs` — thin handler matching the `GetPlanQuery` pattern: fetch by Id, check `UserId == CurrentUserId`, throw `NotFoundException` if missing.

---

## Infrastructure Layer

**Project:** `EduManage.Infrastructure`

### EF configuration

`Persistence/Configurations/McpApiKeyConfiguration.cs` — `IEntityTypeConfiguration<McpApiKey>`. No JSON columns, straightforward mapping.

### Repository

`Persistence/Repositories/ApiKeyRepository.cs` — extends `BaseRepository<McpApiKey, string>`, implements `IApiKeyRepository`.

### DI registration

One line added to `DependencyInjection.cs`:
```csharp
services.AddScoped<IApiKeyRepository, ApiKeyRepository>();
```

### Migration

New EF migration: `AddMcpApiKeyMigration`.

---

## REST API

**Project:** `EduManage.Api/Controllers/ApiKeysController.cs`

All endpoints require Auth0 JWT (`[Authorize]`). Controller reads `UserId` from `User.Identity.Name` (the `sub` claim, same as other controllers).

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/mcp-keys` | List trainer's keys (Id, Name, CreatedAt — Key omitted) |
| `POST` | `/api/mcp-keys` | Create key; body `{ name }`; returns full key in response |
| `DELETE` | `/api/mcp-keys/{id}` | Delete key by Id |

---

## MCP Server Changes

**Project:** `EduManage.Mcp`

### ICurrentTrainerService

New scoped service populated by the middleware:

```
ICurrentTrainerService
  string UserId { get; }
```

`CurrentTrainerService` holds a mutable `UserId` set by middleware before the tool handler runs.

### Updated middleware

`Program.cs` middleware replaces the appsettings key check:

1. Read `X-Api-Key` header
2. Query `IApiKeyRepository` for a key matching the value
3. If not found → 401
4. If found → set `ICurrentTrainerService.UserId` from `McpApiKey.UserId`, call `next`

### RoutineTools

New `Tools/RoutineTools.cs` — five tools injecting `ISender` and `ICurrentTrainerService`:

| Tool | Handler |
|------|---------|
| `list_routines` | `ListRoutinesQuery` |
| `get_routine` | `GetRoutineQuery` (new) |
| `create_routine` | `AddRoutineCommand` |
| `update_routine` | `UpdateRoutineCommand` |
| `delete_routine` | `DeleteRoutineCommand` |

All existing plan/workout/client tools updated to inject `ICurrentTrainerService` instead of `IOptions<McpSettings>`.

### Config cleanup

`TrainerUserId` removed from `appsettings.json` and `appsettings.local.json`. `ApiKey` in appsettings also removed — keys are now DB-only.

---

## Files to Create

| File | Purpose |
|------|---------|
| `EduManage.Domain/Entities/McpApiKey.cs` | Entity |
| `EduManage.Application/Contracts/IApiKeyRepository.cs` | Repository interface |
| `EduManage.Application/Features/ApiKeys/ListApiKeysQuery.cs` | List handler |
| `EduManage.Application/Features/ApiKeys/AddApiKeyCommand.cs` | Create handler |
| `EduManage.Application/Features/ApiKeys/DeleteApiKeyCommand.cs` | Delete handler |
| `EduManage.Application/Features/Routines/GetRoutineQuery.cs` | Get handler |
| `EduManage.Infrastructure/Persistence/Configurations/McpApiKeyConfiguration.cs` | EF config |
| `EduManage.Infrastructure/Persistence/Repositories/ApiKeyRepository.cs` | Repository impl |
| `EduManage.Api/Controllers/ApiKeysController.cs` | REST controller |
| `EduManage.Mcp/Tools/RoutineTools.cs` | 5 routine tools |
| `EduManage.Mcp/Services/ICurrentTrainerService.cs` | Service interface + impl |

## Files to Modify

| File | Change |
|------|--------|
| `EduManage.Application/Contracts/Dtos.cs` | Add `ApiKeyOut`, `ApiKeyCreatedOut`, `ApiKeyCreate` |
| `EduManage.Infrastructure/DependencyInjection.cs` | Register `IApiKeyRepository` |
| `EduManage.Infrastructure/Persistence/EduManageDbContext.cs` | Add `DbSet<McpApiKey>` |
| `EduManage.Mcp/Program.cs` | Register `ICurrentTrainerService`, update middleware |
| `EduManage.Mcp/Tools/PlanTools.cs` | Use `ICurrentTrainerService` |
| `EduManage.Mcp/Tools/WorkoutHistoryTools.cs` | Use `ICurrentTrainerService` |
| `EduManage.Mcp/Tools/ClientTools.cs` | Use `ICurrentTrainerService` |
| `EduManage.Mcp/appsettings.json` | Remove `TrainerUserId`, remove `ApiKey` |
| `EduManage.Mcp/appsettings.local.json` | Remove `TrainerUserId`, remove `ApiKey` |
| New EF migration | `AddMcpApiKeyMigration` |
