@echo off
start "Frontend" cmd /k "cd /d %~dp0modern && npm run dev"
start "Backend" cmd /k "cd /d %~dp0netbackend && dotnet run --project src/EduManage.Api/EduManage.Api.csproj"
