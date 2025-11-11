# EVA DA 2.0 - Azure Functions Deployment Script
# Deploys the API Integration Function App with enterprise-grade configuration

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('dev', 'staging', 'prod')]
    [string]$Environment,
    
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroup = "rg-eva-da-2-$Environment",
    
    [Parameter(Mandatory=$false)]
    [string]$FunctionAppName = "eva-da-2-functions-$Environment",
    
    [Parameter(Mandatory=$false)]
    [string]$StorageAccount = "stgeva2func$Environment",
    
    [Parameter(Mandatory=$false)]
    [string]$SubscriptionId = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$DeployInfrastructure = $false
)

# Script configuration
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

Write-Host "🚀 Starting EVA DA 2.0 API Function Deployment" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Function App: $FunctionAppName" -ForegroundColor Yellow

# Check prerequisites
function Test-Prerequisites {
    Write-Host "🔍 Checking prerequisites..." -ForegroundColor Blue
    
    # Check Azure CLI
    if (!(Get-Command "az" -ErrorAction SilentlyContinue)) {
        throw "Azure CLI is required but not installed. Please install from https://aka.ms/installazurecli"
    }
    
    # Check Azure Functions Core Tools
    if (!(Get-Command "func" -ErrorAction SilentlyContinue)) {
        throw "Azure Functions Core Tools is required. Install with: npm install -g azure-functions-core-tools@4 --unsafe-perm true"
    }
    
    # Check Node.js
    if (!(Get-Command "node" -ErrorAction SilentlyContinue)) {
        throw "Node.js is required but not installed."
    }
    
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
    
    # Check npm
    if (!(Get-Command "npm" -ErrorAction SilentlyContinue)) {
        throw "npm is required but not installed."
    }
    
    Write-Host "✅ Prerequisites check passed" -ForegroundColor Green
}

# Build the Function App
function Build-FunctionApp {
    if ($SkipBuild) {
        Write-Host "⏭️ Skipping build as requested" -ForegroundColor Yellow
        return
    }
    
    Write-Host "🔨 Building Function App..." -ForegroundColor Blue
    
    # Navigate to functions directory
    $functionsPath = Join-Path $PSScriptRoot "functions"
    if (!(Test-Path $functionsPath)) {
        throw "Functions directory not found at: $functionsPath"
    }
    
    Push-Location $functionsPath
    try {
        # Clean previous builds
        if (Test-Path "dist") {
            Remove-Item "dist" -Recurse -Force
        }
        
        # Install dependencies
        Write-Host "📦 Installing npm packages..." -ForegroundColor Yellow
        npm ci
        
        # Build TypeScript
        Write-Host "🏗️ Compiling TypeScript..." -ForegroundColor Yellow
        npm run build
        
        # Run tests (if available)
        if (Test-Path "package.json") {
            $packageJson = Get-Content "package.json" | ConvertFrom-Json
            if ($packageJson.scripts.test) {
                Write-Host "🧪 Running tests..." -ForegroundColor Yellow
                npm test
            }
        }
        
        Write-Host "✅ Build completed successfully" -ForegroundColor Green
    }
    finally {
        Pop-Location
    }
}

# Deploy infrastructure (optional)
function Deploy-Infrastructure {
    if (!$DeployInfrastructure) {
        Write-Host "⏭️ Skipping infrastructure deployment" -ForegroundColor Yellow
        return
    }
    
    Write-Host "🏗️ Deploying infrastructure..." -ForegroundColor Blue
    
    # Check if Bicep template exists
    $bicepPath = Join-Path $PSScriptRoot "infrastructure" "functions.bicep"
    if (!(Test-Path $bicepPath)) {
        Write-Warning "Bicep template not found at: $bicepPath. Skipping infrastructure deployment."
        return
    }
    
    # Deploy using Azure CLI
    $deploymentName = "eva-da-2-functions-$Environment-$(Get-Date -Format 'yyyyMMddHHmm')"
    
    az deployment group create `
        --resource-group $ResourceGroup `
        --template-file $bicepPath `
        --parameters environment=$Environment functionAppName=$FunctionAppName storageAccountName=$StorageAccount `
        --name $deploymentName `
        --verbose
    
    if ($LASTEXITCODE -ne 0) {
        throw "Infrastructure deployment failed"
    }
    
    Write-Host "✅ Infrastructure deployed successfully" -ForegroundColor Green
}

# Configure Function App settings
function Set-FunctionAppConfiguration {
    Write-Host "⚙️ Configuring Function App settings..." -ForegroundColor Blue
    
    # Define environment-specific settings
    $appSettings = @{
        "FUNCTIONS_WORKER_RUNTIME" = "node"
        "FUNCTIONS_EXTENSION_VERSION" = "~4"
        "WEBSITE_NODE_DEFAULT_VERSION" = "~18"
        "NODE_ENV" = $Environment
        "ENABLE_DIAGNOSTICS" = "true"
        "ENABLE_PERFORMANCE_MONITORING" = "true"
        "LOG_LEVEL" = if ($Environment -eq 'prod') { "info" } else { "debug" }
        "CORS_ALLOWED_ORIGINS" = switch ($Environment) {
            'dev' { "http://localhost:3000,http://localhost:3001" }
            'staging' { "https://eva-da-2-staging.example.gov.ca" }
            'prod' { "https://eva-da-2.example.gov.ca" }
        }
        "RATE_LIMIT_REQUESTS_PER_MINUTE" = switch ($Environment) {
            'dev' { "120" }
            'staging' { "300" }
            'prod' { "600" }
        }
        "DEFAULT_OPENAI_MODEL" = "gpt-4"
        "MAX_TOKENS" = "4000"
        "DEFAULT_TEMPERATURE" = "0.7"
    }
    
    # Apply settings
    foreach ($setting in $appSettings.GetEnumerator()) {
        az functionapp config appsettings set `
            --name $FunctionAppName `
            --resource-group $ResourceGroup `
            --settings "$($setting.Key)=$($setting.Value)" `
            --output none
    }
    
    Write-Host "✅ Function App configuration completed" -ForegroundColor Green
}

# Deploy Function App code
function Deploy-FunctionApp {
    Write-Host "🚀 Deploying Function App code..." -ForegroundColor Blue
    
    $functionsPath = Join-Path $PSScriptRoot "functions"
    Push-Location $functionsPath
    
    try {
        # Deploy using Azure Functions Core Tools
        func azure functionapp publish $FunctionAppName --typescript
        
        if ($LASTEXITCODE -ne 0) {
            throw "Function App deployment failed"
        }
        
        Write-Host "✅ Function App deployed successfully" -ForegroundColor Green
    }
    finally {
        Pop-Location
    }
}

# Validate deployment
function Test-Deployment {
    Write-Host "🔍 Validating deployment..." -ForegroundColor Blue
    
    # Get Function App URL
    $functionAppUrl = az functionapp show `
        --name $FunctionAppName `
        --resource-group $ResourceGroup `
        --query "defaultHostName" `
        --output tsv
    
    if (!$functionAppUrl) {
        throw "Unable to retrieve Function App URL"
    }
    
    $healthUrl = "https://$functionAppUrl/api/health"
    
    Write-Host "Testing health endpoint: $healthUrl" -ForegroundColor Yellow
    
    # Test health endpoint
    try {
        $response = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 30
        
        if ($response.status -eq "healthy") {
            Write-Host "✅ Health check passed" -ForegroundColor Green
        } else {
            Write-Warning "Health check returned status: $($response.status)"
        }
    }
    catch {
        Write-Warning "Health check failed: $($_.Exception.Message)"
    }
    
    # Display endpoints
    Write-Host "`n🌐 Available endpoints:" -ForegroundColor Blue
    Write-Host "   Health: https://$functionAppUrl/api/health" -ForegroundColor Cyan
    Write-Host "   Chat: https://$functionAppUrl/api/chat" -ForegroundColor Cyan
    Write-Host "   Orchestrate: https://$functionAppUrl/api/orchestrate" -ForegroundColor Cyan
    Write-Host "   Agents: https://$functionAppUrl/api/agents" -ForegroundColor Cyan
    Write-Host "   Metrics: https://$functionAppUrl/api/metrics" -ForegroundColor Cyan
    Write-Host "   API Docs: https://$functionAppUrl/api/docs" -ForegroundColor Cyan
}

# Main deployment workflow
try {
    $startTime = Get-Date
    
    # Authenticate with Azure
    Write-Host "🔐 Checking Azure authentication..." -ForegroundColor Blue
    $account = az account show 2>$null | ConvertFrom-Json
    if (!$account) {
        Write-Host "Please authenticate with Azure..." -ForegroundColor Yellow
        az login
        $account = az account show | ConvertFrom-Json
    }
    
    if ($SubscriptionId -and $account.id -ne $SubscriptionId) {
        az account set --subscription $SubscriptionId
    }
    
    Write-Host "✅ Authenticated as: $($account.user.name)" -ForegroundColor Green
    Write-Host "   Subscription: $($account.name)" -ForegroundColor Green
    
    # Execute deployment steps
    Test-Prerequisites
    Build-FunctionApp
    Deploy-Infrastructure
    Set-FunctionAppConfiguration
    Deploy-FunctionApp
    Test-Deployment
    
    $duration = (Get-Date) - $startTime
    Write-Host "`n🎉 Deployment completed successfully!" -ForegroundColor Green
    Write-Host "   Duration: $($duration.ToString('mm\:ss'))" -ForegroundColor Green
    Write-Host "   Environment: $Environment" -ForegroundColor Green
    Write-Host "   Function App: $FunctionAppName" -ForegroundColor Green
}
catch {
    Write-Host "`n❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
    exit 1
}
