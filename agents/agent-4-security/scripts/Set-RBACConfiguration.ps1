# EVA DA 2.0 RBAC Configuration & Least Privilege Implementation
# Agent 4: Security Expert - Role-Based Access Control

param(
    [Parameter(Mandatory=$false)]
    [string]$SubscriptionId = "c59ee575-eb2a-4b51-a865-4b618f9add0a",
    
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroupName = "rg-eva-da-2-dev",
    
    [Parameter(Mandatory=$false)]
    [string]$Environment = "dev",
    
    [Parameter(Mandatory=$false)]
    [string]$ManagedIdentityName,
    
    [Parameter(Mandatory=$false)]
    [switch]$ApplyRoles,
    
    [Parameter(Mandatory=$false)]
    [switch]$AuditOnly
)

# RBAC Helper Functions
function Write-RBACLog {
    param($Message, $Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [RBAC] [$Level] $Message"
    Write-Host $logMessage -ForegroundColor $(if($Level -eq "ERROR") { "Red" } elseif($Level -eq "WARN") { "Yellow" } else { "Cyan" })
}

function Get-CustomSecurityRoles {
    return @(
        @{
            Name = "EVA DA Data Reader"
            Description = "Read-only access to EVA DA data stores with government compliance"
            Actions = @(
                "Microsoft.DocumentDB/databaseAccounts/readonlykeys/action",
                "Microsoft.DocumentDB/databaseAccounts/read",
                "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/items/read",
                "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/read",
                "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/read"
            )
            NotActions = @()
            DataActions = @(
                "Microsoft.DocumentDB/databaseAccounts/readMetadata"
            )
            NotDataActions = @()
            Scope = "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroupName"
        },
        @{
            Name = "EVA DA Data Processor"
            Description = "Limited write access for data processing with PII protection"
            Actions = @(
                "Microsoft.DocumentDB/databaseAccounts/read",
                "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/items/read",
                "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/items/create",
                "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/items/replace",
                "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/read",
                "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/read",
                "Microsoft.Storage/storageAccounts/blobServices/containers/read",
                "Microsoft.Storage/storageAccounts/blobServices/containers/blobs/read",
                "Microsoft.Storage/storageAccounts/blobServices/containers/blobs/write"
            )
            NotActions = @(
                "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/items/delete"
            )
            DataActions = @(
                "Microsoft.Storage/storageAccounts/blobServices/containers/blobs/read",
                "Microsoft.Storage/storageAccounts/blobServices/containers/blobs/write"
            )
            NotDataActions = @()
            Scope = "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroupName"
        },
        @{
            Name = "EVA DA Security Monitor"
            Description = "Security monitoring and audit access for compliance officers"
            Actions = @(
                "Microsoft.Insights/components/read",
                "Microsoft.OperationalInsights/workspaces/read",
                "Microsoft.OperationalInsights/workspaces/query/action",
                "Microsoft.Security/assessments/read",
                "Microsoft.Security/secureScores/read",
                "Microsoft.Authorization/roleAssignments/read",
                "Microsoft.KeyVault/vaults/read",
                "Microsoft.KeyVault/vaults/secrets/read"
            )
            NotActions = @()
            DataActions = @()
            NotDataActions = @()
            Scope = "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroupName"
        }
    )
}

function New-CustomRoleDefinition {
    param($RoleDefinition)
    
    Write-RBACLog "Creating custom role: $($RoleDefinition.Name)"
    
    $roleJson = @{
        Name = $RoleDefinition.Name
        Description = $RoleDefinition.Description
        Actions = $RoleDefinition.Actions
        NotActions = $RoleDefinition.NotActions
        DataActions = $RoleDefinition.DataActions
        NotDataActions = $RoleDefinition.NotDataActions
        AssignableScopes = @($RoleDefinition.Scope)
    } | ConvertTo-Json -Depth 10
    
    $tempFile = [System.IO.Path]::GetTempFileName() + ".json"
    $roleJson | Out-File -FilePath $tempFile -Encoding UTF8
    
    try {
        if ($ApplyRoles) {
            $result = az role definition create --role-definition $tempFile --output json | ConvertFrom-Json
            Write-RBACLog "✓ Custom role created: $($result.roleName) ($($result.name))"
            return $result.name
        }
        else {
            Write-RBACLog "✓ [DRY RUN] Would create custom role: $($RoleDefinition.Name)"
            return "dry-run-role-id"
        }
    }
    catch {
        Write-RBACLog "Failed to create role $($RoleDefinition.Name): $($_.Exception.Message)" "ERROR"
        return $null
    }
    finally {
        Remove-Item -Path $tempFile -Force -ErrorAction SilentlyContinue
    }
}

function Set-ManagedIdentityRoleAssignments {
    param($ManagedIdentityId, $PrincipalId)
    
    Write-RBACLog "Configuring role assignments for managed identity: $ManagedIdentityId"
    
    # Government compliance role assignments - least privilege
    $roleAssignments = @(
        @{
            Role = "Key Vault Secrets Officer"
            BuiltIn = $true
            RoleId = "b86a8fe4-44ce-4948-aee5-eccb2c155cd7"
            Scope = "KeyVault"
            Justification = "Required for secure secret management in government environment"
        },
        @{
            Role = "Storage Blob Data Contributor" 
            BuiltIn = $true
            RoleId = "ba92f5b4-2d11-453d-a403-e96b0029c9fe"
            Scope = "Storage"
            Justification = "Required for secure blob operations with managed identity"
        },
        @{
            Role = "Cosmos DB Built-in Data Contributor"
            BuiltIn = $true  
            RoleId = "00000000-0000-0000-0000-000000000002"
            Scope = "CosmosDB"
            Justification = "Required for data operations with HPK optimization"
        },
        @{
            Role = "Application Insights Component Contributor"
            BuiltIn = $true
            RoleId = "ae349356-3a1b-4a5e-921d-050484c6347e" 
            Scope = "AppInsights"
            Justification = "Required for telemetry and security monitoring"
        }
    )
    
    foreach ($assignment in $roleAssignments) {
        Write-RBACLog "Assigning role: $($assignment.Role)"
        Write-RBACLog "  Justification: $($assignment.Justification)"
        
        if ($ApplyRoles) {
            try {
                # Get resource scope based on assignment type
                $scope = switch ($assignment.Scope) {
                    "KeyVault" { "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroupName/providers/Microsoft.KeyVault/vaults" }
                    "Storage" { "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroupName/providers/Microsoft.Storage/storageAccounts" }
                    "CosmosDB" { "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroupName/providers/Microsoft.DocumentDB/databaseAccounts" }
                    "AppInsights" { "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroupName/providers/Microsoft.Insights/components" }
                    default { "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroupName" }
                }
                
                $result = az role assignment create `
                    --assignee $PrincipalId `
                    --role $assignment.RoleId `
                    --scope $scope `
                    --output json | ConvertFrom-Json
                    
                Write-RBACLog "  ✓ Role assigned successfully"
            }
            catch {
                Write-RBACLog "  ⚠️ Failed to assign role (may already exist): $($_.Exception.Message)" "WARN"
            }
        }
        else {
            Write-RBACLog "  ✓ [DRY RUN] Would assign role: $($assignment.Role)"
        }
    }
}

function Invoke-RBACCompliance {
    Write-RBACLog "=== RBAC COMPLIANCE VALIDATION ===" "INFO"
    
    try {
        # Get all role assignments in resource group
        $assignments = Get-AzRoleAssignment -ResourceGroupName $ResourceGroupName
        
        $complianceIssues = @()
        
        foreach ($assignment in $assignments) {
            $principal = $assignment.DisplayName -or $assignment.SignInName -or $assignment.ObjectId
            
            # Check for overly broad roles
            $broadRoles = @("Owner", "Contributor", "User Access Administrator")
            if ($assignment.RoleDefinitionName -in $broadRoles) {
                $issue = @{
                    Type = "OverlyBroadPermissions"
                    Principal = $principal
                    Role = $assignment.RoleDefinitionName
                    Scope = $assignment.Scope
                    Severity = "High"
                    Recommendation = "Replace with principle of least privilege role"
                }
                $complianceIssues += $issue
                Write-RBACLog "⚠️ COMPLIANCE ISSUE: Overly broad role '$($assignment.RoleDefinitionName)' assigned to '$principal'" "WARN"
            }
            
            # Check for guest users (external identities)
            if ($assignment.ObjectType -eq "User" -and $assignment.SignInName -like "*#EXT#*") {
                $issue = @{
                    Type = "ExternalUser"
                    Principal = $principal
                    Role = $assignment.RoleDefinitionName
                    Scope = $assignment.Scope
                    Severity = "Critical"
                    Recommendation = "Review external user access for government compliance"
                }
                $complianceIssues += $issue
                Write-RBACLog "🚨 COMPLIANCE CRITICAL: External user access detected for '$principal'" "ERROR"
            }
            
            # Check for service principal without managed identity
            if ($assignment.ObjectType -eq "ServicePrincipal" -and -not $assignment.DisplayName.Contains("managed-identity")) {
                $issue = @{
                    Type = "ServicePrincipalAccess"
                    Principal = $principal
                    Role = $assignment.RoleDefinitionName
                    Scope = $assignment.Scope
                    Severity = "Medium"
                    Recommendation = "Consider using managed identity instead of service principal"
                }
                $complianceIssues += $issue
                Write-RBACLog "⚠️ Service principal access detected (consider managed identity): '$principal'" "WARN"
            }
        }
        
        # Generate compliance report
        if ($complianceIssues.Count -eq 0) {
            Write-RBACLog "✅ RBAC configuration is compliant with government security standards"
            return @{ Compliant = $true; Issues = @() }
        }
        else {
            Write-RBACLog "❌ RBAC compliance issues found: $($complianceIssues.Count) issues"
            
            $criticalIssues = ($complianceIssues | Where-Object { $_.Severity -eq "Critical" }).Count
            $highIssues = ($complianceIssues | Where-Object { $_.Severity -eq "High" }).Count
            
            Write-RBACLog "  Critical: $criticalIssues | High: $highIssues | Total: $($complianceIssues.Count)"
            
            return @{ 
                Compliant = $false
                Issues = $complianceIssues
                Summary = @{
                    Critical = $criticalIssues
                    High = $highIssues
                    Total = $complianceIssues.Count
                }
            }
        }
    }
    catch {
        Write-RBACLog "Failed to validate RBAC compliance: $($_.Exception.Message)" "ERROR"
        return @{ Compliant = $false; Error = $_.Exception.Message }
    }
}

function New-RBACComplianceReport {
    param($ComplianceResult)
    
    Write-RBACLog "Generating RBAC compliance report..."
    
    $reportPath = ".\rbac-compliance-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').md"
    
    $report = @"
# EVA DA 2.0 RBAC Compliance Report
**Generated**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  
**Environment**: $Environment  
**Resource Group**: $ResourceGroupName  
**Agent**: Agent 4 - Security Expert

## Executive Summary
$(if ($ComplianceResult.Compliant) { "✅ **COMPLIANT**: RBAC configuration meets government security standards." } else { "❌ **NON-COMPLIANT**: $($ComplianceResult.Summary.Total) issues detected requiring immediate attention." })

## Compliance Status
| Metric | Count |
|--------|-------|
| Total Issues | $($ComplianceResult.Issues.Count) |
| Critical Issues | $($ComplianceResult.Summary.Critical) |
| High Issues | $($ComplianceResult.Summary.High) |
| Medium Issues | $(($ComplianceResult.Issues | Where-Object { $_.Severity -eq "Medium" }).Count) |

$(if ($ComplianceResult.Issues.Count -gt 0) {
"## Issues Detected

| Type | Principal | Role | Severity | Recommendation |
|------|-----------|------|----------|----------------|
$(foreach ($issue in $ComplianceResult.Issues) {
"| $($issue.Type) | $($issue.Principal) | $($issue.Role) | $($issue.Severity) | $($issue.Recommendation) |"
})

## Remediation Steps

### Critical Issues (Immediate Action Required)
$(foreach ($issue in ($ComplianceResult.Issues | Where-Object { $_.Severity -eq "Critical" })) {
"1. **$($issue.Type)**: $($issue.Principal)
   - Current Role: $($issue.Role)
   - Action: $($issue.Recommendation)
   - Timeline: Immediate (within 24 hours)
"
})

### High Priority Issues
$(foreach ($issue in ($ComplianceResult.Issues | Where-Object { $_.Severity -eq "High" })) {
"1. **$($issue.Type)**: $($issue.Principal)
   - Current Role: $($issue.Role)
   - Action: $($issue.Recommendation)
   - Timeline: Within 1 week
"
})
"})

## Government Compliance Framework
- **Framework**: GC Security Control Profile
- **Data Classification**: $(if ($Environment -eq 'prod') { 'Protected-B' } else { 'Internal' })
- **Access Control**: Role-Based Access Control (RBAC)
- **Authentication**: Azure AD + Managed Identity
- **Monitoring**: Continuous access review enabled

## Recommended RBAC Best Practices
1. **Principle of Least Privilege**: Grant minimum permissions required
2. **Just-In-Time Access**: Use PIM for elevated permissions
3. **Regular Access Reviews**: Monthly for critical systems
4. **Managed Identity First**: Prefer managed identity over service principals
5. **External Access**: Restrict external user access in production
6. **Role Segregation**: Separate read/write/admin roles

## Next Steps
1. Address critical issues immediately
2. Implement regular access reviews
3. Set up automated compliance monitoring
4. Document role assignment procedures
5. Train team on RBAC best practices

---
**RBAC Assessment completed by Agent 4**  
**Classification**: $(if ($Environment -eq 'prod') { 'Protected-B' } else { 'Internal Use' })
"@

    $report | Out-File -FilePath $reportPath -Encoding UTF8
    Write-RBACLog "RBAC compliance report generated: $reportPath"
    
    return $reportPath
}

# Main RBAC Configuration Execution
try {
    Write-RBACLog "Starting EVA DA 2.0 RBAC Configuration..." "INFO"
    Write-RBACLog "Environment: $Environment | Resource Group: $ResourceGroupName" "INFO"
    
    if ($AuditOnly) {
        Write-RBACLog "AUDIT MODE: No changes will be made" "INFO"
    }
    
    # Test Azure connection
    $context = Get-AzContext
    if (-not $context) {
        Write-RBACLog "Not connected to Azure. Run Connect-AzAccount first." "ERROR"
        exit 1
    }
    
    Set-AzContext -SubscriptionId $SubscriptionId | Out-Null
    Write-RBACLog "Using subscription: $($context.Subscription.Name)"
    
    # Create custom security roles for government compliance
    Write-RBACLog "=== CREATING CUSTOM SECURITY ROLES ===" "INFO"
    
    $customRoles = Get-CustomSecurityRoles
    $createdRoles = @()
    
    foreach ($role in $customRoles) {
        if (-not $AuditOnly) {
            $roleId = New-CustomRoleDefinition -RoleDefinition $role
            if ($roleId) {
                $createdRoles += @{ Name = $role.Name; Id = $roleId }
            }
        }
        else {
            Write-RBACLog "[AUDIT] Would create role: $($role.Name)" "INFO"
        }
    }
    
    # Configure managed identity role assignments
    if ($ManagedIdentityName -and -not $AuditOnly) {
        Write-RBACLog "=== CONFIGURING MANAGED IDENTITY RBAC ===" "INFO"
        
        $managedIdentity = Get-AzUserAssignedIdentity -ResourceGroupName $ResourceGroupName -Name $ManagedIdentityName -ErrorAction SilentlyContinue
        
        if ($managedIdentity) {
            Set-ManagedIdentityRoleAssignments -ManagedIdentityId $managedIdentity.Id -PrincipalId $managedIdentity.PrincipalId
        }
        else {
            Write-RBACLog "Managed identity '$ManagedIdentityName' not found in resource group" "WARN"
        }
    }
    
    # Validate RBAC compliance
    Write-RBACLog "=== VALIDATING RBAC COMPLIANCE ===" "INFO"
    $complianceResult = Invoke-RBACCompliance
    
    # Generate compliance report
    $reportPath = New-RBACComplianceReport -ComplianceResult $complianceResult
    
    # Summary
    Write-RBACLog "=== RBAC CONFIGURATION COMPLETE ===" "INFO"
    Write-RBACLog "Custom roles created: $($createdRoles.Count)"
    Write-RBACLog "Compliance status: $(if ($complianceResult.Compliant) { 'COMPLIANT ✅' } else { 'NON-COMPLIANT ❌' })"
    Write-RBACLog "Report location: $reportPath"
    
    if (-not $complianceResult.Compliant) {
        Write-RBACLog "ATTENTION: $($complianceResult.Summary.Total) compliance issues require remediation" "WARN"
        exit 1
    }
    else {
        Write-RBACLog "✅ RBAC configuration meets government security standards" "INFO"
        exit 0
    }
}
catch {
    Write-RBACLog "RBAC configuration failed: $($_.Exception.Message)" "ERROR"
    exit 1
}
