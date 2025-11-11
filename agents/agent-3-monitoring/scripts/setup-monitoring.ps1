# EVA DA 2.0 - Monitoring Infrastructure Setup Script
# Agent 3 - Monitoring Expert
# 
# This script deploys comprehensive monitoring infrastructure for EVA DA 2.0

param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName,
    
    [Parameter(Mandatory=$false)]
    [string]$Environment = "dev",
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "Canada Central",
    
    [Parameter(Mandatory=$false)]
    [string]$AlertEmail = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$EnableAdvancedMonitoring = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$WhatIf = $false
)

# Set error action preference
$ErrorActionPreference = "Stop"

Write-Host "🚀 EVA DA 2.0 - Monitoring Infrastructure Setup" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Function to write colored output
function Write-StatusMessage {
    param(
        [string]$Message,
        [string]$Status = "Info"
    )
    
    switch ($Status) {
        "Success" { Write-Host "✅ $Message" -ForegroundColor Green }
        "Warning" { Write-Host "⚠️  $Message" -ForegroundColor Yellow }
        "Error"   { Write-Host "❌ $Message" -ForegroundColor Red }
        "Info"    { Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
        default   { Write-Host "📊 $Message" -ForegroundColor White }
    }
}

# Check prerequisites
Write-StatusMessage "Checking prerequisites..." -Status "Info"

# Check if Azure CLI is installed and user is logged in
try {
    $azureAccount = az account show 2>$null | ConvertFrom-Json
    if (-not $azureAccount) {
        throw "Not logged in to Azure"
    }
    Write-StatusMessage "Azure CLI authenticated as: $($azureAccount.user.name)" -Status "Success"
} catch {
    Write-StatusMessage "Please run 'az login' to authenticate with Azure" -Status "Error"
    exit 1
}

# Validate resource group exists
try {
    $rg = az group show --name $ResourceGroupName 2>$null | ConvertFrom-Json
    if (-not $rg) {
        throw "Resource group not found"
    }
    Write-StatusMessage "Resource group '$ResourceGroupName' found in $($rg.location)" -Status "Success"
} catch {
    Write-StatusMessage "Resource group '$ResourceGroupName' not found" -Status "Error"
    
    $createRg = Read-Host "Do you want to create the resource group? (y/n)"
    if ($createRg.ToLower() -eq 'y') {
        Write-StatusMessage "Creating resource group '$ResourceGroupName'..." -Status "Info"
        az group create --name $ResourceGroupName --location $Location
        Write-StatusMessage "Resource group created successfully" -Status "Success"
    } else {
        exit 1
    }
}

# Prepare deployment parameters
$deploymentParams = @{
    environment = $Environment
    location = $Location
    appName = "eva-da-2"
    enableAdvancedMonitoring = $EnableAdvancedMonitoring.IsPresent
    enableCustomAlerts = (-not [string]::IsNullOrEmpty($AlertEmail))
}

if (-not [string]::IsNullOrEmpty($AlertEmail)) {
    $deploymentParams.alertNotificationEmail = $AlertEmail
}

# Convert parameters to JSON for deployment
$parametersJson = $deploymentParams | ConvertTo-Json -Depth 10

Write-StatusMessage "Deployment Parameters:" -Status "Info"
Write-Host $parametersJson -ForegroundColor Gray

if ($WhatIf) {
    Write-StatusMessage "Running deployment validation (what-if)..." -Status "Info"
    
    $whatIfResult = az deployment group what-if `
        --resource-group $ResourceGroupName `
        --template-file "infra/main.bicep" `
        --parameters $parametersJson `
        --output table
    
    Write-Host $whatIfResult
    
    $proceed = Read-Host "Do you want to proceed with the deployment? (y/n)"
    if ($proceed.ToLower() -ne 'y') {
        Write-StatusMessage "Deployment cancelled by user" -Status "Warning"
        exit 0
    }
}

# Deploy monitoring infrastructure
Write-StatusMessage "Deploying monitoring infrastructure..." -Status "Info"

try {
    $deploymentName = "eva-monitoring-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    
    $deployment = az deployment group create `
        --resource-group $ResourceGroupName `
        --name $deploymentName `
        --template-file "infra/main.bicep" `
        --parameters $parametersJson `
        --output json | ConvertFrom-Json
    
    if ($deployment.properties.provisioningState -eq "Succeeded") {
        Write-StatusMessage "Monitoring infrastructure deployed successfully!" -Status "Success"
        
        # Extract outputs
        $outputs = $deployment.properties.outputs
        
        Write-StatusMessage "Deployment Outputs:" -Status "Info"
        Write-Host "📊 Log Analytics Workspace ID: $($outputs.logAnalyticsWorkspaceId.value)" -ForegroundColor Gray
        Write-Host "📈 Application Insights ID: $($outputs.appInsightsId.value)" -ForegroundColor Gray
        Write-Host "🔗 Application Insights Connection String: $($outputs.appInsightsConnectionString.value)" -ForegroundColor Gray
        Write-Host "📋 Dashboard ID: $($outputs.dashboardId.value)" -ForegroundColor Gray
        
        if ($outputs.actionGroupId.value) {
            Write-Host "🚨 Action Group ID: $($outputs.actionGroupId.value)" -ForegroundColor Gray
        }
        
        # Save outputs to environment file
        $envFile = @"
# EVA DA 2.0 - Monitoring Environment Variables
# Generated on $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

# Log Analytics
LOG_ANALYTICS_WORKSPACE_ID=$($outputs.logAnalyticsWorkspaceId.value)
LOG_ANALYTICS_CUSTOMER_ID=$($outputs.logAnalyticsCustomerId.value)

# Application Insights
APPLICATIONINSIGHTS_CONNECTION_STRING=$($outputs.appInsightsConnectionString.value)
APPINSIGHTS_INSTRUMENTATIONKEY=$($outputs.appInsightsInstrumentationKey.value)

# Azure Configuration
AZURE_RESOURCE_GROUP=$ResourceGroupName
AZURE_SUBSCRIPTION_ID=$($azureAccount.id)

# Monitoring Configuration
MONITORING_ENVIRONMENT=$Environment
MONITORING_LOCATION=$Location
"@

        $envFile | Out-File -FilePath ".env" -Encoding UTF8
        Write-StatusMessage "Environment variables saved to .env file" -Status "Success"
        
    } else {
        throw "Deployment failed with state: $($deployment.properties.provisioningState)"
    }
    
} catch {
    Write-StatusMessage "Deployment failed: $($_.Exception.Message)" -Status "Error"
    exit 1
}

# Deploy monitoring workbook
Write-StatusMessage "Deploying monitoring workbook..." -Status "Info"

try {
    # Create workbook deployment
    $workbookContent = Get-Content "workbooks/eva-da-monitoring-workbook.json" -Raw
    
    # Deploy workbook (this would need a separate Bicep template for workbooks)
    Write-StatusMessage "Workbook template prepared (manual import required)" -Status "Warning"
    Write-Host "📋 Import the workbook manually from: workbooks/eva-da-monitoring-workbook.json" -ForegroundColor Yellow
    
} catch {
    Write-StatusMessage "Could not prepare workbook: $($_.Exception.Message)" -Status "Warning"
}

# Install Node.js dependencies
if (Test-Path "package.json") {
    Write-StatusMessage "Installing Node.js dependencies..." -Status "Info"
    
    try {
        if (Get-Command npm -ErrorAction SilentlyContinue) {
            npm install
            Write-StatusMessage "Node.js dependencies installed successfully" -Status "Success"
        } else {
            Write-StatusMessage "npm not found. Please install Node.js to run the monitoring system" -Status "Warning"
        }
    } catch {
        Write-StatusMessage "Failed to install Node.js dependencies: $($_.Exception.Message)" -Status "Warning"
    }
}

# Create log analytics saved queries
Write-StatusMessage "Setting up Log Analytics saved queries..." -Status "Info"

$savedQueries = @(
    @{
        displayName = "EVA - Cosmos DB RU Analysis"
        category = "EVA Monitoring"
        query = Get-Content "queries/monitoring-queries.kql" -Raw | Select-String -Pattern "CosmosRUAnalysis.*?;" -AllMatches | ForEach-Object { $_.Matches[0].Value }
    },
    @{
        displayName = "EVA - Function Performance"
        category = "EVA Monitoring" 
        query = Get-Content "queries/monitoring-queries.kql" -Raw | Select-String -Pattern "FunctionPerformance.*?;" -AllMatches | ForEach-Object { $_.Matches[0].Value }
    }
)

foreach ($savedQuery in $savedQueries) {
    try {
        # Note: Azure CLI doesn't have direct support for saved queries, would need ARM template or REST API
        Write-StatusMessage "Saved query prepared: $($savedQuery.displayName)" -Status "Info"
    } catch {
        Write-StatusMessage "Could not create saved query: $($savedQuery.displayName)" -Status "Warning"
    }
}

# Final setup instructions
Write-StatusMessage "🎉 Monitoring Infrastructure Setup Complete!" -Status "Success"
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Import the monitoring workbook from: workbooks/eva-da-monitoring-workbook.json" -ForegroundColor White
Write-Host "2. Configure application code to use the Application Insights connection string" -ForegroundColor White
Write-Host "3. Run the monitoring system: npm start" -ForegroundColor White
Write-Host "4. Access your dashboard in the Azure Portal" -ForegroundColor White

if (-not [string]::IsNullOrEmpty($AlertEmail)) {
    Write-Host "5. Verify alert notifications are working by checking: $AlertEmail" -ForegroundColor White
}

Write-Host ""
Write-Host "🔗 Useful Links:" -ForegroundColor Cyan
Write-Host "   Azure Portal: https://portal.azure.com" -ForegroundColor White
Write-Host "   Resource Group: https://portal.azure.com/#@/resource/subscriptions/$($azureAccount.id)/resourceGroups/$ResourceGroupName" -ForegroundColor White

Write-StatusMessage "Happy monitoring! 📊" -Status "Success"
