@echo off
setlocal EnableExtensions DisableDelayedExpansion
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo =======================================================
echo           حفظ الكود على GitHub
echo =======================================================
echo.
echo ملاحظة: هذا الملف يحفظ الكود ويشغّل الفحوصات على GitHub فقط.
echo نشر الموقع يتم من الملف: 1-نشر-التطبيق-كاملا.bat
echo.

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo [خطأ] هذا المجلد ليس مستودع Git.
    goto fail
)

for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD') do set "CURRENT_BRANCH=%%b"
echo الفرع الحالي: %CURRENT_BRANCH%
echo.
git status --short

if /I "%~1"=="--check" (
    echo.
    echo [تم] نجح فحص ملف حفظ الكود بدون إنشاء commit أو رفع أي شيء.
    exit /b 0
)

echo.
set /p "MESSAGE=اكتب وصف التعديلات، أو اضغط Enter لاستخدام الوصف الافتراضي: "
if not defined MESSAGE set "MESSAGE=Update app"

echo.
echo [1/4] تجهيز التعديلات للحفظ...
git add -A
if errorlevel 1 goto fail

git diff --cached --quiet
if not errorlevel 1 (
    echo.
    echo [تم] لا توجد تعديلات جديدة تحتاج إلى الحفظ.
    goto success_no_changes
)

echo.
echo [2/4] إنشاء نسخة محفوظة من التعديلات...
git commit -m "%MESSAGE%"
if errorlevel 1 goto fail

echo.
echo [3/4] مزامنة التعديلات مع الفرع الرئيسي...
git -c rebase.autoStash=true pull --rebase origin main
if errorlevel 1 (
    echo.
    echo [خطأ] تعذر دمج التعديلات القادمة من GitHub تلقائيًا.
    echo أصلح التعارض ثم استخدم: git rebase --continue
    echo أو ألغِ العملية باستخدام: git rebase --abort
    goto fail
)

echo.
echo [4/4] رفع النسخة المحفوظة إلى GitHub...
git push origin HEAD:main
if errorlevel 1 goto fail

echo.
echo =======================================================
echo       [تم] تم حفظ الكود على GitHub بنجاح.
echo =======================================================
echo.
echo يمكن متابعة الفحوصات من:
echo https://github.com/drhypermed/clinic/actions
echo.
pause
exit /b 0

:success_no_changes
echo.
pause
exit /b 0

:fail
echo.
echo [خطأ] لم يكتمل حفظ الكود على GitHub. راجع الرسالة الموجودة بالأعلى.
echo.
pause
exit /b 1
