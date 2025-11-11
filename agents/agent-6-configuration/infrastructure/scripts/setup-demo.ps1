# scripts/setup-demo.ps1
# Setup helper for the EVA demo on Windows (PowerShell)
# Run this after cloning the repo. It will install dependencies and show next steps.

Write-Host "Running setup for EVA demo..." -ForegroundColor Green

# Common Node.js installation paths
$nodePaths = @(
  "C:\Program Files\nodejs",
  "C:\Program Files (x86)\nodejs",
  "$env:APPDATA\npm",
  "$env:ProgramFiles\nodejs",
  "$env:LOCALAPPDATA\Programs\nodejs"
)

# Try to find Node.js
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  Write-Host "Node.js not in PATH. Searching common locations..." -ForegroundColor Yellow
  
  foreach ($path in $nodePaths) {
    if (Test-Path "$path\node.exe") {
      Write-Host "Found Node.js at: $path" -ForegroundColor Cyan
      $env:Path = "$path;$env:Path"
      $node = Get-Command node -ErrorAction SilentlyContinue
      break
    }
  }
  
  if (-not $node) {
    Write-Host "Node.js not found. Please install Node.js (v18+ recommended) from https://nodejs.org" -ForegroundColor Red
    Write-Host "After installation, restart your terminal and re-run this script." -ForegroundColor Yellow
    exit 1
  }
}

$nodeVersion = node -v
Write-Host "Found Node.js $nodeVersion" -ForegroundColor Cyan

# Check npm
$npm = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npm) {
  Write-Host "npm not in PATH. Adding Node.js directory..." -ForegroundColor Yellow
  $nodePath = Split-Path -Parent $node.Source
  $env:Path = "$nodePath;$env:Path"
  
  $npm = Get-Command npm -ErrorAction SilentlyContinue
  if (-not $npm) {
    Write-Host "Could not locate npm. Your Node.js installation may be incomplete." -ForegroundColor Red
    exit 1
  }
}

$npmVersion = npm -v
Write-Host "Found npm $npmVersion" -ForegroundColor Cyan

Write-Host "`nInstalling dependencies (this may take a minute)..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -eq 0) {
  Write-Host "`n========================================" -ForegroundColor Green
  Write-Host "Setup complete!" -ForegroundColor Green
  Write-Host "========================================`n" -ForegroundColor Green
  
  Write-Host "To run the demo, you have two options:`n" -ForegroundColor White
  Write-Host "  Option 1 (Recommended):" -ForegroundColor Yellow
  Write-Host "    .\scripts\run-demo.ps1`n" -ForegroundColor Cyan
  
  Write-Host "  Option 2 (Manual - use two separate terminals):" -ForegroundColor Yellow
  Write-Host "    Terminal 1: npm run mock-apim" -ForegroundColor Cyan
  Write-Host "    Terminal 2: npm run dev`n" -ForegroundColor Cyan
} else {
  Write-Host "`nSetup failed. Check the error messages above." -ForegroundColor Red
  exit 1
}
