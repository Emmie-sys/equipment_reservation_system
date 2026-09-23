# Run Backend REST API Server
# Equipment Reservation System

$ErrorActionPreference = "Stop"

$currentDir = Get-Location
if (Test-Path (Join-Path $currentDir "backend\public")) {
    $BackendDir = Join-Path $currentDir "backend"
} elseif (Test-Path (Join-Path $currentDir "public\index.php")) {
    $BackendDir = $currentDir
} else {
    $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    if (Test-Path (Join-Path $ScriptDir "backend\public")) {
        $BackendDir = Join-Path $ScriptDir "backend"
    } else {
        $BackendDir = $ScriptDir
    }
}

$PublicDir = Join-Path $BackendDir "public"
Set-Location $BackendDir

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Equipment Reservation System - PHP Backend API" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Resolve PHP executable (Check PATH first, fallback to XAMPP)
$phpExec = $null
if (Get-Command php -ErrorAction SilentlyContinue) {
    $phpExec = "php"
} elseif (Test-Path "C:\xampp\php\php.exe") {
    $phpExec = "C:\xampp\php\php.exe"
} else {
    Write-Host "[ERROR] PHP executable not found on PATH or at C:\xampp\php\php.exe." -ForegroundColor Red
    Write-Host "Please install PHP 8.2+ or add PHP to your environment PATH." -ForegroundColor Yellow
    exit 1
}

Write-Host "[INFO] PHP Binary:        $phpExec" -ForegroundColor Green
Write-Host "[INFO] Document Root:     $PublicDir" -ForegroundColor Green
Write-Host "[INFO] Listening Address: http://0.0.0.0:8000" -ForegroundColor Green
Write-Host "[INFO] API Base URL:      http://localhost:8000/api/v1" -ForegroundColor Green
Write-Host "Press Ctrl+C to terminate the server." -ForegroundColor Yellow
Write-Host ""

& $phpExec -S 0.0.0.0:8000 -t $PublicDir
