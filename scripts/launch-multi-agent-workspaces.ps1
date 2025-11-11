# VS Code Multi-Agent Workspace Launcher

Write-Host "🚀 Launching 6 specialized development environments..." -ForegroundColor Blue

# Launch 6 VS Code windows with specific contexts
Start-Process "code" -ArgumentList "c:\Users\marco.presta\dev\eva-da-2", "--new-window", "--folder-uri", "file:///c:/Users/marco.presta/dev/eva-da-2/src/data"
Start-Sleep 2
Start-Process "code" -ArgumentList "c:\Users\marco.presta\dev\eva-da-2", "--new-window", "--folder-uri", "file:///c:/Users/marco.presta/dev/eva-da-2/src/design-system" 
Start-Sleep 2
Start-Process "code" -ArgumentList "c:\Users\marco.presta\dev\eva-da-2", "--new-window", "--folder-uri", "file:///c:/Users/marco.presta/dev/eva-da-2/src/monitoring"
Start-Sleep 2
Start-Process "code" -ArgumentList "c:\Users\marco.presta\dev\eva-da-2", "--new-window", "--folder-uri", "file:///c:/Users/marco.presta/dev/eva-da-2/src/security"
Start-Sleep 2
Start-Process "code" -ArgumentList "c:\Users\marco.presta\dev\eva-da-2", "--new-window", "--folder-uri", "file:///c:/Users/marco.presta/dev/eva-da-2/src/services"
Start-Sleep 2
Start-Process "code" -ArgumentList "c:\Users\marco.presta\dev\eva-da-2", "--new-window", "--folder-uri", "file:///c:/Users/marco.presta/dev/eva-da-2/src/configuration"

Write-Host "✅ All 6 agent workspaces launched!" -ForegroundColor Green
Write-Host "📋 Check the AGENT-*-*.md files in each window for specific instructions" -ForegroundColor Yellow
