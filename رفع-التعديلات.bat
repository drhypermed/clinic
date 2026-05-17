@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo ========================================
echo   Deploy Updates to GitHub
echo ========================================
echo.

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo [!] This folder is not a Git repository.
    goto end
)

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

REM Stage app/source changes only. Keep local reports, generated builds, and agent metadata out of commits.
git add -A -- . ":(exclude).claude" ":(exclude).claude/**" ":(exclude)playwright-report" ":(exclude)playwright-report/**" ":(exclude)test-results" ":(exclude)test-results/**"
if errorlevel 1 goto error

git diff --cached --quiet
if not errorlevel 1 (
    echo.
    echo [OK] No app changes to upload.
    goto end
)

git commit -m "%MESSAGE%"
if errorlevel 1 goto error

echo.
echo Syncing with origin/main...
git -c rebase.autoStash=true pull --rebase origin main
if errorlevel 1 (
    echo.
    echo [!] Could not rebase on origin/main.
    echo Resolve the Git conflict, then run:
    echo git rebase --continue
    echo Or cancel with:
    echo git rebase --abort
    goto error
)

REM Push current branch (HEAD) to remote main, regardless of which local branch we're on.
REM This handles both main repo (on main) and worktrees (on feature branches).
git push origin HEAD:main

if errorlevel 1 (
    goto error
) else (
    echo.
    echo [OK] Upload successful!
    echo.
    echo App will be deployed automatically in 10-15 minutes.
    echo Track progress at:
    echo https://github.com/drhypermed/clinic/actions
)

:end
echo.
pause
exit /b 0

:error
echo.
echo [!] Error during upload. Check messages above.
echo.
pause
exit /b 1
