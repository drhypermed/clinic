@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Installing functions dependencies...
cd functions
call npm install
if errorlevel 1 (
  echo npm install failed.
  pause
  exit /b 1
)
cd ..
echo Deploying Cloud Functions...
call firebase deploy --only functions
pause
