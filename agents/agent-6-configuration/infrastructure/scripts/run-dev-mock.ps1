# Run the mock APIM server in the background and start the Vite dev server.
# Usage (PowerShell):
#   .\scripts\run-dev-mock.ps1

param(
  [int]$Port = 5178
)

# Check for required tools
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Error "Node.js is not installed or not in PATH. Please install Node.js from https://nodejs.org/"
    exit 1
}

$npm = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npm) {
    Write-Error "npm is not installed or not in PATH. Please install Node.js (which includes npm) from https://nodejs.org/"
    exit 1
}

# Get absolute paths
$scriptPath = $PSScriptRoot
$projectRoot = Split-Path $scriptPath -Parent
$mockServerPath = Join-Path $projectRoot "scripts\mock-apim.cjs"

Write-Host "Starting mock APIM on port $Port..."

$env:MOCK_APIM_PORT = $Port

# Start mock APIM in a new visible window so we can see any errors
$mock = Start-Process -FilePath $node.Source -ArgumentList $mockServerPath -WindowStyle Normal -PassThru
Write-Host "Mock APIM started (pid=$($mock.Id)). Logs will be written to: ./scripts/mock-apim.log"
Write-Host "Waiting a moment to ensure server starts..."
Start-Sleep -Seconds 2

Write-Host "Starting Vite dev server (VITE_APIM_BASE_URL=http://localhost:$Port)..."
$env:VITE_APIM_BASE_URL = "http://localhost:$Port"

# Change to project root and run npm
Set-Location $projectRoot
& $npm.Source run dev

Write-Host "Dev server exited. You may stop the mock APIM process manually (pid=$($mock.Id))."
