@echo off
echo ========================================
echo   ProjectMaster Pro - نظام إدارة المشاريع
echo ========================================
echo.

REM التحقق من تثبيت Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js غير مثبت
    echo 🔗 يرجى تثبيت Node.js من https://nodejs.org/
    pause
    exit /b 1
)

REM التحقق من تثبيت MongoDB
net start | findstr /i "MongoDB" >nul
if %errorlevel% neq 0 (
    echo ⚠️ MongoDB غير قيد التشغيل
    echo 📝 تأكد من تشغيل MongoDB قبل البدء
    echo.
)

REM تثبيت الاعتماديات إذا لزم
if not exist "node_modules" (
    echo 📦 جاري تثبيت الاعتماديات...
    call npm install
)

REM تشغيل الخادم
echo 🚀 جاري تشغيل النظام...
echo 🌐 افتح http://localhost:3000 في المتصفح
echo.
call npm run dev

pause
