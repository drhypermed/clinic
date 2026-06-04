@echo off
echo =======================================================
echo          Deploying Updates (Dr. Hyper Clinic)
echo =======================================================
echo.
echo [1/2] Building App (npm run build)...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build Failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/2] Deploying to Firebase...
call npx firebase-tools deploy
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Deploy Failed!
    pause
    exit /b %errorlevel%
)

echo.
echo =======================================================
echo    Deploy Complete! App is updated.
echo =======================================================
pause
