Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Starting TaskFlowPro Application" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if MongoDB is running
Write-Host "Step 1: Checking MongoDB..." -ForegroundColor Yellow
try {
    $null = mongo --eval "db.version()" --quiet 2>&1
    Write-Host "   MongoDB is running" -ForegroundColor Green
} catch {
    Write-Host "   MongoDB is not running. Attempting to start..." -ForegroundColor Yellow
    try {
        net start MongoDB 2>&1 | Out-Null
        Start-Sleep -Seconds 3
        Write-Host "   MongoDB service started" -ForegroundColor Green
    } catch {
        Write-Host "   Could not start MongoDB automatically." -ForegroundColor Red
        Write-Host "   Please start MongoDB manually:" -ForegroundColor Yellow
        Write-Host "     - Run 'mongod' in a separate terminal, or" -ForegroundColor Yellow
        Write-Host "     - Run 'net start MongoDB' as administrator" -ForegroundColor Yellow
        Write-Host "`n   Press any key to continue anyway..." -ForegroundColor Yellow
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
}

# Start Node Backend in new window
Write-Host "`nStep 2: Starting Node.js Backend (Port 5000)..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend-node"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$backendPath`"; npm start"
Write-Host "   Waiting 10 seconds for Node backend to start..." -ForegroundColor Gray
Start-Sleep -Seconds 10

# Verify backend
Write-Host "   Verifying Node backend..." -ForegroundColor Gray
try {
    $backendCheck = Invoke-WebRequest -Uri "http://localhost:5000" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   Node backend started successfully" -ForegroundColor Green
} catch {
    Write-Host "   Warning: Node backend may still be starting" -ForegroundColor Yellow
    Write-Host "   Check the Node backend window for status" -ForegroundColor Yellow
}

# Start React Frontend in new window
Write-Host "`nStep 3: Starting React Frontend (Port 5173)..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$frontendPath`"; npm run dev"
Write-Host "   Waiting 8 seconds for React dev server to start..." -ForegroundColor Gray
Start-Sleep -Seconds 8

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TaskFlowPro Startup Complete!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Service URLs:" -ForegroundColor White
Write-Host "  Frontend:  " -NoNewline -ForegroundColor Gray
Write-Host "http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend:   " -NoNewline -ForegroundColor Gray
Write-Host "http://localhost:5000" -ForegroundColor Cyan
Write-Host "  MongoDB:   " -NoNewline -ForegroundColor Gray
Write-Host "mongodb://localhost:27017" -ForegroundColor Cyan

Write-Host "`nWhat to do next:" -ForegroundColor Yellow
Write-Host "  1. Check each service window for errors" -ForegroundColor Gray
Write-Host "  2. Wait for all services to fully start" -ForegroundColor Gray
Write-Host "  3. Browser will open automatically in 5 seconds..." -ForegroundColor Gray
Write-Host "  4. Press Ctrl+C in each window to stop services" -ForegroundColor Gray

Write-Host "`nTip: Run .\check-services.ps1 anytime to verify all services are running" -ForegroundColor Cyan

# Open browser after delay
Start-Sleep -Seconds 5
Write-Host "`nOpening browser..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host "`nAll done! Happy coding! " -NoNewline -ForegroundColor Green
Write-Host "[Press any key to close this window]" -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
