# Test Script for Java Report Service
# Run this after starting the Java service to verify it's working

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Java Report Service" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8085/api/report/health" -Method GET -UseBasicParsing
    Write-Host "✓ Service is running!" -ForegroundColor Green
    Write-Host "  Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Service is not responding" -ForegroundColor Red
    Write-Host "  Make sure the Java service is running on port 8085" -ForegroundColor Gray
    exit 1
}
Write-Host ""

# Test 2: PDF Generation
Write-Host "Test 2: PDF Generation" -ForegroundColor Yellow

$testData = @{
    title = "Test Report"
    generatedAt = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
    generatedBy = "Test Script"
    filters = $null
    tasks = @(
        @{
            title = "Sample Task 1"
            description = "This is a test task"
            priority = "high"
            status = "in-progress"
            createdAt = "2025-12-01T10:00:00Z"
            dueDate = "2025-12-15T23:59:59Z"
            assignees = @(
                @{
                    name = "Test User"
                    email = "test@example.com"
                    status = "in-progress"
                    progress = 50
                }
            )
        },
        @{
            title = "Sample Task 2"
            description = "Another test task"
            priority = "medium"
            status = "pending"
            createdAt = "2025-12-03T10:00:00Z"
            dueDate = "2025-12-20T23:59:59Z"
            assignees = @(
                @{
                    name = "Test User 2"
                    email = "test2@example.com"
                    status = "pending"
                    progress = 0
                }
            )
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:8085/api/report/tasks/pdf" `
        -Method POST `
        -ContentType "application/json" `
        -Body $testData `
        -UseBasicParsing

    $outputFile = "test-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').pdf"
    [System.IO.File]::WriteAllBytes($outputFile, $response.Content)
    
    Write-Host "✓ PDF generated successfully!" -ForegroundColor Green
    Write-Host "  File saved: $outputFile" -ForegroundColor Gray
    Write-Host "  File size: $([math]::Round($response.Content.Length / 1KB, 2)) KB" -ForegroundColor Gray
} catch {
    Write-Host "✗ PDF generation failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# Test 3: Excel Generation
Write-Host "Test 3: Excel Generation" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:8085/api/report/tasks/excel" `
        -Method POST `
        -ContentType "application/json" `
        -Body $testData `
        -UseBasicParsing

    $outputFile = "test-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').xlsx"
    [System.IO.File]::WriteAllBytes($outputFile, $response.Content)
    
    Write-Host "✓ Excel generated successfully!" -ForegroundColor Green
    Write-Host "  File saved: $outputFile" -ForegroundColor Gray
    Write-Host "  File size: $([math]::Round($response.Content.Length / 1KB, 2)) KB" -ForegroundColor Gray
} catch {
    Write-Host "✗ Excel generation failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# Test 4: User Summary PDF
Write-Host "Test 4: User Summary PDF" -ForegroundColor Yellow

$userSummaryData = @{
    generatedAt = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
    user = @{
        name = "John Doe"
        email = "john@example.com"
    }
    stats = @{
        assigned = 15
        completed = 10
        pending = 3
        inProgress = 2
    }
    recentTasks = @(
        @{
            title = "Task 1"
            description = "Description 1"
            priority = "high"
            status = "completed"
            createdAt = "2025-12-01"
            dueDate = "2025-12-05"
            assignees = @(
                @{
                    name = "John Doe"
                    email = "john@example.com"
                    status = "completed"
                    progress = 100
                }
            )
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:8085/api/report/user-summary/pdf" `
        -Method POST `
        -ContentType "application/json" `
        -Body $userSummaryData `
        -UseBasicParsing

    $outputFile = "user-summary-$(Get-Date -Format 'yyyyMMdd-HHmmss').pdf"
    [System.IO.File]::WriteAllBytes($outputFile, $response.Content)
    
    Write-Host "✓ User summary PDF generated successfully!" -ForegroundColor Green
    Write-Host "  File saved: $outputFile" -ForegroundColor Gray
    Write-Host "  File size: $([math]::Round($response.Content.Length / 1KB, 2)) KB" -ForegroundColor Gray
} catch {
    Write-Host "✗ User summary PDF generation failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All tests completed!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Check the generated PDF/Excel files" -ForegroundColor Gray
Write-Host "2. Verify the reports look correct" -ForegroundColor Gray
Write-Host "3. Test integration with Node backend" -ForegroundColor Gray
Write-Host ""
