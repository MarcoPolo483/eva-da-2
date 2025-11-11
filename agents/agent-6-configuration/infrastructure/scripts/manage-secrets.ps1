# Key Vault Secrets Management for EVA DA 2.0
# Manages application secrets across environments with proper security

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("dev", "staging", "prod")]
    [string]$Environment,
    
    [Parameter(Mandatory = $true)]
    [ValidateSet("create", "update", "get", "list", "rotate", "backup")]
    [string]$Action,
    
    [Parameter(Mandatory = $false)]
    [string]$SecretName,
    
    [Parameter(Mandatory = $false)]
    [string]$SecretValue,
    
    [Parameter(Mandatory = $false)]
    [string]$KeyVaultName,
    
    [Parameter(Mandatory = $false)]
    [switch]$Force
)

# Set strict error handling
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

# Load environment configuration
$ConfigPath = Join-Path $PSScriptRoot "..\config\environments.json"
$Config = Get-Content $ConfigPath | ConvertFrom-Json

# Get environment-specific configuration
$EnvConfig = $Config.environments.$Environment
if (-not $EnvConfig) {
    Write-Error "❌ Invalid environment: $Environment"
    exit 1
}

# Determine Key Vault name
if (-not $KeyVaultName) {
    $KeyVaultName = "kv-eva-da-2-$Environment"
    Write-Host "🔑 Using Key Vault: $KeyVaultName" -ForegroundColor Cyan
}

Write-Host "🔐 EVA DA 2.0 Key Vault Management" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Cyan
Write-Host "Action: $Action" -ForegroundColor Cyan
Write-Host "Key Vault: $KeyVaultName" -ForegroundColor Cyan

# Verify Key Vault exists
try {
    $vault = az keyvault show --name $KeyVaultName --output json 2>$null | ConvertFrom-Json
    if (-not $vault) {
        Write-Error "❌ Key Vault '$KeyVaultName' not found"
        exit 1
    }
    Write-Host "✅ Key Vault found" -ForegroundColor Green
}
catch {
    Write-Error "❌ Failed to access Key Vault: $_"
    exit 1
}

# Define standard secrets for EVA DA 2.0
$StandardSecrets = @{
    "openai-api-key" = @{
        Description = "Azure OpenAI API Key"
        ContentType = "application/x-api-key"
        Tags = @{ Service = "OpenAI"; Environment = $Environment }
    }
    "cosmos-connection-string" = @{
        Description = "Cosmos DB Connection String"
        ContentType = "application/x-connection-string"
        Tags = @{ Service = "CosmosDB"; Environment = $Environment }
    }
    "storage-connection-string" = @{
        Description = "Storage Account Connection String" 
        ContentType = "application/x-connection-string"
        Tags = @{ Service = "Storage"; Environment = $Environment }
    }
    "application-insights-instrumentation-key" = @{
        Description = "Application Insights Instrumentation Key"
        ContentType = "application/x-api-key"
        Tags = @{ Service = "ApplicationInsights"; Environment = $Environment }
    }
    "jwt-signing-key" = @{
        Description = "JWT Token Signing Key"
        ContentType = "application/x-pkcs12"
        Tags = @{ Service = "Authentication"; Environment = $Environment }
    }
    "encryption-key" = @{
        Description = "Data Encryption Key"
        ContentType = "application/x-pkcs12"
        Tags = @{ Service = "Encryption"; Environment = $Environment }
    }
}

function New-SecureSecret {
    param(
        [string]$Name,
        [string]$Value,
        [hashtable]$Metadata
    )
    
    try {
        Write-Host "🔄 Creating secret: $Name" -ForegroundColor Yellow
        
        # Convert tags to JSON string for Azure CLI
        $tagsJson = ($Metadata.Tags | ConvertTo-Json -Compress).Replace('"', '\"')
        
        $result = az keyvault secret set `
            --vault-name $KeyVaultName `
            --name $Name `
            --value $Value `
            --description $Metadata.Description `
            --content-type $Metadata.ContentType `
            --tags $tagsJson `
            --output json | ConvertFrom-Json
        
        if ($result) {
            Write-Host "✅ Secret '$Name' created successfully" -ForegroundColor Green
            Write-Host "   Version: $($result.id.Split('/')[-1])" -ForegroundColor Gray
        }
    }
    catch {
        Write-Error "❌ Failed to create secret '$Name': $_"
    }
}

function Get-Secret {
    param([string]$Name)
    
    try {
        $secret = az keyvault secret show --vault-name $KeyVaultName --name $Name --output json | ConvertFrom-Json
        return $secret
    }
    catch {
        Write-Warning "⚠️ Secret '$Name' not found"
        return $null
    }
}

function Get-AllSecrets {
    try {
        $secrets = az keyvault secret list --vault-name $KeyVaultName --output json | ConvertFrom-Json
        return $secrets
    }
    catch {
        Write-Error "❌ Failed to list secrets: $_"
        return @()
    }
}

function Backup-KeyVault {
    $BackupPath = "keyvault-backup-$Environment-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
    
    try {
        Write-Host "🔄 Creating Key Vault backup..." -ForegroundColor Yellow
        
        $secrets = Get-AllSecrets
        $backup = @{
            KeyVault = $KeyVaultName
            Environment = $Environment
            BackupDate = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
            Secrets = @()
        }
        
        foreach ($secret in $secrets) {
            $secretDetail = Get-Secret -Name $secret.name
            $backup.Secrets += @{
                Name = $secret.name
                ContentType = $secretDetail.contentType
                Tags = $secretDetail.tags
                Description = $secretDetail.attributes.description
                # Note: Actual secret values are NOT backed up for security
            }
        }
        
        $backup | ConvertTo-Json -Depth 10 | Out-File $BackupPath -Encoding UTF8
        Write-Host "✅ Backup created: $BackupPath" -ForegroundColor Green
        Write-Host "⚠️ Note: Secret values are not included in backup for security" -ForegroundColor Yellow
    }
    catch {
        Write-Error "❌ Backup failed: $_"
    }
}

function Rotate-Secret {
    param([string]$Name)
    
    if ($Name -notin $StandardSecrets.Keys) {
        Write-Error "❌ Secret rotation not supported for: $Name"
        return
    }
    
    try {
        Write-Host "🔄 Rotating secret: $Name" -ForegroundColor Yellow
        
        # Generate new secret value based on type
        $newValue = switch ($Name) {
            "jwt-signing-key" { 
                [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
            }
            "encryption-key" {
                [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
            }
            default {
                Write-Error "❌ Automatic rotation not implemented for: $Name"
                return
            }
        }
        
        # Create new version of secret
        New-SecureSecret -Name $Name -Value $newValue -Metadata $StandardSecrets[$Name]
        
        Write-Host "✅ Secret '$Name' rotated successfully" -ForegroundColor Green
        Write-Host "⚠️ Update applications to use new secret version" -ForegroundColor Yellow
    }
    catch {
        Write-Error "❌ Failed to rotate secret '$Name': $_"
    }
}

# Execute requested action
switch ($Action) {
    "create" {
        if (-not $SecretName -or -not $SecretValue) {
            Write-Error "❌ SecretName and SecretValue required for create action"
            exit 1
        }
        
        # Check if secret exists
        $existingSecret = Get-Secret -Name $SecretName
        if ($existingSecret -and -not $Force) {
            Write-Error "❌ Secret '$SecretName' already exists. Use -Force to overwrite"
            exit 1
        }
        
        # Use standard metadata if available, otherwise create basic metadata
        $metadata = if ($StandardSecrets.ContainsKey($SecretName)) {
            $StandardSecrets[$SecretName]
        } else {
            @{
                Description = "Custom secret for $SecretName"
                ContentType = "text/plain"
                Tags = @{ Environment = $Environment; CreatedBy = "PowerShell" }
            }
        }
        
        New-SecureSecret -Name $SecretName -Value $SecretValue -Metadata $metadata
    }
    
    "update" {
        if (-not $SecretName -or -not $SecretValue) {
            Write-Error "❌ SecretName and SecretValue required for update action"
            exit 1
        }
        
        # Get existing secret metadata
        $existingSecret = Get-Secret -Name $SecretName
        if (-not $existingSecret) {
            Write-Error "❌ Secret '$SecretName' not found"
            exit 1
        }
        
        $metadata = @{
            Description = $existingSecret.contentType
            ContentType = $existingSecret.contentType
            Tags = $existingSecret.tags
        }
        
        New-SecureSecret -Name $SecretName -Value $SecretValue -Metadata $metadata
    }
    
    "get" {
        if (-not $SecretName) {
            Write-Error "❌ SecretName required for get action"
            exit 1
        }
        
        $secret = Get-Secret -Name $SecretName
        if ($secret) {
            Write-Host "📋 Secret Details:" -ForegroundColor Green
            Write-Host "Name: $($secret.id.Split('/')[-2])" -ForegroundColor Cyan
            Write-Host "Version: $($secret.id.Split('/')[-1])" -ForegroundColor Cyan
            Write-Host "Content Type: $($secret.contentType)" -ForegroundColor Cyan
            Write-Host "Created: $($secret.attributes.created)" -ForegroundColor Cyan
            Write-Host "Updated: $($secret.attributes.updated)" -ForegroundColor Cyan
            
            if ($secret.tags) {
                Write-Host "Tags:" -ForegroundColor Cyan
                $secret.tags.PSObject.Properties | ForEach-Object {
                    Write-Host "  $($_.Name): $($_.Value)" -ForegroundColor Gray
                }
            }
        }
    }
    
    "list" {
        Write-Host "📋 Secrets in Key Vault: $KeyVaultName" -ForegroundColor Green
        $secrets = Get-AllSecrets
        
        if ($secrets.Count -eq 0) {
            Write-Host "No secrets found" -ForegroundColor Yellow
        } else {
            $secrets | ForEach-Object {
                Write-Host "🔑 $($_.name)" -ForegroundColor Cyan
                if ($_.contentType) {
                    Write-Host "   Type: $($_.contentType)" -ForegroundColor Gray
                }
                if ($_.tags) {
                    Write-Host "   Tags: $($_.tags | ConvertTo-Json -Compress)" -ForegroundColor Gray
                }
            }
        }
    }
    
    "rotate" {
        if (-not $SecretName) {
            Write-Error "❌ SecretName required for rotate action"
            exit 1
        }
        
        Rotate-Secret -Name $SecretName
    }
    
    "backup" {
        Backup-KeyVault
    }
}

Write-Host "`n🏁 Key Vault operation completed!" -ForegroundColor Green
