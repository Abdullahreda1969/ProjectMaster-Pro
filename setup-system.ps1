# ============================================
# ProjectMaster Pro - الإصدار المبسط للبدء
# ============================================

Write-Host "🚀 بدء إنشاء نظام إدارة المشاريع..." -ForegroundColor Cyan

# 1. إنشاء المجلدات الأساسية
Write-Host "`n📁 إنشاء هيكل المجلدات..." -ForegroundColor Yellow

$folders = @(
    "backend",
    "frontend",
    "database",
    "docs",
    "config",
    "uploads",
    "logs"
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Path $folder -Force | Out-Null
    Write-Host "  ✓ $folder" -ForegroundColor Green
}

# 2. إنشاء ملف package.json مبسط
Write-Host "`n📦 إنشاء ملف الاعتماديات..." -ForegroundColor Yellow

$packageJson = @{
    name = "projectmaster-pro"
    version = "1.0.0"
    description = "نظام إدارة مشاريع متكامل"
    main = "backend/server.js"
    scripts = @{
        start = "node backend/server.js"
        dev = "nodemon backend/server.js"
        test = "jest"
    }
    dependencies = @{
        express = "^4.18.0"
        mongoose = "^7.0.0"
        dotenv = "^16.0.0"
        cors = "^2.8.5"
    }
    devDependencies = @{
        nodemon = "^2.0.0"
    }
}

$packageJson | ConvertTo-Json | Out-File "package.json" -Encoding UTF8
Write-Host "  ✓ package.json" -ForegroundColor Green

# 3. إنشاء ملف .env
Write-Host "`n🔧 إنشاء ملف الإعدادات..." -ForegroundColor Yellow

$envContent = @"
# إعدادات النظام
PORT=3000
NODE_ENV=development

# قاعدة البيانات
DB_URI=mongodb://localhost:27017/projectmaster

# الأمان
JWT_SECRET=your_jwt_secret_here
"@

$envContent | Out-File ".env" -Encoding UTF8
Write-Host "  ✓ .env" -ForegroundColor Green

# 4. إنشاء ملف الخادم الأساسي
Write-Host "`n⚡ إنشاء خادم Express..." -ForegroundColor Yellow

$serverCode = @"
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({ 
        message: '🚀 ProjectMaster Pro API',
        version: '1.0.0',
        status: 'running'
    });
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// Connect to database
mongoose.connect(process.env.DB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(\`🚀 Server running on port \${PORT}\`);
        });
    })
    .catch(err => {
        console.error('❌ Database connection error:', err);
    });

module.exports = app;
"@

New-Item -ItemType Directory -Path "backend" -Force | Out-Null
$serverCode | Out-File "backend\server.js" -Encoding UTF8
Write-Host "  ✓ backend/server.js" -ForegroundColor Green

# 5. إنشاء صفحة HTML بسيطة
Write-Host "`n🌐 إنشاء واجهة المستخدم..." -ForegroundColor Yellow

$htmlContent = @"
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ProjectMaster Pro</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .container {
            text-align: center;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 800px;
            width: 90%;
        }
        
        .logo {
            font-size: 60px;
            margin-bottom: 20px;
            color: #fff;
        }
        
        h1 {
            font-size: 48px;
            margin-bottom: 10px;
            background: linear-gradient(45deg, #fff, #f0f0f0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .tagline {
            font-size: 20px;
            opacity: 0.9;
            margin-bottom: 30px;
        }
        
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 40px 0;
        }
        
        .feature {
            background: rgba(255, 255, 255, 0.15);
            padding: 20px;
            border-radius: 10px;
            transition: transform 0.3s;
        }
        
        .feature:hover {
            transform: translateY(-5px);
        }
        
        .feature i {
            font-size: 30px;
            margin-bottom: 10px;
        }
        
        .status {
            margin: 30px 0;
            padding: 15px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
        }
        
        .btn {
            display: inline-block;
            padding: 15px 40px;
            background: white;
            color: #667eea;
            text-decoration: none;
            border-radius: 50px;
            font-weight: bold;
            font-size: 18px;
            transition: all 0.3s;
            margin: 10px;
        }
        
        .btn:hover {
            transform: scale(1.05);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        
        .stats {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 30px;
            flex-wrap: wrap;
        }
        
        .stat {
            background: rgba(255, 255, 255, 0.1);
            padding: 15px 30px;
            border-radius: 10px;
            min-width: 150px;
        }
        
        .stat-number {
            font-size: 32px;
            font-weight: bold;
            display: block;
        }
        
        .stat-label {
            font-size: 14px;
            opacity: 0.8;
        }
    </style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="container">
        <div class="logo">
            <i class="fas fa-project-diagram"></i>
        </div>
        
        <h1>ProjectMaster Pro</h1>
        <p class="tagline">نظام إدارة المشاريع الاحترافي المتكامل</p>
        
        <div class="status" id="api-status">
            <i class="fas fa-spinner fa-spin"></i>
            جاري التحقق من حالة النظام...
        </div>
        
        <div class="features">
            <div class="feature">
                <i class="fas fa-tasks"></i>
                <h3>إدارة المهام</h3>
                <p>تنظيم ومتابعة المهام بسهولة</p>
            </div>
            <div class="feature">
                <i class="fas fa-users"></i>
                <h3>إدارة الفريق</h3>
                <p>توزيع المهام ومتابعة الأداء</p>
            </div>
            <div class="feature">
                <i class="fas fa-chart-line"></i>
                <h3>التقارير</h3>
                <p>تحليلات وإحصائيات مفصلة</p>
            </div>
            <div class="feature">
                <i class="fas fa-dollar-sign"></i>
                <h3>المالية</h3>
                <p>إدارة الميزانية والفواتير</p>
            </div>
        </div>
        
        <a href="/dashboard" class="btn">
            <i class="fas fa-rocket"></i> ابدأ الآن
        </a>
        
        <a href="/docs" class="btn" style="background: transparent; border: 2px solid white;">
            <i class="fas fa-book"></i> التوثيق
        </a>
        
        <div class="stats">
            <div class="stat">
                <span class="stat-number" id="projects-count">0</span>
                <span class="stat-label">مشروع</span>
            </div>
            <div class="stat">
                <span class="stat-number" id="tasks-count">0</span>
                <span class="stat-label">مهمة</span>
            </div>
            <div class="stat">
                <span class="stat-number" id="users-count">0</span>
                <span class="stat-label">مستخدم</span>
            </div>
        </div>
    </div>
    
    <script>
        // التحقق من حالة API
        async function checkApiStatus() {
            try {
                const response = await fetch('/health');
                if (response.ok) {
                    document.getElementById('api-status').innerHTML = 
                        '<i class="fas fa-check-circle"></i> النظام يعمل بشكل طبيعي';
                    document.getElementById('api-status').style.background = 'rgba(46, 204, 113, 0.2)';
                }
            } catch (error) {
                document.getElementById('api-status').innerHTML = 
                    '<i class="fas fa-exclamation-triangle"></i> الخادم غير متوفر';
                document.getElementById('api-status').style.background = 'rgba(231, 76, 60, 0.2)';
            }
        }
        
        // تحديث الإحصائيات
        function updateStats() {
            document.getElementById('projects-count').textContent = '12';
            document.getElementById('tasks-count').textContent = '156';
            document.getElementById('users-count').textContent = '8';
        }
        
        // التهيئة
        document.addEventListener('DOMContentLoaded', () => {
            checkApiStatus();
            updateStats();
            
            // تحديث تلقائي كل 30 ثانية
            setInterval(checkApiStatus, 30000);
        });
    </script>
</body>
</html>
"@

New-Item -ItemType Directory -Path "frontend" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend\public" -Force | Out-Null
$htmlContent | Out-File "frontend\public\index.html" -Encoding UTF8
Write-Host "  ✓ frontend/public/index.html" -ForegroundColor Green

# 6. إنشاء ملف README
Write-Host "`n📄 إنشاء ملف التوثيق..." -ForegroundColor Yellow

$readmeContent = @"
# ProjectMaster Pro

نظام إدارة المشاريع الاحترافي المتكامل

## 🚀 البدء السريع

### التثبيت
\`\`\`bash
# تثبيت الاعتماديات
npm install

# تشغيل الخادم
npm run dev
\`\`\`

### الوصول
- الواجهة الأمامية: http://localhost:3000
- واجهة API: http://localhost:3000/api
- حالة النظام: http://localhost:3000/health

## 📁 هيكل المشروع
\`\`\`
ProjectMaster-Pro/
├── backend/          # خادم Node.js
├── frontend/         # واجهة المستخدم
├── database/         # ملفات قاعدة البيانات
├── docs/            # التوثيق
├── config/          # الإعدادات
├── uploads/         # الملفات المرفوعة
└── logs/           # سجلات النظام
\`\`\`

## 🔧 المتطلبات
- Node.js 16.x أو أعلى
- MongoDB 6.x أو أعلى
- npm أو yarn

## 👥 فريق التطوير
- **مدير المشروع:** [اسمك]
- **المطورون:** [فريقك]
- **التصميم:** [مصممك]

## 📞 الدعم
للأسئلة والدعم، راجع ملف docs/SUPPORT.md

## 📄 الرخصة
مرخصة للاستخدام الداخلي
"@

$readmeContent | Out-File "README.md" -Encoding UTF8
Write-Host "  ✓ README.md" -ForegroundColor Green

# 7. تثبيت الاعتماديات
Write-Host "`n📦 تثبيت Node.js packages..." -ForegroundColor Yellow

if (Get-Command npm -ErrorAction SilentlyContinue) {
    npm install
    Write-Host "  ✓ تم تثبيت الاعتماديات" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ npm غير مثبت. قم بتثبيت Node.js أولاً" -ForegroundColor Red
    Write-Host "  🔗 https://nodejs.org/" -ForegroundColor Cyan
}

# 8. إنشاء ملف تشغيل
Write-Host "`n⚙️ إنشاء ملف تشغيل Windows..." -ForegroundColor Yellow

$batchContent = @"
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
"@

$batchContent | Out-File "start.bat" -Encoding UTF8
Write-Host "  ✓ start.bat" -ForegroundColor Green

Write-Host "`n" + ("="*50) -ForegroundColor Green
Write-Host "   ✅ تم إنشاء النظام بنجاح!" -ForegroundColor Green
Write-Host ("="*50) -ForegroundColor Green

Write-Host "`n🎯 الخطوات التالية:" -ForegroundColor Cyan
Write-Host "1. قم بتثبيت Node.js إذا لم يكن مثبتاً" -ForegroundColor White
Write-Host "2. قم بتثبيت وتشغيل MongoDB" -ForegroundColor White
Write-Host "3. شغل ملف start.bat لتشغيل النظام" -ForegroundColor White
Write-Host "4. افتح http://localhost:3000 في المتصفح" -ForegroundColor White

Write-Host "`n🔗 روابط مهمة:" -ForegroundColor Yellow
Write-Host "📥 Node.js: https://nodejs.org/" -ForegroundColor Cyan
Write-Host "📥 MongoDB: https://www.mongodb.com/try/download/community" -ForegroundColor Cyan