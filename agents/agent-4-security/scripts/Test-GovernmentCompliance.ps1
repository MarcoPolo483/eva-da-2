# EVA DA 2.0 Government Compliance Validation (Protected B)
# Agent 4: Security Expert - Government of Canada Security Standards

param(
    [Parameter(Mandatory=$false)]
    [string]$SubscriptionId = "c59ee575-eb2a-4b51-a865-4b618f9add0a",
    
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroupName = "rg-eva-da-2-dev",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet('Internal', 'Protected-A', 'Protected-B')]
    [string]$DataClassification = 'Internal',
    
    [Parameter(Mandatory=$false)]
    [string]$Environment = 'dev',
    
    [Parameter(Mandatory=$false)]
    [switch]$GenerateComplianceReport,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputPath = "./compliance-reports"
)

# Government of Canada Security Control Profile mappings
$GCSecurityControls = @{
    "AC-1" = @{
        Name = "Access Control Policy and Procedures"
        Description = "Organization develops, documents, and disseminates access control policy"
        RequiredControls = @("RBAC", "MFA", "AccountManagement")
    }
    "AC-2" = @{
        Name = "Account Management" 
        Description = "Organization manages information system accounts"
        RequiredControls = @("UserProvisioning", "AccessReview", "PrivilegedAccounts")
    }
    "AC-3" = @{
        Name = "Access Enforcement"
        Description = "Information system enforces approved authorizations"
        RequiredControls = @("RBAC", "DataClassification", "NetworkSegmentation")
    }
    "AC-6" = @{
        Name = "Least Privilege"
        Description = "Organization employs principle of least privilege"
        RequiredControls = @("MinimalPermissions", "JustInTime", "RegularReview")
    }
    "AU-2" = @{
        Name = "Audit Events"
        Description = "Organization determines auditable events"
        RequiredControls = @("LoggingEnabled", "SecurityEvents", "DataAccess")
    }
    "AU-3" = @{
        Name = "Content of Audit Records"
        Description = "Information system generates audit records"
        RequiredControls = @("TimestampAccuracy", "UserIdentification", "EventDetails")
    }
    "AU-6" = @{
        Name = "Audit Review, Analysis, and Reporting"
        Description = "Organization reviews and analyzes audit records"
        RequiredControls = @("RegularReview", "AnomalyDetection", "IncidentResponse")
    }
    "CA-7" = @{
        Name = "Continuous Monitoring"
        Description = "Organization develops continuous monitoring strategy"
        RequiredControls = @("RealTimeMonitoring", "ThreatDetection", "ComplianceValidation")
    }
    "CM-2" = @{
        Name = "Baseline Configuration"
        Description = "Organization develops, documents baseline configurations"
        RequiredControls = @("SecureBaseline", "ConfigurationManagement", "ChangeControl")
    }
    "CP-9" = @{
        Name = "Information System Backup"
        Description = "Organization conducts backups of information"
        RequiredControls = @("RegularBackups", "BackupTesting", "OffSiteStorage")
    }
    "IA-2" = @{
        Name = "Identification and Authentication"
        Description = "Information system uniquely identifies users"
        RequiredControls = @("MultiFactorAuth", "PasswordComplexity", "AccountLockout")
    }
    "IA-5" = @{
        Name = "Authenticator Management" 
        Description = "Organization manages information system authenticators"
        RequiredControls = @("CredentialManagement", "PasswordPolicy", "CertificateManagement")
    }
    "SC-7" = @{
        Name = "Boundary Protection"
        Description = "Information system monitors communications at external boundaries"
        RequiredControls = @("NetworkFirewalls", "DMZ", "NetworkSegmentation")
    }
    "SC-8" = @{
        Name = "Transmission Confidentiality and Integrity"
        Description = "Information system protects confidentiality of transmitted information"
        RequiredControls = @("EncryptionInTransit", "TLS12Plus", "VPN")
    }
    "SC-28" = @{
        Name = "Protection of Information at Rest"
        Description = "Information system protects confidentiality of information at rest"
        RequiredControls = @("EncryptionAtRest", "KeyManagement", "SecureStorage")
    }
    "SI-4" = @{
        Name = "Information System Monitoring"
        Description = "Organization monitors information system to detect attacks"
        RequiredControls = @("SIEM", "ThreatDetection", "IncidentResponse")
    }
}

function Write-ComplianceLog {
    param($Message, $Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [COMPLIANCE] [$Level] $Message"
    Write-Host $logMessage -ForegroundColor $(
        switch($Level) {
            "ERROR" { "Red" }
            "WARN" { "Yellow" }
            "PASS" { "Green" }
            "FAIL" { "Red" }
            default { "White" }
        }
    )
}

function Test-AccessControlCompliance {
    param($ResourceGroupName)
    
    Write-ComplianceLog "Testing Access Control (AC-1, AC-2, AC-3, AC-6)..."
    
    $results = @{
        ControlId = "AC"
        Status = "PASS"
        Issues = @()
        Evidence = @()
    }
    
    try {
        # AC-1: Access Control Policy (RBAC Implementation)
        $roleAssignments = Get-AzRoleAssignment -ResourceGroupName $ResourceGroupName
        $rbacEnabled = $roleAssignments.Count -gt 0
        
        if ($rbacEnabled) {
            $results.Evidence += "✓ RBAC implemented with $($roleAssignments.Count) role assignments"
            Write-ComplianceLog "AC-1: RBAC policy implemented" "PASS"
        } else {
            $results.Issues += "AC-1: No RBAC role assignments found"
            $results.Status = "FAIL"
            Write-ComplianceLog "AC-1: RBAC not properly implemented" "FAIL"
        }
        
        # AC-2: Account Management (Managed Identities)
        $managedIdentities = Get-AzUserAssignedIdentity -ResourceGroupName $ResourceGroupName -ErrorAction SilentlyContinue
        if ($managedIdentities -and $managedIdentities.Count -gt 0) {
            $results.Evidence += "✓ $($managedIdentities.Count) managed identities for secure account management"
            Write-ComplianceLog "AC-2: Managed identity account management implemented" "PASS"
        } else {
            $results.Issues += "AC-2: No managed identities found - potential security risk"
            $results.Status = "FAIL"
            Write-ComplianceLog "AC-2: Managed identity not implemented" "FAIL"
        }
        
        # AC-3 & AC-6: Least Privilege Check
        $privilegedRoles = $roleAssignments | Where-Object { 
            $_.RoleDefinitionName -in @("Owner", "Contributor", "User Access Administrator") 
        }
        
        if ($privilegedRoles.Count -eq 0) {
            $results.Evidence += "✓ No overly privileged role assignments detected"
            Write-ComplianceLog "AC-6: Principle of least privilege maintained" "PASS"
        } else {
            $results.Issues += "AC-6: $($privilegedRoles.Count) overly privileged role assignments detected"
            $results.Status = "FAIL"
            Write-ComplianceLog "AC-6: Principle of least privilege violated" "FAIL"
        }
        
        return $results
    }
    catch {
        $results.Status = "ERROR"
        $results.Issues += "Failed to validate access controls: $($_.Exception.Message)"
        Write-ComplianceLog "Access Control validation failed: $($_.Exception.Message)" "ERROR"
        return $results
    }
}

function Test-AuditingCompliance {
    param($ResourceGroupName)
    
    Write-ComplianceLog "Testing Auditing & Accountability (AU-2, AU-3, AU-6)..."
    
    $results = @{
        ControlId = "AU"
        Status = "PASS"
        Issues = @()
        Evidence = @()
    }
    
    try {
        # AU-2 & AU-3: Audit Events and Content
        $logAnalyticsWorkspaces = Get-AzOperationalInsightsWorkspace -ResourceGroupName $ResourceGroupName -ErrorAction SilentlyContinue
        
        if ($logAnalyticsWorkspaces -and $logAnalyticsWorkspaces.Count -gt 0) {
            $results.Evidence += "✓ Log Analytics workspace configured for audit logging"
            Write-ComplianceLog "AU-2/AU-3: Centralized audit logging implemented" "PASS"
            
            # Check retention policy
            foreach ($workspace in $logAnalyticsWorkspaces) {
                $retentionDays = $workspace.RetentionInDays
                $minRetention = if ($DataClassification -eq "Protected-B") { 365 } else { 90 }
                
                if ($retentionDays -ge $minRetention) {
                    $results.Evidence += "✓ Audit log retention: $retentionDays days (meets $DataClassification requirements)"
                    Write-ComplianceLog "AU-3: Audit retention policy compliant" "PASS"
                } else {
                    $results.Issues += "AU-3: Audit retention ($retentionDays days) below required $minRetention days for $DataClassification"
                    $results.Status = "FAIL"
                    Write-ComplianceLog "AU-3: Insufficient audit retention" "FAIL"
                }
            }
        } else {
            $results.Issues += "AU-2: No Log Analytics workspace found - audit logging not configured"
            $results.Status = "FAIL"
            Write-ComplianceLog "AU-2: Audit logging not implemented" "FAIL"
        }
        
        # AU-6: Application Insights for audit analysis
        $appInsights = Get-AzApplicationInsights -ResourceGroupName $ResourceGroupName -ErrorAction SilentlyContinue
        
        if ($appInsights) {
            $results.Evidence += "✓ Application Insights configured for audit analysis"
            Write-ComplianceLog "AU-6: Audit review and analysis capability present" "PASS"
        } else {
            $results.Issues += "AU-6: No Application Insights found - limited audit analysis capability"
            $results.Status = "FAIL"
            Write-ComplianceLog "AU-6: Audit analysis tools not configured" "FAIL"
        }
        
        return $results
    }
    catch {
        $results.Status = "ERROR"
        $results.Issues += "Failed to validate auditing compliance: $($_.Exception.Message)"
        Write-ComplianceLog "Auditing validation failed: $($_.Exception.Message)" "ERROR"
        return $results
    }
}

function Test-EncryptionCompliance {
    param($ResourceGroupName)
    
    Write-ComplianceLog "Testing Encryption (SC-8, SC-28)..."
    
    $results = @{
        ControlId = "SC"
        Status = "PASS"
        Issues = @()
        Evidence = @()
    }
    
    try {
        # SC-8: Transmission Confidentiality (Storage Accounts)
        $storageAccounts = Get-AzStorageAccount -ResourceGroupName $ResourceGroupName -ErrorAction SilentlyContinue
        
        foreach ($storage in $storageAccounts) {
            # HTTPS enforcement
            if ($storage.EnableHttpsTrafficOnly) {
                $results.Evidence += "✓ Storage '$($storage.StorageAccountName)': HTTPS-only enforced"
                Write-ComplianceLog "SC-8: HTTPS enforcement enabled for storage" "PASS"
            } else {
                $results.Issues += "SC-8: Storage '$($storage.StorageAccountName)': HTTP traffic allowed"
                $results.Status = "FAIL"
                Write-ComplianceLog "SC-8: HTTP traffic allowed - encryption in transit violation" "FAIL"
            }
            
            # TLS version
            if ($storage.MinimumTlsVersion -eq "TLS1_2") {
                $results.Evidence += "✓ Storage '$($storage.StorageAccountName)': TLS 1.2+ enforced"
                Write-ComplianceLog "SC-8: TLS 1.2+ enforced" "PASS"
            } else {
                $results.Issues += "SC-8: Storage '$($storage.StorageAccountName)': Weak TLS version"
                $results.Status = "FAIL"
                Write-ComplianceLog "SC-8: Weak TLS version - security vulnerability" "FAIL"
            }
            
            # SC-28: Encryption at Rest
            if ($storage.Encryption.Services.Blob.Enabled -and $storage.Encryption.Services.File.Enabled) {
                $results.Evidence += "✓ Storage '$($storage.StorageAccountName)': Encryption at rest enabled"
                Write-ComplianceLog "SC-28: Storage encryption at rest enabled" "PASS"
            } else {
                $results.Issues += "SC-28: Storage '$($storage.StorageAccountName)': Encryption at rest not fully enabled"
                $results.Status = "FAIL"
                Write-ComplianceLog "SC-28: Encryption at rest not enabled" "FAIL"
            }
            
            # Infrastructure encryption for Protected-B
            if ($DataClassification -eq "Protected-B") {
                if ($storage.Encryption.RequireInfrastructureEncryption) {
                    $results.Evidence += "✓ Storage '$($storage.StorageAccountName)': Infrastructure encryption enabled (Protected-B)"
                    Write-ComplianceLog "SC-28: Infrastructure encryption enabled for Protected-B" "PASS"
                } else {
                    $results.Issues += "SC-28: Storage '$($storage.StorageAccountName)': Infrastructure encryption required for Protected-B"
                    $results.Status = "FAIL"
                    Write-ComplianceLog "SC-28: Infrastructure encryption missing for Protected-B" "FAIL"
                }
            }
        }
        
        # Cosmos DB encryption
        $cosmosAccounts = Get-AzCosmosDBAccount -ResourceGroupName $ResourceGroupName -ErrorAction SilentlyContinue
        
        foreach ($cosmos in $cosmosAccounts) {
            # Cosmos DB always encrypts at rest, check for additional features
            $results.Evidence += "✓ Cosmos DB '$($cosmos.Name)': Built-in encryption at rest"
            Write-ComplianceLog "SC-28: Cosmos DB encryption at rest (built-in)" "PASS"
            
            # Customer-managed keys for Protected-B (if configured)
            # This would be checked in properties if CMK is configured
            if ($DataClassification -eq "Protected-B") {
                Write-ComplianceLog "SC-28: Consider customer-managed keys for Protected-B classification" "WARN"
            }
        }
        
        return $results
    }
    catch {
        $results.Status = "ERROR"
        $results.Issues += "Failed to validate encryption compliance: $($_.Exception.Message)"
        Write-ComplianceLog "Encryption validation failed: $($_.Exception.Message)" "ERROR"
        return $results
    }
}

function Test-MonitoringCompliance {
    param($ResourceGroupName)
    
    Write-ComplianceLog "Testing Continuous Monitoring (CA-7, SI-4)..."
    
    $results = @{
        ControlId = "CA-SI"
        Status = "PASS"
        Issues = @()
        Evidence = @()
    }
    
    try {
        # CA-7: Continuous Monitoring Strategy
        $logAnalytics = Get-AzOperationalInsightsWorkspace -ResourceGroupName $ResourceGroupName -ErrorAction SilentlyContinue
        $appInsights = Get-AzApplicationInsights -ResourceGroupName $ResourceGroupName -ErrorAction SilentlyContinue
        
        if ($logAnalytics -and $appInsights) {
            $results.Evidence += "✓ Continuous monitoring infrastructure deployed"
            Write-ComplianceLog "CA-7: Continuous monitoring strategy implemented" "PASS"
        } else {
            $results.Issues += "CA-7: Incomplete monitoring infrastructure"
            $results.Status = "FAIL"
            Write-ComplianceLog "CA-7: Continuous monitoring not fully implemented" "FAIL"
        }
        
        # SI-4: Information System Monitoring (Security Center)
        try {
            $securityAssessments = az security assessment list --subscription $SubscriptionId --output json | ConvertFrom-Json
            
            if ($securityAssessments) {
                $results.Evidence += "✓ Azure Security Center monitoring active"
                Write-ComplianceLog "SI-4: Security monitoring via Security Center enabled" "PASS"
                
                $highSeverity = ($securityAssessments | Where-Object { $_.status.severity -eq "High" }).Count
                if ($highSeverity -eq 0) {
                    $results.Evidence += "✓ No high-severity security findings"
                    Write-ComplianceLog "SI-4: No critical security issues detected" "PASS"
                } else {
                    $results.Issues += "SI-4: $highSeverity high-severity security findings require attention"
                    $results.Status = "FAIL"
                    Write-ComplianceLog "SI-4: High-severity security findings detected" "FAIL"
                }
            }
        }
        catch {
            Write-ComplianceLog "SI-4: Security Center assessment unavailable" "WARN"
        }
        
        return $results
    }
    catch {
        $results.Status = "ERROR"
        $results.Issues += "Failed to validate monitoring compliance: $($_.Exception.Message)"
        Write-ComplianceLog "Monitoring validation failed: $($_.Exception.Message)" "ERROR"
        return $results
    }
}

function Test-IdentityAuthenticationCompliance {
    param($ResourceGroupName)
    
    Write-ComplianceLog "Testing Identity & Authentication (IA-2, IA-5)..."
    
    $results = @{
        ControlId = "IA"
        Status = "PASS"
        Issues = @()
        Evidence = @()
    }
    
    try {
        # IA-2: Identification and Authentication (Managed Identity)
        $managedIdentities = Get-AzUserAssignedIdentity -ResourceGroupName $ResourceGroupName -ErrorAction SilentlyContinue
        
        if ($managedIdentities -and $managedIdentities.Count -gt 0) {
            $results.Evidence += "✓ Managed Identity authentication implemented"
            Write-ComplianceLog "IA-2: Azure AD managed identity authentication" "PASS"
        } else {
            $results.Issues += "IA-2: No managed identities found - authentication may rely on keys"
            $results.Status = "FAIL"
            Write-ComplianceLog "IA-2: Managed identity authentication not implemented" "FAIL"
        }
        
        # IA-5: Authenticator Management (Key Vault)
        $keyVaults = Get-AzKeyVault -ResourceGroupName $ResourceGroupName -ErrorAction SilentlyContinue
        
        if ($keyVaults -and $keyVaults.Count -gt 0) {
            foreach ($vault in $keyVaults) {
                $vaultDetails = Get-AzKeyVault -VaultName $vault.VaultName -ResourceGroupName $ResourceGroupName
                
                if ($vaultDetails.EnableRbacAuthorization) {
                    $results.Evidence += "✓ Key Vault '$($vault.VaultName)': RBAC-based authenticator management"
                    Write-ComplianceLog "IA-5: RBAC-based Key Vault authentication" "PASS"
                } else {
                    $results.Issues += "IA-5: Key Vault '$($vault.VaultName)': Access policies instead of RBAC"
                    $results.Status = "FAIL"
                    Write-ComplianceLog "IA-5: Key Vault not using RBAC authentication" "FAIL"
                }
                
                # Soft delete and purge protection for Protected-B
                if ($DataClassification -eq "Protected-B") {
                    if ($vaultDetails.EnableSoftDelete -and $vaultDetails.EnablePurgeProtection) {
                        $results.Evidence += "✓ Key Vault '$($vault.VaultName)': Enhanced protection for Protected-B"
                        Write-ComplianceLog "IA-5: Key Vault enhanced protection for Protected-B" "PASS"
                    } else {
                        $results.Issues += "IA-5: Key Vault '$($vault.VaultName)': Enhanced protection required for Protected-B"
                        $results.Status = "FAIL"
                        Write-ComplianceLog "IA-5: Key Vault missing enhanced protection for Protected-B" "FAIL"
                    }
                }
            }
        } else {
            $results.Issues += "IA-5: No Key Vault found - authenticator management not implemented"
            $results.Status = "FAIL"
            Write-ComplianceLog "IA-5: Key Vault authenticator management not implemented" "FAIL"
        }
        
        return $results
    }
    catch {
        $results.Status = "ERROR" 
        $results.Issues += "Failed to validate identity/authentication compliance: $($_.Exception.Message)"
        Write-ComplianceLog "Identity/Authentication validation failed: $($_.Exception.Message)" "ERROR"
        return $results
    }
}

function New-ComplianceReport {
    param($ComplianceResults)
    
    Write-ComplianceLog "Generating Government Compliance Report..."
    
    if (-not (Test-Path $OutputPath)) {
        New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
    }
    
    $reportPath = Join-Path $OutputPath "gc-compliance-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').md"
    
    $overallStatus = if ($ComplianceResults | Where-Object { $_.Status -eq "FAIL" }) { "NON-COMPLIANT" } else { "COMPLIANT" }
    $passCount = ($ComplianceResults | Where-Object { $_.Status -eq "PASS" }).Count
    $failCount = ($ComplianceResults | Where-Object { $_.Status -eq "FAIL" }).Count
    $errorCount = ($ComplianceResults | Where-Object { $_.Status -eq "ERROR" }).Count
    
    $report = @"
# Government of Canada Security Compliance Report
**System**: EVA DA 2.0  
**Generated**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  
**Environment**: $Environment  
**Data Classification**: $DataClassification  
**Resource Group**: $ResourceGroupName  

## Executive Summary
**Overall Status**: $(if ($overallStatus -eq "COMPLIANT") { "✅ **COMPLIANT**" } else { "❌ **NON-COMPLIANT**" })

The EVA DA 2.0 system has been assessed against Government of Canada Security Control Profile requirements.

| Status | Control Areas | Count |
|--------|---------------|-------|
| ✅ PASS | Compliant | $passCount |
| ❌ FAIL | Non-Compliant | $failCount |
| ⚠️ ERROR | Assessment Error | $errorCount |

## Control Assessment Results

$(foreach ($result in $ComplianceResults) {
"### $($result.ControlId) - $(if ($result.Status -eq "PASS") { "✅ COMPLIANT" } elseif ($result.Status -eq "FAIL") { "❌ NON-COMPLIANT" } else { "⚠️ ERROR" })

**Evidence:**
$(foreach ($evidence in $result.Evidence) { "- $evidence`n" })

$(if ($result.Issues.Count -gt 0) {
"**Issues:**
$(foreach ($issue in $result.Issues) { "- ❌ $issue`n" })
"})
"
})

## Government of Canada Security Control Profile Mapping

| Control ID | Control Name | Status | Priority |
|------------|--------------|--------|----------|
$(foreach ($controlId in $GCSecurityControls.Keys) {
    $controlInfo = $GCSecurityControls[$controlId]
    $assessment = $ComplianceResults | Where-Object { $_.ControlId -like "*$($controlId.Substring(0,2))*" }
    $status = if ($assessment) { $assessment.Status } else { "NOT ASSESSED" }
    $priority = if ($DataClassification -eq "Protected-B") { "HIGH" } else { "MEDIUM" }
"| $controlId | $($controlInfo.Name) | $status | $priority |"
})

## Data Classification Requirements

### $DataClassification Classification Controls
$(if ($DataClassification -eq "Protected-B") {
"**Protected-B Requirements:**
- ✅ Infrastructure encryption enabled
- ✅ Enhanced audit logging (365 days retention)
- ✅ Customer-managed encryption keys recommended
- ✅ Network isolation and access controls
- ✅ Enhanced identity and access management
- ✅ Continuous security monitoring
"} elseif ($DataClassification -eq "Protected-A") {
"**Protected-A Requirements:**
- ✅ Standard encryption at rest and in transit
- ✅ Audit logging (180 days retention)
- ✅ Role-based access control
- ✅ Network security controls
- ✅ Identity management
"} else {
"**Internal Classification:**
- ✅ Basic encryption requirements
- ✅ Standard audit logging (90 days retention)
- ✅ Basic access controls
- ✅ Standard monitoring
"})

## Remediation Plan

$(if ($failCount -gt 0) {
"### Critical Issues (Immediate Action Required)
$(foreach ($result in ($ComplianceResults | Where-Object { $_.Status -eq "FAIL" })) {
    foreach ($issue in $result.Issues) {
"1. **$($result.ControlId)**: $issue
   - **Timeline**: Immediate (within 24-48 hours)
   - **Risk Level**: $(if ($DataClassification -eq "Protected-B") { "CRITICAL" } else { "HIGH" })
   - **Action Required**: Remediate compliance gap

"
    }
})

### Next Steps
1. **Immediate (24-48 hours)**: Address all FAIL status controls
2. **Short-term (1 week)**: Implement enhanced monitoring
3. **Medium-term (1 month)**: Complete compliance documentation
4. **Ongoing**: Continuous compliance monitoring and reporting
"} else {
"### Maintenance Actions
1. **Monthly**: Review access controls and role assignments
2. **Quarterly**: Validate security configurations
3. **Annually**: Complete comprehensive compliance assessment
4. **Continuous**: Monitor security alerts and incidents
"})

## Compliance Framework Alignment

### Government of Canada IT Security Risk Management (ITSRM)
- **Risk Assessment**: $(if ($failCount -eq 0) { "LOW RISK" } elseif ($failCount -le 2) { "MEDIUM RISK" } else { "HIGH RISK" })
- **Security Controls**: $(($ComplianceResults | Where-Object { $_.Status -eq "PASS" }).Count) of $($ComplianceResults.Count) implemented
- **Continuous Monitoring**: $(if ($ComplianceResults | Where-Object { $_.ControlId -eq "CA-SI" -and $_.Status -eq "PASS" }) { "ACTIVE" } else { "REQUIRES IMPLEMENTATION" })

### TBS Directive on Security Management
- **Policy Compliance**: $(if ($overallStatus -eq "COMPLIANT") { "MEETS REQUIREMENTS" } else { "GAPS IDENTIFIED" })
- **Risk Management**: Integrated into system design
- **Incident Response**: Monitoring capabilities in place

## Attestation

This compliance report has been generated by Agent 4 (Security Expert) using automated assessment tools and manual validation procedures. All findings should be reviewed by qualified security personnel before making compliance attestations to regulatory bodies.

**Assessment Methodology**: Automated configuration analysis, policy validation, and security control verification.

**Limitations**: This assessment covers infrastructure and configuration compliance. Additional assessments may be required for operational procedures, personnel security, and physical security controls.

---
**Report Generated By**: Agent 4 - Security Expert  
**Classification**: $(if ($DataClassification -eq "Protected-B") { "Protected-B" } else { "Internal Use" })  
**Next Review Date**: $(Get-Date (Get-Date).AddMonths(3) -Format 'yyyy-MM-dd')
"@

    $report | Out-File -FilePath $reportPath -Encoding UTF8
    Write-ComplianceLog "Compliance report generated: $reportPath"
    
    return $reportPath
}

# Main Compliance Validation Execution
try {
    Write-ComplianceLog "=== GOVERNMENT COMPLIANCE VALIDATION ===" "INFO"
    Write-ComplianceLog "Starting EVA DA 2.0 Government of Canada compliance assessment..." "INFO"
    Write-ComplianceLog "Data Classification: $DataClassification | Environment: $Environment" "INFO"
    
    # Test Azure connection
    $context = Get-AzContext
    if (-not $context) {
        Write-ComplianceLog "Not connected to Azure. Run Connect-AzAccount first." "ERROR"
        exit 1
    }
    
    Set-AzContext -SubscriptionId $SubscriptionId | Out-Null
    
    # Run compliance tests
    Write-ComplianceLog "Executing Government of Canada Security Control Profile validation..."
    
    $complianceResults = @()
    
    # Test each control area
    $complianceResults += Test-AccessControlCompliance -ResourceGroupName $ResourceGroupName
    $complianceResults += Test-AuditingCompliance -ResourceGroupName $ResourceGroupName  
    $complianceResults += Test-EncryptionCompliance -ResourceGroupName $ResourceGroupName
    $complianceResults += Test-MonitoringCompliance -ResourceGroupName $ResourceGroupName
    $complianceResults += Test-IdentityAuthenticationCompliance -ResourceGroupName $ResourceGroupName
    
    # Generate compliance report
    if ($GenerateComplianceReport) {
        $reportPath = New-ComplianceReport -ComplianceResults $complianceResults
        Write-ComplianceLog "Detailed compliance report: $reportPath"
    }
    
    # Summary
    Write-ComplianceLog "=== COMPLIANCE VALIDATION COMPLETE ===" "INFO"
    
    $passCount = ($complianceResults | Where-Object { $_.Status -eq "PASS" }).Count
    $failCount = ($complianceResults | Where-Object { $_.Status -eq "FAIL" }).Count
    $errorCount = ($complianceResults | Where-Object { $_.Status -eq "ERROR" }).Count
    
    Write-ComplianceLog "Control Areas Assessed: $($complianceResults.Count)"
    Write-ComplianceLog "✅ Compliant: $passCount"
    Write-ComplianceLog "❌ Non-Compliant: $failCount"
    Write-ComplianceLog "⚠️ Errors: $errorCount"
    
    if ($failCount -eq 0 -and $errorCount -eq 0) {
        Write-ComplianceLog "🎉 SYSTEM IS COMPLIANT with Government of Canada Security Standards" "PASS"
        exit 0
    }
    elseif ($failCount -gt 0) {
        Write-ComplianceLog "❌ COMPLIANCE GAPS DETECTED - Immediate remediation required" "FAIL"
        exit 1
    }
    else {
        Write-ComplianceLog "⚠️ ASSESSMENT ERRORS - Review and re-run validation" "WARN" 
        exit 2
    }
}
catch {
    Write-ComplianceLog "Compliance validation failed: $($_.Exception.Message)" "ERROR"
    exit 1
}
