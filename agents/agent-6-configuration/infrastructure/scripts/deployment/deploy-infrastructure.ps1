# Deploy EVA DA 2.0 Infrastructure
# PowerShell deployment script with multi-environment support

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("dev", "staging", "prod")]
    [string]$Environment,
    
    [Parameter(Mandatory = $false)]
    [ValidateSet("terraform", "bicep")]
    [string]$IacTool = "terraform",
    
    [Parameter(Mandatory = $false)]
    [string]$SubscriptionId,
    
    [Parameter(Mandatory = $false)]
    [string]$ResourceGroupName,
    
    [Parameter(Mandatory = $false)]
    [switch]$WhatIf,
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipPreChecks
)

# Set strict error handling
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

# Configuration
$AppName = "eva-da-2"
$Location = "Canada Central"
$ScriptRoot = $PSScriptRoot
$InfraRoot = Split-Path $ScriptRoot -Parent
$TerraformPath = Join-Path $InfraRoot "infra\terraform"
$BicepPath = Join-Path $InfraRoot "infra"

Write-Host "🚀 EVA DA 2.0 Infrastructure Deployment" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Cyan
Write-Host "IaC Tool: $IacTool" -ForegroundColor Cyan
Write-Host "Location: $Location" -ForegroundColor Cyan

# Pre-deployment checks
if (-not $SkipPreChecks) {
    Write-Host "`n📋 Running pre-deployment checks..." -ForegroundColor Yellow
    
    # Check Azure CLI
    try {
        $azVersion = az version --output json | ConvertFrom-Json
        Write-Host "✅ Azure CLI version: $($azVersion.'azure-cli')" -ForegroundColor Green
    }
    catch {
        Write-Error "❌ Azure CLI not found. Please install Azure CLI."
        exit 1
    }
    
    # Check login status
    try {
        $account = az account show --output json | ConvertFrom-Json
        Write-Host "✅ Logged in as: $($account.user.name)" -ForegroundColor Green
    }
    catch {
        Write-Error "❌ Not logged in to Azure. Run 'az login' first."
        exit 1
    }
    
    # Set subscription if provided
    if ($SubscriptionId) {
        Write-Host "🔄 Setting subscription to $SubscriptionId..." -ForegroundColor Yellow
        az account set --subscription $SubscriptionId
        if ($LASTEXITCODE -ne 0) {
            Write-Error "❌ Failed to set subscription"
            exit 1
        }
    }
}

# Generate resource group name if not provided
if (-not $ResourceGroupName) {
    $ResourceGroupName = "rg-$AppName-$Environment"
}

Write-Host "📦 Resource Group: $ResourceGroupName" -ForegroundColor Cyan

# Create resource group if it doesn't exist
Write-Host "`n🔄 Ensuring resource group exists..." -ForegroundColor Yellow
$rgExists = az group exists --name $ResourceGroupName --output tsv
if ($rgExists -eq "false") {
    Write-Host "📦 Creating resource group $ResourceGroupName in $Location..." -ForegroundColor Yellow
    az group create --name $ResourceGroupName --location $Location --tags `
        Environment=$Environment `
        Application=$AppName `
        ManagedBy=PowerShell `
        Project=EVA-DA-2.0
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "❌ Failed to create resource group"
        exit 1
    }
    Write-Host "✅ Resource group created successfully" -ForegroundColor Green
}
else {
    Write-Host "✅ Resource group already exists" -ForegroundColor Green
}

# Deploy infrastructure based on selected tool
if ($IacTool -eq "terraform") {
    Write-Host "`n🏗️ Deploying with Terraform..." -ForegroundColor Yellow
    
    # Change to terraform directory
    Push-Location $TerraformPath
    
    try {
        # Initialize Terraform
        Write-Host "🔄 Initializing Terraform..." -ForegroundColor Yellow
        terraform init
        if ($LASTEXITCODE -ne 0) {
            throw "Terraform init failed"
        }
        
        # Create/select workspace
        Write-Host "🔄 Managing Terraform workspace..." -ForegroundColor Yellow
        terraform workspace select $Environment 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "📝 Creating workspace $Environment..." -ForegroundColor Yellow
            terraform workspace new $Environment
        }
        
        # Plan deployment
        Write-Host "🔍 Planning Terraform deployment..." -ForegroundColor Yellow
        $planArgs = @(
            "plan"
            "-var=environment=$Environment"
            "-var=location=$Location"
            "-out=tfplan"
        )
        
        & terraform @planArgs
        if ($LASTEXITCODE -ne 0) {
            throw "Terraform plan failed"
        }
        
        # Apply if not what-if mode
        if (-not $WhatIf) {
            Write-Host "🚀 Applying Terraform deployment..." -ForegroundColor Yellow
            terraform apply -auto-approve tfplan
            if ($LASTEXITCODE -ne 0) {
                throw "Terraform apply failed"
            }
            
            # Show outputs
            Write-Host "`n📋 Terraform Outputs:" -ForegroundColor Green
            terraform output
        }
        else {
            Write-Host "✅ What-if mode: Plan completed successfully" -ForegroundColor Green
        }
    }
    catch {
        Write-Error "❌ Terraform deployment failed: $_"
        exit 1
    }
    finally {
        Pop-Location
    }
}
else {
    Write-Host "`n🏗️ Deploying with Bicep..." -ForegroundColor Yellow
    
    # Deploy Bicep template
    $deploymentName = "$AppName-$Environment-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    $templateFile = Join-Path $BicepPath "main.bicep"
    
    try {
        # Validate template
        Write-Host "🔍 Validating Bicep template..." -ForegroundColor Yellow
        az deployment group validate `
            --resource-group $ResourceGroupName `
            --template-file $templateFile `
            --parameters environment=$Environment location=$Location
        
        if ($LASTEXITCODE -ne 0) {
            throw "Bicep template validation failed"
        }
        
        if ($WhatIf) {
            # What-if deployment
            Write-Host "🔍 Running what-if analysis..." -ForegroundColor Yellow
            az deployment group what-if `
                --resource-group $ResourceGroupName `
                --template-file $templateFile `
                --parameters environment=$Environment location=$Location
        }
        else {
            # Deploy template
            Write-Host "🚀 Deploying Bicep template..." -ForegroundColor Yellow
            az deployment group create `
                --resource-group $ResourceGroupName `
                --name $deploymentName `
                --template-file $templateFile `
                --parameters environment=$Environment location=$Location
            
            if ($LASTEXITCODE -ne 0) {
                throw "Bicep deployment failed"
            }
            
            # Show outputs
            Write-Host "`n📋 Deployment Outputs:" -ForegroundColor Green
            az deployment group show `
                --resource-group $ResourceGroupName `
                --name $deploymentName `
                --query properties.outputs `
                --output table
        }
    }
    catch {
        Write-Error "❌ Bicep deployment failed: $_"
        exit 1
    }
}

Write-Host "`n🎉 Infrastructure deployment completed successfully!" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Cyan
Write-Host "Resource Group: $ResourceGroupName" -ForegroundColor Cyan

# Post-deployment validation
if (-not $WhatIf) {
    Write-Host "`n🔍 Running post-deployment validation..." -ForegroundColor Yellow
    
    # Check key resources
    $resources = az resource list --resource-group $ResourceGroupName --output json | ConvertFrom-Json
    $expectedResources = @("Microsoft.DocumentDB/databaseAccounts", "Microsoft.CognitiveServices/accounts", "Microsoft.KeyVault/vaults", "Microsoft.Web/sites")
    
    foreach ($resourceType in $expectedResources) {
        $found = $resources | Where-Object { $_.type -eq $resourceType }
        if ($found) {
            Write-Host "✅ $resourceType deployed successfully" -ForegroundColor Green
        }
        else {
            Write-Warning "⚠️ $resourceType not found in deployment"
        }
    }
}

Write-Host "`n🏁 Deployment process completed!" -ForegroundColor Green
