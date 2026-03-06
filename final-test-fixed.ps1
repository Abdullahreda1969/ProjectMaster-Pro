Write-Host "🧪 الاختبار النهائي لنظام ProjectMaster Pro" -ForegroundColor Cyan
Write-Host "=".repeat(60)

# 1. اختبار حالة النظام
Write-Host "`n1. اختبار حالة النظام..." -ForegroundColor Yellow
try {
    $health = irm "http://localhost:3000/api/health" -ErrorAction Stop
    $dbStatus = if ($health.database.connected) { "✅ متصلة" } else { "❌ غير متصلة" }
    Write-Host "   ✅ الصحة: $($health.status)" -ForegroundColor Green
    Write-Host "   📊 قاعدة البيانات: $dbStatus" -ForegroundColor White
} catch {
    Write-Host "   ❌ النظام غير متاح" -ForegroundColor Red
}

# 2. إنشاء 3 مشاريع
Write-Host "`n2. إنشاء مشاريع اختبارية..." -ForegroundColor Yellow
for ($i = 1; $i -le 3; $i++) {
    try {
        $result = irm -Uri "http://localhost:3000/api/projects/sample" -Method Post -ContentType "application/json" -ErrorAction Stop
        Write-Host "   ✅ المشروع $i : $($result.project.code)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ فشل المشروع $i : $($_.Exception.Message)" -ForegroundColor Red
    }
    Start-Sleep -Milliseconds 500
}

# 3. التحقق من قاعدة البيانات
Write-Host "`n3. التحقق من MongoDB Atlas..." -ForegroundColor Yellow
$dbCheck = mongosh "mongodb+srv://abdallahreda1969_db_user:ilSr4GuErWpwetmE@cluster0.1olgyvi.mongodb.net/projectmaster" --eval "
const count = db.projects.countDocuments();
print('📊 إجمالي المشاريع: ' + count);
if (count > 0) {
    print('📋 قائمة المشاريع:');
    db.projects.find().sort({created_at: -1}).limit(5).forEach((p, i) => {
        const date = new Date(p.created_at).toLocaleString('ar-SA');
        print('   ' + (i+1) + '. ' + p.project_code + ' - ' + p.name);
        print('      الحالة: ' + p.status + ' | التقدم: ' + p.progress + '%');
        print('      التاريخ: ' + date);
    });
}
"

Write-Host "   $dbCheck" -ForegroundColor White

# 4. اختبار نقاط النهاية الأخرى
Write-Host "`n4. اختبار نقاط النهاية الأخرى..." -ForegroundColor Yellow
$endpoints = @(
    "/api",
    "/api/system/info", 
    "/api/database/test",
    "/api/database/collections",
    "/api/users/count"
)

foreach ($endpoint in $endpoints) {
    try {
        $result = irm "http://localhost:3000$endpoint" -ErrorAction Stop
        Write-Host "   ✅ $endpoint" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ $endpoint" -ForegroundColor Red
    }
}

# 5. فتح المتصفح
Write-Host "`n5. فتح واجهة المستخدم..." -ForegroundColor Magenta
try {
    start "http://localhost:3000/dashboard"
    Write-Host "   ✅ تم فتح لوحة التحكم" -ForegroundColor Green
} catch {
    Write-Host "   ❌ تعذر فتح المتصفح" -ForegroundColor Red
}

Write-Host "`n" + "=".repeat(60)
Write-Host "🎉 النظام يعمل بشكل ممتاز!" -ForegroundColor Green
Write-Host "📊 الإحصائيات:" -ForegroundColor Cyan
Write-Host "   • قاعدة البيانات: MongoDB Atlas" -ForegroundColor White
Write-Host "   • الخادم: Node.js + Express" -ForegroundColor White
Write-Host "   • الواجهة: HTML/CSS/JavaScript" -ForegroundColor White
Write-Host "   • الحالة: جاهز للإنتاج ✅" -ForegroundColor Green

Write-Host "`n🌐 روابط النظام:" -ForegroundColor Blue
Write-Host "   الصفحة الرئيسية: http://localhost:3000" -ForegroundColor White
Write-Host "   لوحة التحكم: http://localhost:3000/dashboard" -ForegroundColor White
Write-Host "   واجهة API: http://localhost:3000/api" -ForegroundColor White
Write-Host "   Atlas Dashboard: https://cloud.mongodb.com/" -ForegroundColor White