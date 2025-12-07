# Authentication API Testing Script
# Run this in PowerShell to test the authentication endpoints

$baseUrl = "http://localhost:5000"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Testing Task Manager Authentication API" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "[TEST 1] Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✅ Server is healthy" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Test 2: Register Regular User
Write-Host "`n[TEST 2] Register Regular User..." -ForegroundColor Yellow
$registerUser = @{
    name = "John Doe"
    email = "john@example.com"
    password = "Test123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/register" `
        -Method POST `
        -Headers $headers `
        -Body $registerUser `
        -SessionVariable session
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ User registered successfully" -ForegroundColor Green
    Write-Host "User ID: $($data.data.user._id)" -ForegroundColor Cyan
    Write-Host "User Role: $($data.data.user.role)" -ForegroundColor Cyan
    
    # Save token for later tests
    $userToken = $data.data.token
    
} catch {
    Write-Host "❌ Registration failed: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Test 3: Register Admin User (with invite code)
Write-Host "`n[TEST 3] Register Admin User..." -ForegroundColor Yellow
$registerAdmin = @{
    name = "Admin User"
    email = "admin@example.com"
    password = "Admin123"
    role = "admin"
    inviteCode = "admin123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/register" `
        -Method POST `
        -Headers $headers `
        -Body $registerAdmin `
        -SessionVariable adminSession
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Admin registered successfully" -ForegroundColor Green
    Write-Host "Admin ID: $($data.data.user._id)" -ForegroundColor Cyan
    Write-Host "Admin Role: $($data.data.user.role)" -ForegroundColor Cyan
    
    # Save admin token
    $adminToken = $data.data.token
    
} catch {
    Write-Host "❌ Admin registration failed: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Test 4: Login
Write-Host "`n[TEST 4] Login User..." -ForegroundColor Yellow
$loginData = @{
    email = "john@example.com"
    password = "Test123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" `
        -Method POST `
        -Headers $headers `
        -Body $loginData `
        -SessionVariable loginSession
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "Token received: $($data.data.token.Substring(0,20))..." -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Test 5: Get Current User (Protected Route)
Write-Host "`n[TEST 5] Get Current User Profile..." -ForegroundColor Yellow
try {
    $authHeaders = @{
        "Content-Type" = "application/json"
        "Cookie" = "token=$userToken"
    }
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" `
        -Method GET `
        -Headers $authHeaders
    
    Write-Host "✅ Profile fetched successfully" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 3)
    
} catch {
    Write-Host "❌ Get profile failed: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Test 6: Update Profile
Write-Host "`n[TEST 6] Update User Profile..." -ForegroundColor Yellow
$updateData = @{
    name = "John Updated"
    title = "Software Developer"
} | ConvertTo-Json

try {
    $authHeaders = @{
        "Content-Type" = "application/json"
        "Cookie" = "token=$userToken"
    }
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/profile" `
        -Method PUT `
        -Headers $authHeaders `
        -Body $updateData
    
    Write-Host "✅ Profile updated successfully" -ForegroundColor Green
    Write-Host "New Name: $($response.data.user.name)" -ForegroundColor Cyan
    Write-Host "New Title: $($response.data.user.title)" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Profile update failed: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Test 7: Admin - Get All Users
Write-Host "`n[TEST 7] Admin: Get All Users..." -ForegroundColor Yellow
try {
    $adminHeaders = @{
        "Content-Type" = "application/json"
        "Cookie" = "token=$adminToken"
    }
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/users" `
        -Method GET `
        -Headers $adminHeaders
    
    Write-Host "✅ Users fetched successfully" -ForegroundColor Green
    Write-Host "Total Users: $($response.data.count)" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Get users failed: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Test 8: Unauthorized Access (No token)
Write-Host "`n[TEST 8] Test Unauthorized Access..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method GET
    Write-Host "❌ Should have failed but didn't!" -ForegroundColor Red
} catch {
    Write-Host "✅ Correctly blocked unauthorized access" -ForegroundColor Green
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
