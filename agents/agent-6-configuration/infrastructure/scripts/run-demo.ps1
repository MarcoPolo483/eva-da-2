# scripts/run-demo.ps1
# Starts the mock APIM and the dev server in separate PowerShell windows (Windows only)

param(
  [int]$MockPort = 7071
)

Write-Host "Starting EVA DA demo..." -ForegroundColor Green

# Ensure npm is available
$npm = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npm) {
  Write-Host "npm not found. Attempting to locate Node.js..." -ForegroundColor Yellow
  $node = Get-Command node -ErrorAction SilentlyContinue
  if ($node) {
    $nodePath = Split-Path -Parent $node.Source
    $env:Path = "$nodePath;$env:Path"
  } else {
    Write-Host "Node.js not found. Please run .\scripts\setup-demo.ps1 first." -ForegroundColor Red
    exit 1
  }
}

Write-Host "Starting mock APIM on port $MockPort..." -ForegroundColor Cyan
$mockCommand = "npm run mock-apim"

Write-Host "Starting Vite dev server..." -ForegroundColor Cyan
$devCommand = "npm run dev"

Start-Process -FilePath "powershell" -ArgumentList "-NoExit","-Command",$mockCommand
Start-Sleep -Seconds 1
Start-Process -FilePath "powershell" -ArgumentList "-NoExit","-Command",$devCommand

Write-Host "`nStarted mock APIM and dev server in new windows." -ForegroundColor Green
Write-Host "Check those windows for output and any errors." -ForegroundColor White
Write-Host "The dev server URL will be shown in the Vite window (typically http://localhost:5173)" -ForegroundColor Yellow
