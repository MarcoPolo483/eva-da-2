# scripts/setup-demo.ps1
# Setup helper for the EVA demo on Windows (PowerShell)
# Run this after cloning the repo. It will install dependencies and show next steps.

Write-Host "Running setup for EVA demo..."

# Ensure Node is available
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  Write-Host "Node.js not found in PATH. Please install Node.js (v18+ recommended) and re-run this script." -ForegroundColor Yellow
  exit 1
}

Write-Host "Installing npm dependencies..."
npm ci

Write-Host "Setup complete. To run the demo locally, open two terminals and run:`n1) npm run mock-apim` (starts local mock APIM)
2) npm run dev (starts the Vite dev server)"

Write-Host "If you want this script to start both processes for you, run scripts/run-demo.ps1 instead."
