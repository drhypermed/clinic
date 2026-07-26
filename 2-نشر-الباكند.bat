@echo off
setlocal EnableExtensions DisableDelayedExpansion
chcp 65001 >nul
cd /d "%~dp0"

set "PROJECT_ID=gen-lang-client-0444130146"
set "FIREBASE_CLI=%APPDATA%\npm\firebase.cmd"
set "FIREBASE_CLI_DISABLE_UPDATE_CHECK=true"
set "FUNCTIONS_DISCOVERY_TIMEOUT=60"

echo.
echo =======================================================
echo          نشر باك إند Dr Hyper Clinic بأمان
echo =======================================================
echo.
echo هذا الملف يُستخدم فقط عند تعديل مجلد functions.
echo نشر جميع الدوال قد يستغرق عدة دقائق، وهذا طبيعي.
echo.

if not exist "%FIREBASE_CLI%" (
    echo [خطأ] أداة Firebase غير مثبتة على الجهاز.
    echo ثبّتها مرة واحدة بالأمر التالي ثم أعد المحاولة:
    echo npm install -g firebase-tools@15.21.0
    goto fail
)

if not exist "functions\package-lock.json" (
    echo [خطأ] ملف functions\package-lock.json غير موجود.
    goto fail
)

echo [1/3] فحص مكتبات الباك إند المحلية...
call npm.cmd --prefix functions list --depth=0 >nul 2>&1
if errorlevel 1 (
    echo المكتبات ناقصة أو لا تطابق package.json. سيتم تثبيتها مرة واحدة...
    call npm.cmd --prefix functions ci
    if errorlevel 1 (
        echo.
        echo [خطأ] فشل تثبيت مكتبات الباك إند.
        goto fail
    )
) else (
    echo [تم] المكتبات موجودة ومتوافقة؛ لن يتم تثبيتها من جديد.
)

echo.
echo [2/3] فحص تحميل تعريفات الدوال محليًا...
pushd functions
node -e "require('./index.js'); console.log('[تم] تم تحميل تعريفات الدوال بنجاح.')"
set "FUNCTION_CHECK_RESULT=%ERRORLEVEL%"
popd
if not "%FUNCTION_CHECK_RESULT%"=="0" (
    echo.
    echo [خطأ] تعذر تحميل تعريفات الدوال. لم يبدأ النشر.
    goto fail
)

if /I "%~1"=="--check" goto check_only_success

echo.
echo [3/3] نشر جميع دوال الباك إند بمهلة تحليل 60 ثانية...
call "%FIREBASE_CLI%" deploy --only functions --project "%PROJECT_ID%" --non-interactive
if errorlevel 1 (
    echo.
    echo [خطأ] فشل نشر الباك إند. راجع رسالة Firebase الموجودة بالأعلى.
    goto fail
)

echo.
echo =======================================================
echo        [تم] نُشر الباك إند كاملًا بنجاح.
echo =======================================================
echo.
pause
exit /b 0

:check_only_success
echo.
echo [تم] نجح فحص ملف نشر الباك إند بدون تنفيذ نشر فعلي.
exit /b 0

:fail
echo.
echo لم يكتمل نشر الباك إند.
echo.
pause
exit /b 1
