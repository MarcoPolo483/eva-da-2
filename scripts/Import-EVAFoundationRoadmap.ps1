#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Import EVA Foundation 2.0 enterprise roadmap into Azure DevOps
    
.DESCRIPTION
    This script imports the comprehensive EVA Foundation 2.0 roadmap into Azure DevOps,
    creating a proper enterprise-scale project structure with epics, features, and tasks.
    
.PARAMETER CsvPath
    Path to the EVA Foundation 2.0 roadmap CSV file
    
.PARAMETER Organization
    Azure DevOps organization URL
    
.PARAMETER Project
    Azure DevOps project name
    
.PARAMETER DryRun
    Preview the import without creating actual work items
    
.EXAMPLE
    .\Import-EVAFoundationRoadmap.ps1 -Organization "https://dev.azure.com/myorg" -Project "EVA-Foundation-2.0"
    
.EXAMPLE
    .\Import-EVAFoundationRoadmap.ps1 -DryRun
#>

param(
    [string]$CsvPath = "eva-foundation-2.0-roadmap.csv",
    [string]$Organization = "",
    [string]$Project = "EVA-Foundation-2.0",
    [switch]$DryRun
)

# Ensure Azure DevOps CLI extension is installed
Write-Host "🔧 Checking Azure DevOps CLI extension..." -ForegroundColor Yellow
try {
    az extension show --name azure-devops | Out-Null
    Write-Host "✅ Azure DevOps extension is installed" -ForegroundColor Green
} catch {
    Write-Host "📦 Installing Azure DevOps extension..." -ForegroundColor Yellow
    az extension add --name azure-devops
}

# Configure defaults if provided
if ($Organization -and $Project) {
    Write-Host "⚙️  Configuring Azure DevOps defaults..." -ForegroundColor Yellow
    az devops configure --defaults organization=$Organization project=$Project
}

# Check if CSV file exists
if (-not (Test-Path $CsvPath)) {
    Write-Error "❌ CSV file not found: $CsvPath"
    Write-Host "💡 Make sure the eva-foundation-2.0-roadmap.csv file is in the current directory"
    exit 1
}

Write-Host "📋 EVA Foundation 2.0 - Enterprise Roadmap Import" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "📁 CSV File: $CsvPath" -ForegroundColor White
Write-Host "🏢 Organization: $(if($Organization){"$Organization"}else{"(using current default)"})" -ForegroundColor White
Write-Host "📊 Project: $Project" -ForegroundColor White
Write-Host "🔍 Dry Run: $(if($DryRun){"Yes - Preview only"}else{"No - Will create work items"})" -ForegroundColor White
Write-Host ""

# Import and process CSV
$roadmapItems = Import-Csv -Path $CsvPath
$totalItems = $roadmapItems.Count

Write-Host "📊 Found $totalItems work items to import" -ForegroundColor Green
Write-Host ""

# Group by work item type for summary
$itemsByType = $roadmapItems | Group-Object WorkItemType
foreach ($group in $itemsByType) {
    Write-Host "  $($group.Name): $($group.Count) items" -ForegroundColor Gray
}
Write-Host ""

if ($DryRun) {
    Write-Host "🔍 DRY RUN - Preview of work items to be created:" -ForegroundColor Yellow
    Write-Host "-" * 60 -ForegroundColor Yellow
    
    foreach ($item in $roadmapItems) {
        Write-Host "[$($item.WorkItemType)] $($item.Title)" -ForegroundColor White
        Write-Host "  Area: $($item.Area) | Priority: $($item.Priority) | Effort: $($item.Effort)" -ForegroundColor Gray
        Write-Host "  Tags: $($item.Tags)" -ForegroundColor DarkGray
        Write-Host ""
    }
    
    Write-Host "✅ Dry run complete. Use without -DryRun to import these work items." -ForegroundColor Green
    exit 0
}

# Confirm before proceeding
Write-Host "⚠️  This will create $totalItems work items in your Azure DevOps project." -ForegroundColor Yellow
$confirmation = Read-Host "Do you want to continue? (y/N)"
if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
    Write-Host "❌ Import cancelled by user" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🚀 Starting import..." -ForegroundColor Green
Write-Host ""

$successCount = 0
$errorCount = 0
$currentItem = 0

foreach ($item in $roadmapItems) {
    $currentItem++
    $progress = [math]::Round(($currentItem / $totalItems) * 100, 1)
    
    Write-Host "[$progress%] Creating: [$($item.WorkItemType)] $($item.Title)" -ForegroundColor White
    
    try {
        # Prepare the fields
        $fields = @()
        if ($item.Area) { $fields += "System.AreaPath=$($item.Area)" }
        if ($item.Priority) { $fields += "Microsoft.VSTS.Common.Priority=$($item.Priority)" }
        if ($item.Effort) { $fields += "Microsoft.VSTS.Scheduling.Effort=$($item.Effort)" }
        if ($item.Tags) { $fields += "System.Tags=$($item.Tags)" }
        
        # Create the work item
        $command = @('boards', 'work-item', 'create', '--title', $item.Title, '--type', $item.WorkItemType, '--description', $item.Description)
        if ($fields.Count -gt 0) {
            $command += '--fields'
            $command += ($fields -join ' ')
        }
        
        $result = & az @command 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            $successCount++
            Write-Host "  ✅ Created successfully" -ForegroundColor Green
        } else {
            $errorCount++
            Write-Host "  ❌ Error: $result" -ForegroundColor Red
        }
    } catch {
        $errorCount++
        Write-Host "  ❌ Exception: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Small delay to avoid overwhelming the API
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "🎯 Import Summary" -ForegroundColor Cyan
Write-Host "=" * 30 -ForegroundColor Cyan
Write-Host "✅ Successfully created: $successCount" -ForegroundColor Green
Write-Host "❌ Errors: $errorCount" -ForegroundColor Red
Write-Host "📊 Total processed: $totalItems" -ForegroundColor White

if ($errorCount -eq 0) {
    Write-Host ""
    Write-Host "🎉 EVA Foundation 2.0 roadmap successfully imported!" -ForegroundColor Green
    Write-Host "🌐 View your project in Azure DevOps to see all work items" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "⚠️  Import completed with errors. Review the error messages above." -ForegroundColor Yellow
    Write-Host "💡 Common issues: Missing area paths, invalid field values, or permissions" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Review and organize work items in Azure DevOps" -ForegroundColor White
Write-Host "2. Set up area paths and iterations as needed" -ForegroundColor White
Write-Host "3. Assign work items to team members" -ForegroundColor White
Write-Host "4. Create sprints and plan iterations" -ForegroundColor White
Write-Host "5. Set up dashboards and reporting" -ForegroundColor White
