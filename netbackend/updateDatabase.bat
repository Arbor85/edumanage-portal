@echo off
setlocal

echo Applying pending migrations...

dotnet build src\EduManage.Api -c Release
if %ERRORLEVEL% neq 0 (
    echo Build failed. Database not updated.
    exit /b %ERRORLEVEL%
)

dotnet ef database update ^
    --project src\EduManage.Infrastructure ^
    --startup-project src\EduManage.Api ^
    --configuration Release ^
    --no-build

if %ERRORLEVEL% neq 0 (
    echo Database update failed.
    exit /b %ERRORLEVEL%
)

echo.
echo Database updated successfully.

endlocal
