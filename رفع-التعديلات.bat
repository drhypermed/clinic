@echo off
cd /d "%~dp0"

echo.
echo ========================================
echo   Deploy Updates to GitHub
echo ========================================
echo.

git status --short

echo.
set /p MESSAGE="Commit message (or press Enter for default): "

if "%MESSAGE%"=="" set MESSAGE=Update app

echo.
echo Uploading...
echo.

git add .
git commit -m "%MESSAGE%"
git push origin main

if errorlevel 1 (
    echo.
    echo [!] Error during upload. Check messages above.
) else (
    echo.
    echo [OK] Upload successful!
    echo.
    echo App will be deployed automatically in 10-15 minutes.
    echo Track progress at:
    echo https://github.com/drhypermed/clinic/actions
)

echo.
pause
