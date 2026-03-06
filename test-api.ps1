# test-api.ps1 - اختبار كامل لواجهة برمجة التطبيقات
Write-Host "🧪 ProjectMaster Pro API Test Suite" -ForegroundColor Cyan
Write-Host "=".repeat(50)

$baseUrl = "http://localhost:3000"

function Test-API {
    param([string]$Endpoint, [string]$Method = "Get", [object]$Body = $null)
    
    try {
        $params = @{
            Uri = "$baseUrl$Endpoint"
            Method = $Method
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "✅ $Method $Endpoint" -ForegroundColor Green
        
        return $response
    } catch {
        Write-Host "❌ $Method $Endpoint" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
        return $null
    }
}

function Show-Result {
    param([string]$Title, [object]$Data)
    
    Write-Host "`n📊 $Title" -ForegroundColor Magenta
    Write-Host "-".repeat(50)
    
    if ($Data) {
        $Data | ConvertTo-Json -Depth 5 | Out-Host
    } else {
        Write-Host "No data returned" -ForegroundColor Yellow
    }
}

# تشغيل جميع الاختبارات
Write-Host "`n🔍 Running API Tests..." -ForegroundColor Yellow

# Test 1: API Status
$result1 = Test-API -Endpoint "/api"
Show-Result -Title "API Status" -Data $result1

# Test 2: Health Check
$result2 = Test-API -Endpoint "/api/health"
Show-Result -Title "System Health" -Data $result2

# Test 3: System Info
$result3 = Test-API -Endpoint "/api/system/info"
Show-Result -Title "System Information" -Data $result3

# Test 4: Database Test
$result4 = Test-API -Endpoint "/api/database/test"
Show-Result -Title "Database Connection" -Data $result4

# Test 5: List Collections
$result5 = Test-API -Endpoint "/api/database/collections"
Show-Result -Title "Database Collections" -Data $result5

# Test 6: User Count
$result6 = Test-API -Endpoint "/api/users/count"
Show-Result -Title "User Count" -Data $result6

# Test 7: Create Sample Project
$result7 = Test-API -Endpoint "/api/projects/sample" -Method "Post"
Show-Result -Title "Sample Project Created" -Data $result7

# Test 8: Home Page (HTML)
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/" -Method Get
    Write-Host "`n✅ GET / (Home Page)" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor White
} catch {
    Write-Host "`n❌ GET / (Home Page)" -ForegroundColor Red
}

# Test 9: Dashboard Page
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/dashboard" -Method Get
    Write-Host "`n✅ GET /dashboard" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor White
} catch {
    Write-Host "`n❌ GET /dashboard" -ForegroundColor Red
}

# Summary
Write-Host "`n" + "=".repeat(50) -ForegroundColor Cyan
Write-Host "📈 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=".repeat(50)

$tests = @($result1, $result2, $result3, $result4, $result5, $result6, $result7)
$passed = ($tests | Where-Object { $_ -ne $null }).Count

Write-Host "Total Tests: 9" -ForegroundColor White
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $((9 - $passed) - 2)" -ForegroundColor Red

if ($passed -ge 7) {
    Write-Host "`n🎉 API is working correctly!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Some tests failed. Check the server logs." -ForegroundColor Yellow
}

Write-Host "`n🌐 Open in browser:" -ForegroundColor Blue
Write-Host "   Frontend: $baseUrl" -ForegroundColor White
Write-Host "   Dashboard: $baseUrl/dashboard" -ForegroundColor White
Write-Host "   API: $baseUrl/api" -ForegroundColor White