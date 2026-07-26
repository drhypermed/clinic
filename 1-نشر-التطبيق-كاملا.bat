@echo off
setlocal EnableExtensions DisableDelayedExpansion
chcp 65001 >nul
cd /d "%~dp0"

set "PROJECT_ID=gen-lang-client-0444130146"
set "SITE_URL=https://gen-lang-client-0444130146.web.app"
set "FIREBASE_CLI=%APPDATA%\npm\firebase.cmd"
set "FIREBASE_CLI_DISABLE_UPDATE_CHECK=true"

echo.
echo =======================================================
echo       نشر تطبيق Dr Hyper Clinic كاملًا وبأمان
echo =======================================================
echo.

if not exist "%FIREBASE_CLI%" (
    echo [خطأ] أداة Firebase غير مثبتة على الجهاز.
    echo ثبّتها مرة واحدة بالأمر التالي ثم أعد المحاولة:
    echo npm install -g firebase-tools@15.21.0
    goto fail
)

echo [1/5] فحص متغيرات الحماية اللازمة للبناء...
node --input-type=module -e "import {loadEnv} from 'vite'; const env=loadEnv('production',process.cwd(),''); const required=['VITE_VAPID_KEY','VITE_RECAPTCHA_SITE_KEY']; const missing=required.filter((key)=>!String(env[key]||'').trim()); if(missing.length){console.error('[خطأ] متغيرات ناقصة: '+missing.join(', ')); process.exit(1)} console.log('[تم] متغيرات الحماية الأساسية موجودة بدون عرض قيمها.')"
if errorlevel 1 (
    echo.
    echo [خطأ] لن يتم نشر نسخة ناقصة الحماية. راجع ملف .env المحلي.
    goto fail
)

echo.
echo [2/5] فحص أنواع TypeScript...
call npm.cmd run typecheck
if errorlevel 1 (
    echo.
    echo [خطأ] فشل فحص TypeScript. لم يتم بناء أو نشر الموقع.
    goto fail
)

echo.
echo [3/5] بناء نسخة كاملة ونظيفة من الموقع...
call npm.cmd run build
if errorlevel 1 (
    echo.
    echo [خطأ] فشل بناء الموقع. لم يتم نشر أي ملفات.
    goto fail
)

if not exist "dist\index.html" (
    echo.
    echo [خطأ] ملف dist\index.html غير موجود بعد البناء.
    goto fail
)

if not exist "dist\sw.js" (
    echo.
    echo [خطأ] ملف تحديث التطبيق dist\sw.js غير موجود بعد البناء.
    goto fail
)

if /I "%~1"=="--check" goto check_only_success

echo.
echo [4/5] نشر نسخة الموقع الكاملة على Firebase Hosting...
call "%FIREBASE_CLI%" deploy --only hosting --project "%PROJECT_ID%" --non-interactive
if errorlevel 1 (
    echo.
    echo [خطأ] فشل نشر الاستضافة. راجع رسالة Firebase الموجودة بالأعلى.
    goto fail
)

echo.
echo [5/5] التأكد من وصول نسخة التحديث إلى الموقع...
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$baseUrl='%SITE_URL%/sw.js?deploy_check=' + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds(); for ($attempt=1; $attempt -le 3; $attempt++) { try { $response=Invoke-WebRequest -UseBasicParsing -Method Head -Uri $baseUrl -Headers @{'Cache-Control'='no-cache'} -TimeoutSec 15; if ($response.StatusCode -eq 200) { Write-Host ('[تم] الموقع أعاد الحالة 200. آخر تعديل: ' + $response.Headers['Last-Modified']); exit 0 } } catch { Write-Host ('محاولة الفحص ' + $attempt + ' لم تنجح: ' + $_.Exception.Message) }; if ($attempt -lt 3) { Start-Sleep -Seconds 3 } }; exit 1"
if errorlevel 1 (
    echo.
    echo [تحذير] Firebase أنهى النشر، لكن تعذر فحص الموقع بعد 3 محاولات.
    echo افتح الرابط التالي وتأكد قبل تنفيذ التحديث من لوحة الإدارة:
    echo %SITE_URL%
    goto fail
)

echo.
echo =======================================================
echo   [تم] نُشر التطبيق كاملًا وتم فحص الموقع بنجاح.
echo =======================================================
echo.
echo يمكنك الآن فتح لوحة الإدارة وتنفيذ تحديث التطبيق.
echo %SITE_URL%
echo.
pause
exit /b 0

:check_only_success
echo.
echo [تم] نجح فحص ملف نشر التطبيق والبناء الكامل بدون تنفيذ نشر فعلي.
exit /b 0

:fail
echo.
echo لم يكتمل النشر بنجاح. لم يتم إعلان النسخة كتحديث مكتمل.
echo.
pause
exit /b 1
