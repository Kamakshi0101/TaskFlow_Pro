Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TaskFlowPro - Service Status Check" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$allRunning = $true

# Check MongoDB
Write-Host "Checking services..." -ForegroundColor Gray
Write-Host ""

try {
    $null = mongo --eval "db.version()" --quiet 2>&1
    Write-Host "[" -NoNewline -ForegroundColor White
    Write-Host "" -NoNewline -ForegroundColor Green
    Write-Host "] MongoDB Database      " -NoNewline -ForegroundColor White
    Write-Host "RUNNING" -ForegroundColor Green
    Write-Host "    Port: 27017" -ForegroundColor Gray
} catch {
    Write-Host "[" -NoNewline -ForegroundColor White
    Write-Host "" -NoNewline -ForegroundColor Red
    Write-Host "] MongoDB Database      " -NoNewline -ForegroundColor White
    Write-Host "STOPPED" -ForegroundColor Red
    Write-Host "    Start with: mongod or net start MongoDB" -ForegroundColor Yellow
    $allRunning = $false
}

# Check Java Service
Write-Host ""
try {
    $java = Invoke-WebRequest -Uri "http://localhost:8085/api/report/health" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "[" -NoNewline -ForegroundColor White
    Write-Host "" -NoNewline -ForegroundColor Green
    Write-Host "] Java Report Service   " -NoNewline -ForegroundColor White
    Write-Host "RUNNING" -ForegroundColor Green
    Write-Host "    Port: 8085 | URL: http://localhost:8085" -ForegroundColor Gray
    $response = $java.Content
    Write-Host "    Response: $response" -ForegroundColor Gray
} catch {
    Write-Host "[" -NoNewline -ForegroundColor White
    Write-Host "" -NoNewline -ForegroundColor Red
    Write-Host "] Java Report Service   " -NoNewline -ForegroundColor White
    Write-Host "STOPPED" -ForegroundColor Red
    Write-Host "    Start with: .\start-java-service.ps1" -ForegroundColor Yellow
    $allRunning = $false
}

# Check Node Backend
Write-Host ""
try {
    $node = Invoke-WebRequest -Uri "http://localhost:5000" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "[" -NoNewline -ForegroundColor White
    Write-Host "" -NoNewline -ForegroundColor Green
    Write-Host "] Node.js Backend       " -NoNewline -ForegroundColor White
    Write-Host "RUNNING" -ForegroundColor Green
    Write-Host "    Port: 5000 | URL: http://localhost:5000" -ForegroundColor Gray
} catch {
    Write-Host "[" -NoNewline -ForegroundColor White
    Write-Host "" -NoNewline -ForegroundColor Red
    Write-Host "] Node.js Backend       " -NoNewline -ForegroundColor White
    Write-Host "STOPPED" -ForegroundColor Red
    Write-Host "    Start with: cd backend-node; npm start" -ForegroundColor Yellow
    $allRunning = $false
}

# Check React Frontend
Write-Host ""
try {
    $react = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "[" -NoNewline -ForegroundColor White
    Write-Host "" -NoNewline -ForegroundColor Green
    Write-Host "] React Frontend        " -NoNewline -ForegroundColor White
    Write-Host "RUNNING" -ForegroundColor Green
    Write-Host "    Port: 5173 | URL: http://localhost:5173" -ForegroundColor Gray
} catch {
    Write-Host "[" -NoNewline -ForegroundColor White
    Write-Host "" -NoNewline -ForegroundColor Red
    Write-Host "] React Frontend        " -NoNewline -ForegroundColor White
    Write-Host "STOPPED" -ForegroundColor Red
    Write-Host "    Start with: cd frontend; npm run dev" -ForegroundColor Yellow
    $allRunning = $false
}

Write-Host "`n========================================" -ForegroundColor Cyan

if ($allRunning) {
    Write-Host "Status: " -NoNewline -ForegroundColor White
    Write-Host "All Services Running!" -ForegroundColor Green
    Write-Host "`nYou can access the application at:" -ForegroundColor White
    Write-Host "  http://localhost:5173" -ForegroundColor Cyan
} else {
    Write-Host "Status: " -NoNewline -ForegroundColor White
    Write-Host "Some Services Not Running" -ForegroundColor Red
    Write-Host "`nTo start all services, run:" -ForegroundColor White
    Write-Host "  .\start-all-services.ps1" -ForegroundColor Cyan
}

Write-Host "========================================`n" -ForegroundColor Cyan

# Show running processes
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
$javaProcesses = Get-Process java -ErrorAction SilentlyContinue

if ($nodeProcesses -or $javaProcesses) {
    Write-Host "Active Processes:" -ForegroundColor Gray
    
    if ($nodeProcesses) {
        Write-Host "  Node.js: $($nodeProcesses.Count) process(es)" -ForegroundColor Gray
    }
    
    if ($javaProcesses) {
        Write-Host "  Java:    $($javaProcesses.Count) process(es)" -ForegroundColor Gray
    }
    
    Write-Host ""
}
