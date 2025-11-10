# scripts/run-demo.ps1
# Starts the mock APIM and the dev server in separate PowerShell windows (Windows only)

param(
  [int]$MockPort = 7071
)

Write-Host "Starting mock APIM on port $MockPort and Vite dev server..."

$mockCommand = "npm run mock-apim"
$devCommand = "npm run dev"

Start-Process -FilePath "powershell" -ArgumentList "-NoExit","-Command",$mockCommand
Start-Process -FilePath "powershell" -ArgumentList "-NoExit","-Command",$devCommand

Write-Host "Started mock APIM and dev server in new windows. Check their consoles for output."
