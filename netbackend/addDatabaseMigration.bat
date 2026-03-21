@echo off
setlocal

if "%~1"=="" (
    echo Usage: addDatabaseMigration.bat ^<MigrationName^>
    echo Example: addDatabaseMigration.bat AddClientPhone
    exit /b 1
)

set MIGRATION_NAME=%~1

echo Adding migration: %MIGRATION_NAME%

dotnet build src\EduManage.Api -c Release
if %ERRORLEVEL% neq 0 (
    echo Build failed. Migration not created.
    exit /b %ERRORLEVEL%
)

dotnet ef migrations add %MIGRATION_NAME% ^
    --project src\EduManage.Infrastructure ^
    --startup-project src\EduManage.Api ^
    --configuration Release ^
    --no-build

if %ERRORLEVEL% neq 0 (
    echo Migration creation failed.
    exit /b %ERRORLEVEL%
)

echo.
echo Migration "%MIGRATION_NAME%" created successfully.
echo Run updateDatabase.bat to apply it.

endlocal
