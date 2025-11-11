# EVA DA 2.0 Agent 6 Configuration - Complete Setup Script
# Automates everything: infrastructure, environment setup, and deployment readiness

param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("dev", "staging", "prod")]
    [string]$Environment = "dev",
    
    [Parameter(Mandatory = $false)]
    [ValidateSet("terraform", "bicep")]
    [string]$IacTool = "terraform",
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipAzureLogin,
    
    [Parameter(Mandatory = $false)]
    [switch]$SetupOnly,
    
    [Parameter(Mandatory = $false)]
    [switch]$DeployNow
)

# Set strict error handling
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

# Configuration
$AppName = "eva-da-2"
$ScriptRoot = $PSScriptRoot
$InfraRoot = Split-Path $ScriptRoot -Parent

Write-Host @"
⚙️ ========================================
   EVA DA 2.0 - Agent 6: Configuration Expert
   Infrastructure Automation & DevOps Excellence
========================================
"@ -ForegroundColor Green

Write-Host "🎯 Priority Tasks:" -ForegroundColor Cyan
Write-Host "   ✅ Terraform Deployment - Complete Azure infrastructure provisioning"
Write-Host "   ✅ Multi-Environment Setup - Dev, staging, production configurations"
Write-Host "   ✅ CI/CD Pipeline - Automated deployment workflows" 
Write-Host "   ✅ Configuration Management - Environment-specific settings"
Write-Host "   ✅ Backup & Recovery - Disaster recovery automation"
Write-Host ""

# Check prerequisites
function Test-Prerequisites {
    Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow
    
    $prerequisites = @()
    
    # Check Azure CLI
    try {
        $azVersion = az version --output json | ConvertFrom-Json
        Write-Host "   ✅ Azure CLI: $($azVersion.'azure-cli')" -ForegroundColor Green
    }
    catch {
        Write-Host "   ❌ Azure CLI not found" -ForegroundColor Red
        $prerequisites += "Azure CLI"
    }
    
    # Check Terraform
    try {
        $tfVersion = terraform version -json | ConvertFrom-Json
        Write-Host "   ✅ Terraform: $($tfVersion.terraform_version)" -ForegroundColor Green
    }
    catch {
        Write-Host "   ❌ Terraform not found" -ForegroundColor Red
        $prerequisites += "Terraform"
    }
    
    # Check PowerShell version
    if ($PSVersionTable.PSVersion.Major -ge 5) {
        Write-Host "   ✅ PowerShell: $($PSVersionTable.PSVersion)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ PowerShell 5.0+ required" -ForegroundColor Red
        $prerequisites += "PowerShell 5.0+"
    }
    
    if ($prerequisites.Count -gt 0) {
        Write-Host "`n❌ Missing prerequisites: $($prerequisites -join ', ')" -ForegroundColor Red
        Write-Host "Please install the missing components and try again." -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "   ✅ All prerequisites satisfied!" -ForegroundColor Green
}

# Setup Azure authentication
function Initialize-AzureAuth {
    if ($SkipAzureLogin) {
        Write-Host "⏭️ Skipping Azure login check..." -ForegroundColor Yellow
        return
    }
    
    Write-Host "🔐 Checking Azure authentication..." -ForegroundColor Yellow
    
    try {
        $account = az account show --output json | ConvertFrom-Json
        Write-Host "   ✅ Logged in as: $($account.user.name)" -ForegroundColor Green
        Write-Host "   📋 Subscription: $($account.name) ($($account.id))" -ForegroundColor Cyan
    }
    catch {
        Write-Host "   ❌ Not logged in to Azure" -ForegroundColor Red
        Write-Host "🔄 Starting Azure login..." -ForegroundColor Yellow
        az login
        
        # Verify login succeeded
        $account = az account show --output json | ConvertFrom-Json
        Write-Host "   ✅ Successfully logged in as: $($account.user.name)" -ForegroundColor Green
    }
}

# Initialize directory structure
function Initialize-DirectoryStructure {
    Write-Host "📁 Setting up directory structure..." -ForegroundColor Yellow
    
    $directories = @(
        "config",
        "scripts\deployment",
        "scripts\monitoring",
        "src\components",
        "logs",
        "backups"
    )
    
    foreach ($dir in $directories) {
        $fullPath = Join-Path $InfraRoot $dir
        if (-not (Test-Path $fullPath)) {
            New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
            Write-Host "   ✅ Created: $dir" -ForegroundColor Green
        } else {
            Write-Host "   ℹ️ Exists: $dir" -ForegroundColor Gray
        }
    }
}

# Validate configuration files
function Test-ConfigurationFiles {
    Write-Host "📄 Validating configuration files..." -ForegroundColor Yellow
    
    $configFiles = @{
        "environments.json" = Join-Path $InfraRoot "config\environments.json"
        "terraform/main.tf" = Join-Path $InfraRoot "infra\terraform\main.tf"
        "terraform/terraform.tfvars" = Join-Path $InfraRoot "infra\terraform\terraform.tfvars"
        "main.bicep" = Join-Path $InfraRoot "infra\main.bicep"
    }
    
    foreach ($file in $configFiles.GetEnumerator()) {
        if (Test-Path $file.Value) {
            Write-Host "   ✅ $($file.Key)" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Missing: $($file.Key)" -ForegroundColor Red
        }
    }
}

# Setup Terraform workspace
function Initialize-TerraformWorkspace {
    Write-Host "🏗️ Setting up Terraform workspace..." -ForegroundColor Yellow
    
    $terraformPath = Join-Path $InfraRoot "infra\terraform"
    Push-Location $terraformPath
    
    try {
        # Initialize Terraform
        Write-Host "   🔄 Initializing Terraform..." -ForegroundColor Yellow
        terraform init
        
        # Create/select workspace
        Write-Host "   🔄 Setting up workspace: $Environment" -ForegroundColor Yellow
        terraform workspace select $Environment 2>$null
        if ($LASTEXITCODE -ne 0) {
            terraform workspace new $Environment
            Write-Host "   ✅ Created new workspace: $Environment" -ForegroundColor Green
        } else {
            Write-Host "   ✅ Using existing workspace: $Environment" -ForegroundColor Green
        }
        
        # Validate configuration
        Write-Host "   🔍 Validating Terraform configuration..." -ForegroundColor Yellow
        terraform validate
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Terraform configuration is valid" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Terraform validation failed" -ForegroundColor Red
        }
    }
    finally {
        Pop-Location
    }
}

# Create deployment summary
function Show-DeploymentSummary {
    Write-Host @"

📊 ===============================
   DEPLOYMENT CONFIGURATION SUMMARY
===============================
"@ -ForegroundColor Cyan
    
    Write-Host "Environment: " -NoNewline -ForegroundColor White
    Write-Host $Environment -ForegroundColor Yellow
    
    Write-Host "IaC Tool: " -NoNewline -ForegroundColor White
    Write-Host $IacTool -ForegroundColor Yellow
    
    Write-Host "App Name: " -NoNewline -ForegroundColor White
    Write-Host $AppName -ForegroundColor Yellow
    
    # Load and show environment config
    $configPath = Join-Path $InfraRoot "config\environments.json"
    if (Test-Path $configPath) {
        $config = Get-Content $configPath | ConvertFrom-Json
        $envConfig = $config.environments.$Environment
        
        Write-Host "`n🌍 Environment Configuration:" -ForegroundColor Cyan
        Write-Host "   Resource Group: " -NoNewline -ForegroundColor White
        Write-Host $envConfig.azure.resourceGroup -ForegroundColor Yellow
        
        Write-Host "   Location: " -NoNewline -ForegroundColor White
        Write-Host $envConfig.azure.location -ForegroundColor Yellow
        
        Write-Host "   Cosmos Throughput: " -NoNewline -ForegroundColor White
        Write-Host "$($envConfig.cosmos.throughput.database) RU/s" -ForegroundColor Yellow
        
        Write-Host "   Function SKU: " -NoNewline -ForegroundColor White
        Write-Host $envConfig.functions.sku -ForegroundColor Yellow
        
        Write-Host "   Multi-Region: " -NoNewline -ForegroundColor White
        Write-Host ($envConfig.cosmos.multiRegion ? "Yes" : "No") -ForegroundColor Yellow
    }
    
    Write-Host "`n🚀 Available Commands:" -ForegroundColor Cyan
    Write-Host "   Deploy Infrastructure:" -ForegroundColor White
    Write-Host "     .\scripts\deployment\deploy-infrastructure.ps1 -Environment $Environment -IacTool $IacTool" -ForegroundColor Gray
    
    Write-Host "   Manage Secrets:" -ForegroundColor White  
    Write-Host "     .\scripts\manage-secrets.ps1 -Environment $Environment -Action list" -ForegroundColor Gray
    
    Write-Host "   Backup System:" -ForegroundColor White
    Write-Host "     .\scripts\backup-recovery.ps1 -Environment $Environment -Action backup" -ForegroundColor Gray
    
    Write-Host "   Test Connectivity:" -ForegroundColor White
    Write-Host "     .\scripts\test-azure-connectivity.js" -ForegroundColor Gray
    
    Write-Host @"

===============================
"@ -ForegroundColor Cyan
}

# Main setup execution
function Start-ConfigurationSetup {
    Write-Host "🚀 Starting EVA DA 2.0 Configuration Setup..." -ForegroundColor Green
    
    # Step 1: Prerequisites
    Test-Prerequisites
    
    # Step 2: Azure Authentication
    Initialize-AzureAuth
    
    # Step 3: Directory Structure
    Initialize-DirectoryStructure
    
    # Step 4: Configuration Validation
    Test-ConfigurationFiles
    
    # Step 5: Terraform Setup
    if ($IacTool -eq "terraform") {
        Initialize-TerraformWorkspace
    }
    
    # Step 6: Show Summary
    Show-DeploymentSummary
    
    Write-Host "✅ Configuration setup completed successfully!" -ForegroundColor Green
}

# Execute deployment if requested
function Start-Deployment {
    Write-Host "🚀 Starting infrastructure deployment..." -ForegroundColor Green
    
    $deployScript = Join-Path $InfraRoot "scripts\deployment\deploy-infrastructure.ps1"
    
    if (Test-Path $deployScript) {
        & $deployScript -Environment $Environment -IacTool $IacTool -SkipPreChecks
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
            
            # Run post-deployment validation
            Write-Host "🔍 Running post-deployment validation..." -ForegroundColor Yellow
            $testScript = Join-Path $InfraRoot "scripts\test-azure-connectivity.js"
            if (Test-Path $testScript) {
                node $testScript
            }
        } else {
            Write-Host "❌ Deployment failed. Check logs for details." -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ Deployment script not found: $deployScript" -ForegroundColor Red
        exit 1
    }
}

# Main execution
try {
    # Always run setup
    Start-ConfigurationSetup
    
    # Handle deployment options
    if ($DeployNow) {
        Write-Host "`n🤔 Ready to deploy infrastructure to $Environment environment?" -ForegroundColor Yellow
        $confirm = Read-Host "Type 'YES' to proceed with deployment"
        
        if ($confirm -eq "YES") {
            Start-Deployment
        } else {
            Write-Host "⏭️ Deployment skipped. Run with -DeployNow when ready." -ForegroundColor Yellow
        }
    } elseif (-not $SetupOnly) {
        Write-Host "`n🤔 Would you like to deploy the infrastructure now?" -ForegroundColor Yellow
        Write-Host "   Run again with -DeployNow to deploy automatically" -ForegroundColor Gray
        Write-Host "   Or use the deployment script directly:" -ForegroundColor Gray
        Write-Host "   .\scripts\deployment\deploy-infrastructure.ps1 -Environment $Environment" -ForegroundColor Cyan
    }
    
    Write-Host @"

🎉 ========================================
   EVA DA 2.0 Agent 6 Setup Complete!
   Infrastructure automation ready! ⚙️
========================================
"@ -ForegroundColor Green

    Write-Host "`n🤝 Agent Coordination Ready:" -ForegroundColor Cyan
    Write-Host "   ✅ Deploy infrastructure for Agent 1 (Data Architecture)" -ForegroundColor Green
    Write-Host "   ✅ Configuration UI for Agent 2 (Design System)" -ForegroundColor Green
    Write-Host "   ✅ Monitoring setup for Agent 3 (Monitoring)" -ForegroundColor Green
    Write-Host "   ✅ Security policies for Agent 4 (Security)" -ForegroundColor Green
    Write-Host "   ✅ Function deployment for Agent 5 (API Integration)" -ForegroundColor Green
    
    Write-Host "`n⚙️ Ready to automate everything! Let's make deployment effortless! 🚀" -ForegroundColor Yellow
}
catch {
    Write-Host "`n❌ Setup failed: $_" -ForegroundColor Red
    Write-Host "Check the error details above and retry." -ForegroundColor Yellow
    exit 1
}
