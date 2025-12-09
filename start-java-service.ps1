# Start Java Report Service with Java 21
# Run this script to start the service

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Starting Java Report Service" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Set Java 21 environment
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

Write-Host "Using Java:" -ForegroundColor Yellow
java -version
Write-Host ""

# Navigate to report-service directory
Set-Location -Path "D:\TaskFlowPro\report-service"

Write-Host "Starting Spring Boot application..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the service`n" -ForegroundColor Gray

# Run Maven Spring Boot
mvn spring-boot:run
