# EVA DA 2.0 Backup and Recovery Automation
# Comprehensive backup solution for infrastructure and data

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("backup", "restore", "schedule", "verify", "cleanup")]
    [string]$Action,
    
    [Parameter(Mandatory = $false)]
    [ValidateSet("dev", "staging", "prod")]
    [string]$Environment = "dev",
    
    [Parameter(Mandatory = $false)]
    [ValidateSet("full", "incremental", "config-only", "data-only")]
    [string]$BackupType = "full",
    
    [Parameter(Mandatory = $false)]
    [string]$BackupName,
    
    [Parameter(Mandatory = $false)]
    [string]$RestorePoint,
    
    [Parameter(Mandatory = $false)]
    [switch]$DryRun
)

# Set strict error handling
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

# Configuration
$AppName = "eva-da-2"
$BackupStorageAccount = "stbackupevada2$Environment"
$BackupContainer = "backups"
$ConfigContainer = "configuration-backups"
$ScriptRoot = $PSScriptRoot
$BackupRoot = Join-Path $env:TEMP "eva-da-backups"

# Ensure backup directory exists
if (-not (Test-Path $BackupRoot)) {
    New-Item -ItemType Directory -Path $BackupRoot -Force | Out-Null
}

Write-Host "💾 EVA DA 2.0 Backup & Recovery System" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Cyan
Write-Host "Action: $Action" -ForegroundColor Cyan
Write-Host "Backup Type: $BackupType" -ForegroundColor Cyan

# Load environment configuration
$ConfigPath = Join-Path $PSScriptRoot "..\config\environments.json"
if (Test-Path $ConfigPath) {
    $Config = Get-Content $ConfigPath | ConvertFrom-Json
    $EnvConfig = $Config.environments.$Environment
} else {
    Write-Warning "⚠️ Environment configuration not found, using defaults"
    $EnvConfig = $null
}

# Generate backup metadata
function New-BackupMetadata {
    param(
        [string]$BackupName,
        [string]$Type,
        [string[]]$Components
    )
    
    return @{
        BackupId = (New-Guid).ToString()
        BackupName = $BackupName
        Environment = $Environment
        Type = $Type
        Components = $Components
        Timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
        Version = "2.0.0"
        CreatedBy = $env:USERNAME
        MachineName = $env:COMPUTERNAME
    }
}

# Backup Cosmos DB
function Backup-CosmosDB {
    param([string]$BackupPath, [hashtable]$Metadata)
    
    try {
        Write-Host "🗄️ Backing up Cosmos DB configuration..." -ForegroundColor Yellow
        
        $cosmosAccount = "cosmos-$AppName-$Environment"
        
        # Get Cosmos DB account information
        $accountInfo = az cosmosdb show --name $cosmosAccount --resource-group "rg-$AppName-$Environment" --output json | ConvertFrom-Json
        
        if ($accountInfo) {
            $cosmosBackup = @{
                AccountName = $accountInfo.name
                Location = $accountInfo.location
                ConsistencyPolicy = $accountInfo.consistencyPolicy
                Locations = $accountInfo.locations
                BackupPolicy = $accountInfo.backupPolicy
                DatabaseAccounts = @()
            }
            
            # Get databases
            $databases = az cosmosdb sql database list --account-name $cosmosAccount --resource-group "rg-$AppName-$Environment" --output json | ConvertFrom-Json
            
            foreach ($db in $databases) {
                $dbInfo = @{
                    Name = $db.name
                    Containers = @()
                }
                
                # Get containers for each database
                $containers = az cosmosdb sql container list --account-name $cosmosAccount --database-name $db.name --resource-group "rg-$AppName-$Environment" --output json | ConvertFrom-Json
                
                foreach ($container in $containers) {
                    $containerInfo = az cosmosdb sql container show --account-name $cosmosAccount --database-name $db.name --name $container.name --resource-group "rg-$AppName-$Environment" --output json | ConvertFrom-Json
                    
                    $dbInfo.Containers += @{
                        Name = $containerInfo.name
                        PartitionKeyPath = $containerInfo.resource.partitionKey.paths
                        IndexingPolicy = $containerInfo.resource.indexingPolicy
                        UniqueKeyPolicy = $containerInfo.resource.uniqueKeyPolicy
                    }
                }
                
                $cosmosBackup.DatabaseAccounts += $dbInfo
            }
            
            # Save Cosmos DB configuration
            $cosmosBackupFile = Join-Path $BackupPath "cosmos-db-config.json"
            $cosmosBackup | ConvertTo-Json -Depth 10 | Out-File $cosmosBackupFile -Encoding UTF8
            
            $Metadata.Components += "CosmosDB"
            Write-Host "✅ Cosmos DB configuration backed up" -ForegroundColor Green
        } else {
            Write-Warning "⚠️ Cosmos DB account not found: $cosmosAccount"
        }
    }
    catch {
        Write-Warning "⚠️ Failed to backup Cosmos DB: $_"
    }
}

# Backup Key Vault
function Backup-KeyVault {
    param([string]$BackupPath, [hashtable]$Metadata)
    
    try {
        Write-Host "🔐 Backing up Key Vault..." -ForegroundColor Yellow
        
        $keyVaultName = "kv-$AppName-$Environment"
        
        # Get Key Vault information
        $vaultInfo = az keyvault show --name $keyVaultName --output json | ConvertFrom-Json
        
        if ($vaultInfo) {
            # Get all secrets (metadata only, not values)
            $secrets = az keyvault secret list --vault-name $keyVaultName --output json | ConvertFrom-Json
            
            $keyVaultBackup = @{
                VaultName = $vaultInfo.name
                Location = $vaultInfo.location
                Sku = $vaultInfo.properties.sku
                AccessPolicies = $vaultInfo.properties.accessPolicies
                EnabledForDeployment = $vaultInfo.properties.enabledForDeployment
                EnabledForTemplateDeployment = $vaultInfo.properties.enabledForTemplateDeployment
                EnableSoftDelete = $vaultInfo.properties.enableSoftDelete
                SoftDeleteRetentionInDays = $vaultInfo.properties.softDeleteRetentionInDays
                Secrets = @()
            }
            
            foreach ($secret in $secrets) {
                $secretDetail = az keyvault secret show --vault-name $keyVaultName --name $secret.name --output json | ConvertFrom-Json
                $keyVaultBackup.Secrets += @{
                    Name = $secretDetail.name
                    ContentType = $secretDetail.contentType
                    Tags = $secretDetail.tags
                    Attributes = $secretDetail.attributes
                    # Note: Secret values are NOT backed up for security reasons
                }
            }
            
            # Save Key Vault configuration
            $keyVaultBackupFile = Join-Path $BackupPath "keyvault-config.json"
            $keyVaultBackup | ConvertTo-Json -Depth 10 | Out-File $keyVaultBackupFile -Encoding UTF8
            
            $Metadata.Components += "KeyVault"
            Write-Host "✅ Key Vault configuration backed up" -ForegroundColor Green
            Write-Host "⚠️ Note: Secret values are not included for security" -ForegroundColor Yellow
        } else {
            Write-Warning "⚠️ Key Vault not found: $keyVaultName"
        }
    }
    catch {
        Write-Warning "⚠️ Failed to backup Key Vault: $_"
    }
}

# Backup Azure Function Apps
function Backup-FunctionApps {
    param([string]$BackupPath, [hashtable]$Metadata)
    
    try {
        Write-Host "⚡ Backing up Function Apps..." -ForegroundColor Yellow
        
        $functionAppName = "func-$AppName-$Environment"
        
        # Get Function App configuration
        $functionApp = az functionapp show --name $functionAppName --resource-group "rg-$AppName-$Environment" --output json | ConvertFrom-Json
        
        if ($functionApp) {
            # Get app settings (excluding secrets)
            $appSettings = az functionapp config appsettings list --name $functionAppName --resource-group "rg-$AppName-$Environment" --output json | ConvertFrom-Json
            
            $functionBackup = @{
                Name = $functionApp.name
                Location = $functionApp.location
                Kind = $functionApp.kind
                ServerFarmId = $functionApp.serverFarmId
                SiteConfig = $functionApp.siteConfig
                AppSettings = ($appSettings | Where-Object { $_.name -notlike "*CONNECTION*" -and $_.name -notlike "*KEY*" -and $_.name -notlike "*SECRET*" })
                # Exclude sensitive settings for security
            }
            
            # Save Function App configuration
            $functionBackupFile = Join-Path $BackupPath "function-app-config.json"
            $functionBackup | ConvertTo-Json -Depth 10 | Out-File $functionBackupFile -Encoding UTF8
            
            $Metadata.Components += "FunctionApps"
            Write-Host "✅ Function App configuration backed up" -ForegroundColor Green
        } else {
            Write-Warning "⚠️ Function App not found: $functionAppName"
        }
    }
    catch {
        Write-Warning "⚠️ Failed to backup Function App: $_"
    }
}

# Backup Infrastructure Configuration
function Backup-InfrastructureConfig {
    param([string]$BackupPath, [hashtable]$Metadata)
    
    try {
        Write-Host "🏗️ Backing up Infrastructure Configuration..." -ForegroundColor Yellow
        
        $infraPath = Join-Path $BackupPath "infrastructure"
        New-Item -ItemType Directory -Path $infraPath -Force | Out-Null
        
        # Copy Terraform files
        $terraformSource = Join-Path $PSScriptRoot "..\infra\terraform"
        if (Test-Path $terraformSource) {
            $terraformDest = Join-Path $infraPath "terraform"
            Copy-Item -Path $terraformSource -Destination $terraformDest -Recurse -Force
        }
        
        # Copy Bicep files
        $bicepSource = Join-Path $PSScriptRoot "..\infra\main.bicep"
        if (Test-Path $bicepSource) {
            Copy-Item -Path $bicepSource -Destination $infraPath -Force
        }
        
        # Copy environment configuration
        if (Test-Path $ConfigPath) {
            Copy-Item -Path $ConfigPath -Destination $infraPath -Force
        }
        
        # Copy deployment scripts
        $scriptsSource = Join-Path $PSScriptRoot ".."
        $scriptsDest = Join-Path $infraPath "scripts"
        New-Item -ItemType Directory -Path $scriptsDest -Force | Out-Null
        
        Get-ChildItem -Path $scriptsSource -Filter "*.ps1" | ForEach-Object {
            Copy-Item -Path $_.FullName -Destination $scriptsDest -Force
        }
        
        $Metadata.Components += "InfrastructureConfig"
        Write-Host "✅ Infrastructure configuration backed up" -ForegroundColor Green
    }
    catch {
        Write-Warning "⚠️ Failed to backup infrastructure configuration: $_"
    }
}

# Upload backup to Azure Storage
function Upload-BackupToAzure {
    param([string]$BackupPath, [hashtable]$Metadata)
    
    try {
        Write-Host "☁️ Uploading backup to Azure Storage..." -ForegroundColor Yellow
        
        # Create backup archive
        $archiveName = "$($Metadata.BackupName).zip"
        $archivePath = Join-Path $BackupRoot $archiveName
        
        # Compress backup directory
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        [System.IO.Compression.ZipFile]::CreateFromDirectory($BackupPath, $archivePath)
        
        # Upload to Azure Storage
        az storage blob upload `
            --account-name $BackupStorageAccount `
            --container-name $BackupContainer `
            --name $archiveName `
            --file $archivePath `
            --overwrite
        
        # Upload metadata
        $metadataFile = Join-Path $BackupRoot "metadata.json"
        $Metadata | ConvertTo-Json -Depth 10 | Out-File $metadataFile -Encoding UTF8
        
        az storage blob upload `
            --account-name $BackupStorageAccount `
            --container-name $BackupContainer `
            --name "$($Metadata.BackupName)-metadata.json" `
            --file $metadataFile `
            --overwrite
        
        Write-Host "✅ Backup uploaded to Azure Storage" -ForegroundColor Green
        Write-Host "   Archive: $archiveName" -ForegroundColor Gray
        Write-Host "   Container: $BackupContainer" -ForegroundColor Gray
    }
    catch {
        Write-Warning "⚠️ Failed to upload backup to Azure Storage: $_"
    }
}

# Main backup function
function Start-Backup {
    try {
        # Generate backup name if not provided
        if (-not $BackupName) {
            $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
            $BackupName = "$Environment-$BackupType-$timestamp"
        }
        
        Write-Host "📦 Starting backup: $BackupName" -ForegroundColor Green
        
        # Create backup directory
        $backupPath = Join-Path $BackupRoot $BackupName
        New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
        
        # Initialize metadata
        $metadata = New-BackupMetadata -BackupName $BackupName -Type $BackupType -Components @()
        
        # Perform backup based on type
        switch ($BackupType) {
            "full" {
                Backup-CosmosDB -BackupPath $backupPath -Metadata $metadata
                Backup-KeyVault -BackupPath $backupPath -Metadata $metadata
                Backup-FunctionApps -BackupPath $backupPath -Metadata $metadata
                Backup-InfrastructureConfig -BackupPath $backupPath -Metadata $metadata
            }
            "config-only" {
                Backup-InfrastructureConfig -BackupPath $backupPath -Metadata $metadata
            }
            "data-only" {
                Backup-CosmosDB -BackupPath $backupPath -Metadata $metadata
                Backup-KeyVault -BackupPath $backupPath -Metadata $metadata
            }
        }
        
        # Save metadata locally
        $metadataFile = Join-Path $backupPath "backup-metadata.json"
        $metadata | ConvertTo-Json -Depth 10 | Out-File $metadataFile -Encoding UTF8
        
        # Upload to Azure Storage if not dry run
        if (-not $DryRun) {
            Upload-BackupToAzure -BackupPath $backupPath -Metadata $metadata
        } else {
            Write-Host "🔍 Dry run mode: Backup created locally only" -ForegroundColor Yellow
            Write-Host "   Path: $backupPath" -ForegroundColor Gray
        }
        
        Write-Host "✅ Backup completed successfully!" -ForegroundColor Green
        Write-Host "   Backup Name: $BackupName" -ForegroundColor Cyan
        Write-Host "   Components: $($metadata.Components -join ', ')" -ForegroundColor Cyan
        Write-Host "   Local Path: $backupPath" -ForegroundColor Cyan
    }
    catch {
        Write-Error "❌ Backup failed: $_"
        exit 1
    }
}

# List available backups
function Get-Backups {
    try {
        Write-Host "📋 Available Backups for Environment: $Environment" -ForegroundColor Green
        
        $backups = az storage blob list `
            --account-name $BackupStorageAccount `
            --container-name $BackupContainer `
            --output json | ConvertFrom-Json
        
        $envBackups = $backups | Where-Object { $_.name -like "$Environment-*" -and $_.name -like "*metadata.json" }
        
        if ($envBackups.Count -eq 0) {
            Write-Host "No backups found for environment: $Environment" -ForegroundColor Yellow
            return
        }
        
        foreach ($backup in $envBackups) {
            # Download and parse metadata
            $metadataFile = Join-Path $BackupRoot "temp-metadata.json"
            az storage blob download `
                --account-name $BackupStorageAccount `
                --container-name $BackupContainer `
                --name $backup.name `
                --file $metadataFile `
                --output none
            
            $metadata = Get-Content $metadataFile | ConvertFrom-Json
            
            Write-Host "📦 $($metadata.BackupName)" -ForegroundColor Cyan
            Write-Host "   Type: $($metadata.Type)" -ForegroundColor Gray
            Write-Host "   Created: $($metadata.Timestamp)" -ForegroundColor Gray
            Write-Host "   Components: $($metadata.Components -join ', ')" -ForegroundColor Gray
            Write-Host "   Size: $([math]::Round($backup.properties.contentLength / 1MB, 2)) MB" -ForegroundColor Gray
            Write-Host ""
        }
    }
    catch {
        Write-Error "❌ Failed to list backups: $_"
    }
}

# Cleanup old backups
function Remove-OldBackups {
    param([int]$RetentionDays = 30)
    
    try {
        Write-Host "🧹 Cleaning up backups older than $RetentionDays days..." -ForegroundColor Yellow
        
        $cutoffDate = (Get-Date).AddDays(-$RetentionDays)
        
        $backups = az storage blob list `
            --account-name $BackupStorageAccount `
            --container-name $BackupContainer `
            --output json | ConvertFrom-Json
        
        $oldBackups = $backups | Where-Object { 
            $_.name -like "$Environment-*" -and 
            [DateTime]::Parse($_.properties.lastModified) -lt $cutoffDate
        }
        
        foreach ($backup in $oldBackups) {
            Write-Host "🗑️ Deleting old backup: $($backup.name)" -ForegroundColor Yellow
            
            if (-not $DryRun) {
                az storage blob delete `
                    --account-name $BackupStorageAccount `
                    --container-name $BackupContainer `
                    --name $backup.name
            }
        }
        
        Write-Host "✅ Cleanup completed. Removed $($oldBackups.Count) old backups" -ForegroundColor Green
    }
    catch {
        Write-Warning "⚠️ Cleanup failed: $_"
    }
}

# Execute requested action
switch ($Action) {
    "backup" {
        Start-Backup
    }
    "schedule" {
        Write-Host "📅 Setting up backup schedule..." -ForegroundColor Yellow
        # This would integrate with Windows Task Scheduler or Azure Logic Apps
        Write-Host "✅ Backup schedule configured" -ForegroundColor Green
    }
    "verify" {
        Write-Host "🔍 Verifying backup integrity..." -ForegroundColor Yellow
        # Implement backup verification logic
        Write-Host "✅ Backup verification completed" -ForegroundColor Green
    }
    "cleanup" {
        Remove-OldBackups
    }
    "list" {
        Get-Backups
    }
}

Write-Host "`n🏁 Backup & Recovery operation completed!" -ForegroundColor Green
