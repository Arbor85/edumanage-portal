@echo off
start "Frontend" cmd /k "cd modern && npm run dev"
start "Backend" cmd /k "cd netbackend && dotnet run --project src/EduManage.Api/EduManage.Api.csproj"
