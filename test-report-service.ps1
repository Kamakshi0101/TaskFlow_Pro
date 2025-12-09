# Test Report Service
# This script starts the Java service and tests all endpoints

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Testing TaskFlowPro Report Service" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Set Java 21 environment
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Check if service is already running
Write-Host "Checking if service is running..." -ForegroundColor Yellow
$serviceRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8085/api/report/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
    Write-Host "Service is already running!" -ForegroundColor Green
    Write-Host "Response: $($response.Content)`n" -ForegroundColor Green
    $serviceRunning = $true
}
catch {
    Write-Host "Service is not running. Starting it now..." -ForegroundColor Yellow
    
    # Start the service in a new window
    Write-Host "Starting Java service in a new PowerShell window..." -ForegroundColor Yellow
    $scriptPath = "D:\TaskFlowPro\start-java-service.ps1"
    Start-Process powershell -ArgumentList "-NoExit", "-File", $scriptPath
    
    Write-Host "Waiting 15 seconds for service to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
    
    # Check again
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8085/api/report/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
        Write-Host "Service started successfully!" -ForegroundColor Green
        Write-Host "Response: $($response.Content)`n" -ForegroundColor Green
        $serviceRunning = $true
    }
    catch {
        Write-Host "Failed to start service. Please check the service window for errors." -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor Red
        exit 1
    }
}

if (-not $serviceRunning) {
    Write-Host "`nCannot proceed with tests - service is not running" -ForegroundColor Red
    exit 1
}

# Test 1: Generate PDF Report
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test 1: Generate Task PDF Report" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$pdfRequestJson = @'
{
  "title": "TaskFlowPro Task Report",
  "generatedAt": "2025-12-09T10:00:00.000Z",
  "generatedBy": "Admin User",
  "filters": {
    "priority": "all",
    "status": "all",
    "startDate": "2025-11-01",
    "endDate": "2025-12-31"
  },
  "tasks": [
    {
      "title": "Complete project documentation",
      "description": "Write comprehensive documentation for the project",
      "priority": "high",
      "status": "in-progress",
      "createdAt": "2025-12-01T10:00:00.000Z",
      "dueDate": "2025-12-15T18:00:00.000Z",
      "assignees": [
        {
          "name": "John Doe",
          "email": "john@example.com",
          "progress": 75
        }
      ]
    },
    {
      "title": "Fix authentication bug",
      "description": "Resolve login issues reported by users",
      "priority": "urgent",
      "status": "pending",
      "createdAt": "2025-12-05T14:30:00.000Z",
      "dueDate": "2025-12-10T23:59:00.000Z",
      "assignees": [
        {
          "name": "Jane Smith",
          "email": "jane@example.com",
          "progress": 30
        }
      ]
    },
    {
      "title": "Update UI components",
      "description": "Modernize the user interface",
      "priority": "medium",
      "status": "completed",
      "createdAt": "2025-11-20T09:00:00.000Z",
      "dueDate": "2025-11-30T17:00:00.000Z",
      "assignees": [
        {
          "name": "Bob Wilson",
          "email": "bob@example.com",
          "progress": 100
        }
      ]
    }
  ]
}
'@

try {
    Write-Host "Sending request to generate PDF..." -ForegroundColor Yellow
    Invoke-RestMethod -Uri "http://localhost:8085/api/report/tasks/pdf" `
        -Method POST `
        -Body $pdfRequestJson `
        -ContentType "application/json" `
        -OutFile "D:\TaskFlowPro\test-output-tasks.pdf"
    
    Write-Host "PDF generated successfully!" -ForegroundColor Green
    Write-Host "  File saved to: D:\TaskFlowPro\test-output-tasks.pdf" -ForegroundColor Green
    Write-Host "  File size: $((Get-Item 'D:\TaskFlowPro\test-output-tasks.pdf').Length) bytes" -ForegroundColor Green
}
catch {
    Write-Host "Failed to generate PDF" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}

# Test 2: Generate Excel Report
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test 2: Generate Task Excel Report" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

try {
    Write-Host "Sending request to generate Excel..." -ForegroundColor Yellow
    Invoke-RestMethod -Uri "http://localhost:8085/api/report/tasks/excel" `
        -Method POST `
        -Body $pdfRequestJson `
        -ContentType "application/json" `
        -OutFile "D:\TaskFlowPro\test-output-tasks.xlsx"
    
    Write-Host "Excel generated successfully!" -ForegroundColor Green
    Write-Host "  File saved to: D:\TaskFlowPro\test-output-tasks.xlsx" -ForegroundColor Green
    Write-Host "  File size: $((Get-Item 'D:\TaskFlowPro\test-output-tasks.xlsx').Length) bytes" -ForegroundColor Green
}
catch {
    Write-Host "Failed to generate Excel" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}

# Test 3: Generate User Summary PDF
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test 3: Generate User Summary PDF" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$summaryRequestJson = @'
{
  "user": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "stats": {
    "totalAssigned": 25,
    "completed": 18,
    "inProgress": 5,
    "pending": 2
  },
  "recentTasks": [
    {
      "title": "Complete project documentation",
      "priority": "high",
      "status": "in-progress",
      "dueDate": "2025-12-15T18:00:00.000Z"
    },
    {
      "title": "Fix authentication bug",
      "priority": "urgent",
      "status": "completed",
      "dueDate": "2025-12-10T23:59:00.000Z"
    }
  ]
}
'@

try {
    Write-Host "Sending request to generate user summary PDF..." -ForegroundColor Yellow
    Invoke-RestMethod -Uri "http://localhost:8085/api/report/user-summary/pdf" `
        -Method POST `
        -Body $summaryRequestJson `
        -ContentType "application/json" `
        -OutFile "D:\TaskFlowPro\test-output-user-summary.pdf"
    
    Write-Host "User summary PDF generated successfully!" -ForegroundColor Green
    Write-Host "  File saved to: D:\TaskFlowPro\test-output-user-summary.pdf" -ForegroundColor Green
    Write-Host "  File size: $((Get-Item 'D:\TaskFlowPro\test-output-user-summary.pdf').Length) bytes" -ForegroundColor Green
}
catch {
    Write-Host "Failed to generate user summary PDF" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$pdfExists = Test-Path "D:\TaskFlowPro\test-output-tasks.pdf"
$excelExists = Test-Path "D:\TaskFlowPro\test-output-tasks.xlsx"
$summaryExists = Test-Path "D:\TaskFlowPro\test-output-user-summary.pdf"

if ($pdfExists) {
    Write-Host "Task PDF Report: SUCCESS" -ForegroundColor Green
} else {
    Write-Host "Task PDF Report: FAILED" -ForegroundColor Red
}

if ($excelExists) {
    Write-Host "Task Excel Report: SUCCESS" -ForegroundColor Green
} else {
    Write-Host "Task Excel Report: FAILED" -ForegroundColor Red
}

if ($summaryExists) {
    Write-Host "User Summary PDF: SUCCESS" -ForegroundColor Green
} else {
    Write-Host "User Summary PDF: FAILED" -ForegroundColor Red
}

if ($pdfExists -and $excelExists -and $summaryExists) {
    Write-Host "`nAll tests passed! Generated files:" -ForegroundColor Green
    Write-Host "  - test-output-tasks.pdf" -ForegroundColor Cyan
    Write-Host "  - test-output-tasks.xlsx" -ForegroundColor Cyan
    Write-Host "  - test-output-user-summary.pdf" -ForegroundColor Cyan
    Write-Host "`nYou can open these files to verify the reports." -ForegroundColor Yellow
} else {
    Write-Host "`nSome tests failed. Check the errors above." -ForegroundColor Red
}
