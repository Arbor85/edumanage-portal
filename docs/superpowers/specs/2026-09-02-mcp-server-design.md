# MCP Server Design — EduManage Training Plans

**Date:** 2026-09-02  
**Status:** Approved

## Overview

Add a new `EduManage.Mcp` project to the netbackend solution exposing a Model Context Protocol (MCP) server over HTTP/SSE. The server gives AI agents trainer-side access to manage training plans and view workout history.

## Goals

- Allow AI agents to read and write training plans for any client
- Allow AI agents to view workout history and progress
- Provide context tools (clients, exercises) so agents can work without hardcoded IDs
- Secure access via a static API key (trainer-only, internal tool)

## Architecture

### New Project

`netbackend/src/EduManage.Mcp/` — ASP.NET Core minimal API app.

**Project references:**
- `EduManage.Application` — MediatR commands, queries, repository contracts
- `EduManage.Infrastructure` — repository implementations, EF InMemory registration

**NuGet packages:**
- `ModelContextProtocol.AspNetCore` — official .NET MCP SDK, SSE transport

**Port:** 5091 (separate from main API on 5090)

### Project Structure

```
EduManage.Mcp/
  Tools/
    PlanTools.cs
    WorkoutHistoryTools.cs
    ClientTools.cs
  Program.cs
  appsettings.json
  EduManage.Mcp.csproj
```

### DI Registration

`Program.cs` registers the same services as the main API:
- MediatR (from `EduManage.Application`)
- All repositories (from `EduManage.Infrastructure`)
- `IOptions<McpSettings>` bound to the `"Mcp"` config section
- `ModelContextProtocol.AspNetCore` MCP server with SSE transport at `/sse`

### Configuration (`appsettings.json`)

```json
{
  "Mcp": {
    "ApiKey": "<secret>",
    "TrainerUserId": "auth0|<trainer-sub>"
  }
}
```

`TrainerUserId` is passed into every MediatR command/query as the authenticated user, mirroring how controllers read the JWT sub claim today.

## Auth

A minimal middleware checks the `X-Api-Key` request header on every request. If missing or wrong, it returns `401`. No Auth0 / JWT involved — this is a trusted internal tool for the trainer's own agents.

## Data Flow

```
AI Agent
  → HTTP SSE  (X-Api-Key header)
    → ApiKeyMiddleware (401 if invalid)
      → MCP Tool Handler  (injects ISender, IOptions<McpSettings>)
        → ISender.Send(command / query)
          → MediatR Handler  (existing, unchanged)
            → IRepository
              → EF InMemory DB
```

Tools are thin wrappers — all business logic stays in the existing MediatR handlers.

## MCP Tools

### Plans

| Tool | MediatR Handler | Description |
|------|----------------|-------------|
| `list_plans` | `ListPlansQuery` | List all plans; optional `clientId` filter |
| `get_plan` | `GetPlanQuery` | Get a plan with full workout and exercise detail |
| `create_plan` | `AddPlanCommand` | Create a new training plan |
| `update_plan` | `UpdatePlanCommand` | Update plan name, notes, workouts |
| `delete_plan` | `DeletePlanCommand` | Delete a plan by ID |
| `update_plan_status` | `UpdatePlanStatusCommand` | Change plan status (e.g. Active → Completed) |

### Workout History

| Tool | MediatR Handler | Description |
|------|----------------|-------------|
| `list_workout_history` | `ListWorkoutHistoryQuery` *(new)* | List completed workout sessions; optional date range filter |
| `get_workout_history` | `GetWorkoutHistoryQuery` *(new)* | Get a single session with all completed exercises and sets |

The two new query handlers follow the same pattern as existing queries — a record query + `Handler : IRequestHandler<T, R>` using `IWorkoutHistoryRepository`. No new repository methods required beyond what already exists.

### Context

| Tool | MediatR Handler | Description |
|------|----------------|-------------|
| `list_clients` | `ListClientsQuery` | List trainer's clients (id, name) so agents can reference them |
| `list_exercises` | `ListExcercisesQuery` | Search the exercise library so agents can build plans with valid exercise IDs |

## Error Handling

- `NotFoundException` thrown by a handler → tool returns a descriptive error string; no exception propagates to the MCP transport
- Invalid or missing required parameters → tool returns a validation message
- `401` from middleware for bad API key

## What Is Not In Scope

- Client-side agent access (clients cannot connect)
- Writing workout history (read-only)
- Managing meetings, courses, or schedule plans via MCP
- MCP Resources or Prompts — tools only

## Files to Create

| File | Purpose |
|------|---------|
| `EduManage.Mcp/EduManage.Mcp.csproj` | Project file referencing Application + Infrastructure |
| `EduManage.Mcp/Program.cs` | DI, middleware, MCP server registration |
| `EduManage.Mcp/appsettings.json` | ApiKey + TrainerUserId config |
| `EduManage.Mcp/Tools/PlanTools.cs` | 6 plan tools |
| `EduManage.Mcp/Tools/WorkoutHistoryTools.cs` | 2 workout history tools |
| `EduManage.Mcp/Tools/ClientTools.cs` | 2 context tools |
| `EduManage.Application/Features/WorkoutHistory/ListWorkoutHistoryQuery.cs` | New query handler |
| `EduManage.Application/Features/WorkoutHistory/GetWorkoutHistoryQuery.cs` | New query handler |

The solution file `EduManage.sln` needs `EduManage.Mcp` added as a project reference.
