# EVA DA 2.0 - Power Surge Recovery Protocol
# Emergency validation and recovery script for all 6 agents
# Generated: $(Get-Date)

param(
    [switch]$ValidateOnly,
    [switch]$FullRecovery,
    [switch]$DeployAfterValidation,
    [string]$LogPath = ".\logs\power-surge-recovery.log"
)

# Create logs directory if it doesn't exist
$LogDir = Split-Path $LogPath -Parent
if (!(Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "$Timestamp [$Level] $Message"
    Write-Host $LogEntry
    Add-Content -Path $LogPath -Value $LogEntry
}

function Test-PowerSurgeImpact {
    Write-Log "🔍 Assessing power surge impact..." "INFO"
    
    $ImpactAssessment = @{
        CoreFilesIntact = $true
        ConfigurationPreserved = $true
        AgentWorkspacesAffected = $false
        DataIntegrityIssues = $false
        RecommendedAction = "PROCEED_WITH_CAUTION"
    }
    
    # Check critical files
    $CriticalFiles = @(
        ".\infra\terraform\main.tf",
        ".\src\data\CosmosClient.js",
        ".\MULTI-AGENT-DEVELOPMENT-ORCHESTRATION.md",
        ".\ARCHITECTURE.md",
        ".\BACKLOG.md"
    )
    
    foreach ($File in $CriticalFiles) {
        if (!(Test-Path $File)) {
            Write-Log "❌ Critical file missing: $File" "ERROR"
            $ImpactAssessment.CoreFilesIntact = $false
        } else {
            $FileInfo = Get-Item $File
            Write-Log "✅ Critical file intact: $File (Size: $($FileInfo.Length) bytes)" "INFO"
        }
    }
    
    # Check Terraform configuration
    if (Test-Path ".\infra\terraform\terraform.tfvars") {
        $TerraformVars = Get-Content ".\infra\terraform\terraform.tfvars" -Raw
        if ($TerraformVars -match "c59ee575-eb2a-4b51-a865-4b618f9add0a") {
            Write-Log "✅ Azure subscription configuration preserved" "INFO"
        } else {
            Write-Log "⚠️ Azure subscription configuration may be affected" "WARNING"
            $ImpactAssessment.ConfigurationPreserved = $false
        }
    }
    
    # Check agent directories
    $AgentDirs = @(
        ".\agents\agent-1-data-architecture",
        ".\agents\agent-2-design-system", 
        ".\agents\agent-3-monitoring",
        ".\agents\agent-4-security",
        ".\agents\agent-5-api-integration",
        ".\agents\agent-6-configuration"
    )
    
    $MissingAgentDirs = 0
    foreach ($Dir in $AgentDirs) {
        if (!(Test-Path $Dir)) {
            $MissingAgentDirs++
            Write-Log "⚠️ Agent directory missing: $Dir" "WARNING"
        }
    }
    
    if ($MissingAgentDirs -gt 0) {
        $ImpactAssessment.AgentWorkspacesAffected = $true
        Write-Log "⚠️ $MissingAgentDirs agent workspace(s) need recreation" "WARNING"
    }
    
    return $ImpactAssessment
}

function Invoke-AgentConsistencyCheck {
    Write-Log "🔍 Running comprehensive agent consistency check..." "INFO"
    
    if (!(Test-Path ".\scripts\agent-consistency-check.js")) {
        Write-Log "❌ Agent consistency check script not found" "ERROR"
        return $false
    }
    
    try {
        Write-Log "📊 Executing Node.js validation script..." "INFO"
        $ValidationResult = node ".\scripts\agent-consistency-check.js"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Log "✅ Agent consistency check completed successfully" "INFO"
            return $true
        } else {
            Write-Log "❌ Agent consistency check failed with exit code: $LASTEXITCODE" "ERROR"
            return $false
        }
    } catch {
        Write-Log "❌ Error running consistency check: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Restore-AgentWorkspaces {
    Write-Log "🔧 Restoring agent workspaces..." "INFO"
    
    $AgentConfigs = @(
        @{
            Name = "agent-1-data-architecture"
            Description = "Data Architecture & Cosmos DB"
            Files = @(
                ".\src\data\CosmosClient.js",
                ".\infra\terraform\main.tf",
                ".\src\data\models\CosmosDBModels.js"
            )
        },
        @{
            Name = "agent-2-design-system"
            Description = "Design System & UI Components"
            Files = @(
                ".\src\components\design-system\themes\EnterpriseTheme.ts",
                ".\src\components\design-system\styles\beautiful-ui.css",
                ".\src\components\eva-chat\TermsOfUseModal.tsx"
            )
        },
        @{
            Name = "agent-3-monitoring"
            Description = "Monitoring & Performance"
            Files = @(
                ".\src\monitoring\ApplicationInsights.js",
                ".\dashboards\performance-dashboard.json"
            )
        },
        @{
            Name = "agent-4-security"
            Description = "Security & Compliance"
            Files = @(
                ".\security\compliance-validation.js",
                ".\src\security\ManagedIdentityClient.js"
            )
        },
        @{
            Name = "agent-5-api-integration"
            Description = "API Integration & Functions"
            Files = @(
                ".\src\data\azure\FunctionApp\package.json",
                ".\src\api\ChatAPI.js"
            )
        },
        @{
            Name = "agent-6-configuration"
            Description = "Configuration & Infrastructure"
            Files = @(
                ".\infra\terraform\main.tf",
                ".\scripts\launch-6-agents.ps1"
            )
        }
    )
    
    foreach ($Agent in $AgentConfigs) {
        $AgentDir = ".\agents\$($Agent.Name)"
        
        Write-Log "🔧 Processing $($Agent.Name)..." "INFO"
        
        # Create agent directory if missing
        if (!(Test-Path $AgentDir)) {
            New-Item -ItemType Directory -Path $AgentDir -Force | Out-Null
            Write-Log "📁 Created directory: $AgentDir" "INFO"
        }
        
        # Create workspace file
        $WorkspaceFile = "$AgentDir\$($Agent.Name).code-workspace"
        $WorkspaceConfig = @{
            folders = @(
                @{ name = "EVA DA 2.0 - $($Agent.Description)"; path = "../.." }
            )
            settings = @{
                "workbench.colorTheme" = "Default Dark+"
                "editor.fontSize" = 14
                "terminal.integrated.defaultProfile.windows" = "PowerShell"
            }
            extensions = @{
                recommendations = @(
                    "ms-vscode.vscode-typescript-next",
                    "ms-vscode.vscode-json",
                    "ms-azuretools.vscode-azurefunctions"
                )
            }
        } | ConvertTo-Json -Depth 10
        
        Set-Content -Path $WorkspaceFile -Value $WorkspaceConfig
        Write-Log "📄 Created workspace: $WorkspaceFile" "INFO"
        
        # Create agent status file
        $StatusFile = "$AgentDir\agent-status.md"
        $StatusContent = @"
# $($Agent.Description)
## Status: IN_PROGRESS
## Last Updated: $(Get-Date)

### Critical Files:
$($Agent.Files | ForEach-Object { "- $_" } | Out-String)

### Tasks:
- [ ] Validate file integrity
- [ ] Complete implementation
- [ ] Test functionality
- [ ] Integrate with other agents

### Notes:
Post-power-surge validation completed.
"@
        Set-Content -Path $StatusFile -Value $StatusContent
        Write-Log "📝 Created status file: $StatusFile" "INFO"
    }
    
    Write-Log "✅ Agent workspace restoration completed" "INFO"
}

function Test-AzureConnectivity {
    Write-Log "🌐 Testing Azure connectivity..." "INFO"
    
    try {
        # Test Azure CLI availability
        $AzVersion = az version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Log "✅ Azure CLI is available" "INFO"
        } else {
            Write-Log "⚠️ Azure CLI not found or not configured" "WARNING"
            return $false
        }
        
        # Test subscription access
        $CurrentSubscription = az account show --query "id" -o tsv 2>$null
        if ($CurrentSubscription -eq "c59ee575-eb2a-4b51-a865-4b618f9add0a") {
            Write-Log "✅ Connected to correct Azure subscription" "INFO"
            return $true
        } else {
            Write-Log "⚠️ Not connected to target subscription (c59ee575-eb2a-4b51-a865-4b618f9add0a)" "WARNING"
            Write-Log "Current subscription: $CurrentSubscription" "INFO"
            return $false
        }
        
    } catch {
        Write-Log "❌ Error testing Azure connectivity: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Invoke-TerraformValidation {
    Write-Log "🏗️ Validating Terraform configuration..." "INFO"
    
    $TerraformDir = ".\infra\terraform"
    
    if (!(Test-Path $TerraformDir)) {
        Write-Log "❌ Terraform directory not found: $TerraformDir" "ERROR"
        return $false
    }
    
    Push-Location $TerraformDir
    
    try {
        # Initialize Terraform
        Write-Log "Initializing Terraform..." "INFO"
        terraform init -no-color
        
        if ($LASTEXITCODE -ne 0) {
            Write-Log "❌ Terraform initialization failed" "ERROR"
            return $false
        }
        
        # Validate configuration
        Write-Log "Validating Terraform configuration..." "INFO"
        terraform validate -no-color
        
        if ($LASTEXITCODE -eq 0) {
            Write-Log "✅ Terraform configuration is valid" "INFO"
            return $true
        } else {
            Write-Log "❌ Terraform validation failed" "ERROR"
            return $false
        }
        
    } catch {
        Write-Log "❌ Error during Terraform validation: $($_.Exception.Message)" "ERROR"
        return $false
    } finally {
        Pop-Location
    }
}

function Start-AgentLaunchSequence {
    Write-Log "🚀 Initiating agent launch sequence..." "INFO"
    
    if (!(Test-Path ".\scripts\launch-6-agents.ps1")) {
        Write-Log "❌ Agent launch script not found" "ERROR"
        return $false
    }
    
    try {
        Write-Log "🔧 Executing agent launch script..." "INFO"
        & ".\scripts\launch-6-agents.ps1" -CreateWorkspaces
        
        if ($LASTEXITCODE -eq 0) {
            Write-Log "✅ Agent launch sequence completed successfully" "INFO"
            return $true
        } else {
            Write-Log "❌ Agent launch sequence failed" "ERROR"
            return $false
        }
        
    } catch {
        Write-Log "❌ Error during agent launch: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Invoke-DeploymentSequence {
    Write-Log "🚀 Starting deployment sequence..." "INFO"
    
    # Test Azure connectivity first
    if (!(Test-AzureConnectivity)) {
        Write-Log "❌ Cannot proceed with deployment - Azure connectivity issues" "ERROR"
        return $false
    }
    
    # Validate Terraform
    if (!(Invoke-TerraformValidation)) {
        Write-Log "❌ Cannot proceed with deployment - Terraform validation failed" "ERROR"
        return $false
    }
    
    # Deploy infrastructure
    Write-Log "🏗️ Deploying Azure infrastructure..." "INFO"
    Push-Location ".\infra\terraform"
    
    try {
        terraform apply -auto-approve -no-color
        
        if ($LASTEXITCODE -eq 0) {
            Write-Log "✅ Infrastructure deployment completed successfully" "INFO"
            return $true
        } else {
            Write-Log "❌ Infrastructure deployment failed" "ERROR"
            return $false
        }
        
    } catch {
        Write-Log "❌ Error during deployment: $($_.Exception.Message)" "ERROR"
        return $false
    } finally {
        Pop-Location
    }
}

# Main execution flow
Write-Log "🎯 EVA DA 2.0 - Power Surge Recovery Protocol" "INFO"
Write-Log "================================================================" "INFO"
Write-Log "Started: $(Get-Date)" "INFO"
Write-Log "Mode: $(if ($ValidateOnly) { 'VALIDATION_ONLY' } elseif ($FullRecovery) { 'FULL_RECOVERY' } else { 'STANDARD_RECOVERY' })" "INFO"
Write-Log "================================================================" "INFO"

# Step 1: Assess power surge impact
$ImpactAssessment = Test-PowerSurgeImpact

if (!$ImpactAssessment.CoreFilesIntact) {
    Write-Log "🚨 CRITICAL: Core files compromised. Manual intervention required." "ERROR"
    exit 1
}

# Step 2: Run comprehensive validation
if (!(Invoke-AgentConsistencyCheck)) {
    Write-Log "⚠️ Agent consistency issues detected" "WARNING"
    
    if ($FullRecovery) {
        Write-Log "🔧 Attempting full recovery..." "INFO"
        Restore-AgentWorkspaces
    }
}

# Step 3: Restore agent workspaces if needed
if ($ImpactAssessment.AgentWorkspacesAffected -or $FullRecovery) {
    Restore-AgentWorkspaces
}

# Step 4: Launch agents
if (!$ValidateOnly) {
    if (Start-AgentLaunchSequence) {
        Write-Log "✅ All agents launched successfully" "INFO"
    } else {
        Write-Log "⚠️ Some agents may need manual intervention" "WARNING"
    }
}

# Step 5: Deploy if requested
if ($DeployAfterValidation -and !$ValidateOnly) {
    if (Invoke-DeploymentSequence) {
        Write-Log "🎉 Deployment completed successfully!" "INFO"
    } else {
        Write-Log "❌ Deployment failed" "ERROR"
    }
}

# Final status report
Write-Log "================================================================" "INFO"
Write-Log "🎯 POWER SURGE RECOVERY COMPLETED" "INFO"
Write-Log "================================================================" "INFO"
Write-Log "Core Files: $(if ($ImpactAssessment.CoreFilesIntact) { '✅ INTACT' } else { '❌ COMPROMISED' })" "INFO"
Write-Log "Configuration: $(if ($ImpactAssessment.ConfigurationPreserved) { '✅ PRESERVED' } else { '⚠️ AFFECTED' })" "INFO"
Write-Log "Agent Workspaces: $(if ($ImpactAssessment.AgentWorkspacesAffected) { '🔧 RESTORED' } else { '✅ INTACT' })" "INFO"
Write-Log "Completed: $(Get-Date)" "INFO"
Write-Log "================================================================" "INFO"

Write-Log "📄 Full recovery log saved to: $LogPath" "INFO"

# Open comprehensive report if available
if (Test-Path ".\POWER-SURGE-RECOVERY-REPORT.json") {
    Write-Log "📊 Opening comprehensive validation report..." "INFO"
    & code ".\POWER-SURGE-RECOVERY-REPORT.json"
}

Write-Log "🎊 Recovery protocol completed. Ready to resume EVA DA 2.0 development!" "INFO"
