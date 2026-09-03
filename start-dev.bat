@echo off
start "Frontend" cmd /k "cd modern && npm run dev"
start "Backend" cmd /k "cd netbackend && dotnet run --project src/EduManage.Api/EduManage.Api.csproj"
start "MCP Server" cmd /k "cd netbackend && dotnet run --project src/EduManage.Mcp/EduManage.Mcp.csproj"
