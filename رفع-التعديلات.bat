@echo off
cd /d "%~dp0"

echo.
echo ========================================
echo   Deploy Updates to GitHub
echo ========================================
echo.

REM Show current branch (helps user know which branch is being pushed)
for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD') do set CURRENT_BRANCH=%%b
echo Current branch: %CURRENT_BRANCH%
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

REM Push current branch (HEAD) to remote main, regardless of which local branch we're on.
REM This handles both main repo (on main) and worktrees (on feature branches).
git push origin HEAD:main

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
