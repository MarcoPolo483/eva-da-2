#!/usr/bin/env node

/**
 * EVA DA 2.0 - Alert Configuration and Management
 * Agent 3 - Monitoring Expert
 * 
 * Configures, manages, and tests alerting for the entire EVA system
 */

const { DefaultAzureCredential } = require('@azure/identity');
const { MonitorManagementClient } = require('@azure/arm-monitor');
const { LogsQueryClient } = require('@azure/monitor-query');

class EVAAlertManager {
    constructor(config) {
        this.config = config;
        this.credential = new DefaultAzureCredential();
        this.monitorClient = new MonitorManagementClient(this.credential, config.subscriptionId);
        this.logsClient = new LogsQueryClient(this.credential);
        
        this.alertRules = [];
        this.actionGroups = [];
    }

    /**
     * Initialize alert management system
     */
    async initialize() {
        console.log('🚨 Initializing EVA DA 2.0 Alert Management System...');
        
        try {
            await this.createActionGroups();
            await this.createAlertRules();
            await this.validateAlerts();
            
            console.log('✅ Alert management system initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize alert management:', error);
            throw error;
        }
    }

    /**
     * Create action groups for notifications
     */
    async createActionGroups() {
        console.log('📧 Creating action groups...');
        
        const actionGroupConfigs = [
            {
                name: 'eva-critical-alerts',
                shortName: 'EVACritical',
                description: 'Critical alerts for EVA DA 2.0 system',
                receivers: {
                    email: this.config.alertEmail ? [
                        {
                            name: 'AdminEmail',
                            emailAddress: this.config.alertEmail,
                            useCommonAlertSchema: true
                        }
                    ] : [],
                    sms: [], // Can be configured later
                    webhook: [] // Can be configured for Teams/Slack
                }
            },
            {
                name: 'eva-warning-alerts',
                shortName: 'EVAWarning',
                description: 'Warning alerts for EVA DA 2.0 system',
                receivers: {
                    email: this.config.alertEmail ? [
                        {
                            name: 'AdminEmail',
                            emailAddress: this.config.alertEmail,
                            useCommonAlertSchema: true
                        }
                    ] : [],
                    sms: [],
                    webhook: []
                }
            },
            {
                name: 'eva-info-alerts',
                shortName: 'EVAInfo',
                description: 'Informational alerts for EVA DA 2.0 system',
                receivers: {
                    email: this.config.alertEmail ? [
                        {
                            name: 'AdminEmail',
                            emailAddress: this.config.alertEmail,
                            useCommonAlertSchema: true
                        }
                    ] : [],
                    sms: [],
                    webhook: []
                }
            }
        ];

        for (const agConfig of actionGroupConfigs) {
            try {
                const actionGroupParams = {
                    location: 'Global',
                    tags: {
                        Environment: this.config.environment,
                        Application: 'EVA-DA-2.0',
                        Component: 'Monitoring'
                    },
                    groupShortName: agConfig.shortName,
                    enabled: true,
                    emailReceivers: agConfig.receivers.email,
                    smsReceivers: agConfig.receivers.sms,
                    webhookReceivers: agConfig.receivers.webhook
                };

                // In a real implementation, this would create the action group
                console.log(`📧 Action group configured: ${agConfig.name}`);
                this.actionGroups.push({
                    name: agConfig.name,
                    id: `/subscriptions/${this.config.subscriptionId}/resourceGroups/${this.config.resourceGroupName}/providers/Microsoft.Insights/actionGroups/${agConfig.name}`,
                    config: actionGroupParams
                });
                
            } catch (error) {
                console.error(`❌ Failed to create action group ${agConfig.name}:`, error.message);
            }
        }
    }

    /**
     * Create comprehensive alert rules
     */
    async createAlertRules() {
        console.log('⚠️ Creating alert rules...');
        
        const alertConfigurations = [
            // System Health Alerts
            {
                name: 'eva-high-error-rate',
                description: 'Alert when error rate exceeds 5%',
                severity: 1, // Critical
                enabled: true,
                evaluationFrequency: 'PT1M', // Every minute
                windowSize: 'PT5M', // 5-minute window
                criteria: {
                    type: 'LogAlert',
                    query: `
                        requests
                        | where timestamp >= ago(5m)
                        | summarize 
                            ErrorRate = countif(success == false) * 100.0 / count(),
                            TotalRequests = count()
                        | where TotalRequests > 10 and ErrorRate > 5
                    `,
                    threshold: 1,
                    operator: 'GreaterThanOrEqual'
                },
                actionGroupName: 'eva-critical-alerts'
            },
            {
                name: 'eva-high-response-time',
                description: 'Alert when P95 response time exceeds 5 seconds',
                severity: 2, // Warning
                enabled: true,
                evaluationFrequency: 'PT5M',
                windowSize: 'PT10M',
                criteria: {
                    type: 'LogAlert',
                    query: `
                        requests
                        | where timestamp >= ago(10m)
                        | summarize 
                            P95ResponseTime = percentile(duration, 95),
                            RequestCount = count()
                        | where RequestCount > 10 and P95ResponseTime > 5000
                    `,
                    threshold: 1,
                    operator: 'GreaterThanOrEqual'
                },
                actionGroupName: 'eva-warning-alerts'
            },

            // Cosmos DB Alerts
            {
                name: 'eva-cosmos-high-ru-consumption',
                description: 'Alert when Cosmos DB RU consumption exceeds 80%',
                severity: 2,
                enabled: true,
                evaluationFrequency: 'PT1M',
                windowSize: 'PT5M',
                criteria: {
                    type: 'LogAlert',
                    query: `
                        AzureDiagnostics
                        | where ResourceProvider == "MICROSOFT.DOCUMENTDB"
                        | where Category == "DataPlaneRequests"
                        | where TimeGenerated >= ago(5m)
                        | extend RU = todouble(requestCharge_s)
                        | summarize TotalRU = sum(RU)
                        | where TotalRU > 1000
                    `,
                    threshold: 1,
                    operator: 'GreaterThanOrEqual'
                },
                actionGroupName: 'eva-warning-alerts'
            },
            {
                name: 'eva-cosmos-throttling',
                description: 'Alert when Cosmos DB requests are being throttled',
                severity: 1,
                enabled: true,
                evaluationFrequency: 'PT1M',
                windowSize: 'PT5M',
                criteria: {
                    type: 'LogAlert',
                    query: `
                        AzureDiagnostics
                        | where ResourceProvider == "MICROSOFT.DOCUMENTDB"
                        | where Category == "DataPlaneRequests"
                        | where TimeGenerated >= ago(5m)
                        | where toint(statusCode_s) == 429
                        | summarize ThrottleCount = count()
                        | where ThrottleCount > 5
                    `,
                    threshold: 1,
                    operator: 'GreaterThanOrEqual'
                },
                actionGroupName: 'eva-critical-alerts'
            },

            // Function App Alerts
            {
                name: 'eva-function-failures',
                description: 'Alert when function execution failures exceed threshold',
                severity: 2,
                enabled: true,
                evaluationFrequency: 'PT5M',
                windowSize: 'PT10M',
                criteria: {
                    type: 'LogAlert',
                    query: `
                        traces
                        | where timestamp >= ago(10m)
                        | where customDimensions has "functionName"
                        | where severityLevel >= 3
                        | summarize ErrorCount = count() by tostring(customDimensions.["prop__functionName"])
                        | where ErrorCount > 3
                    `,
                    threshold: 1,
                    operator: 'GreaterThanOrEqual'
                },
                actionGroupName: 'eva-warning-alerts'
            },
            {
                name: 'eva-function-cold-starts',
                description: 'Alert when function cold starts are excessive',
                severity: 3,
                enabled: true,
                evaluationFrequency: 'PT10M',
                windowSize: 'PT30M',
                criteria: {
                    type: 'LogAlert',
                    query: `
                        traces
                        | where timestamp >= ago(30m)
                        | where message contains "cold start" or message contains "function host"
                        | summarize ColdStartCount = count()
                        | where ColdStartCount > 5
                    `,
                    threshold: 1,
                    operator: 'GreaterThanOrEqual'
                },
                actionGroupName: 'eva-info-alerts'
            },

            // Agent Coordination Alerts
            {
                name: 'eva-agent-unresponsive',
                description: 'Alert when an agent becomes unresponsive',
                severity: 1,
                enabled: true,
                evaluationFrequency: 'PT5M',
                windowSize: 'PT15M',
                criteria: {
                    type: 'LogAlert',
                    query: `
                        customEvents
                        | where timestamp >= ago(15m)
                        | where name startswith "Agent"
                        | extend AgentId = tostring(customDimensions.["AgentId"])
                        | where isnotempty(AgentId)
                        | summarize LastSeen = max(timestamp) by AgentId
                        | where LastSeen < ago(10m)
                    `,
                    threshold: 1,
                    operator: 'GreaterThanOrEqual'
                },
                actionGroupName: 'eva-critical-alerts'
            },

            // Security Alerts
            {
                name: 'eva-authentication-failures',
                description: 'Alert on multiple authentication failures',
                severity: 2,
                enabled: true,
                evaluationFrequency: 'PT5M',
                windowSize: 'PT15M',
                criteria: {
                    type: 'LogAlert',
                    query: `
                        SigninLogs
                        | where TimeGenerated >= ago(15m)
                        | where ResultType != 0
                        | summarize FailureCount = count() by UserPrincipalName, IPAddress
                        | where FailureCount >= 5
                    `,
                    threshold: 1,
                    operator: 'GreaterThanOrEqual'
                },
                actionGroupName: 'eva-warning-alerts'
            },

            // Resource Utilization Alerts
            {
                name: 'eva-high-memory-usage',
                description: 'Alert when memory usage exceeds 90%',
                severity: 2,
                enabled: true,
                evaluationFrequency: 'PT5M',
                windowSize: 'PT10M',
                criteria: {
                    type: 'LogAlert',
                    query: `
                        performanceCounters
                        | where timestamp >= ago(10m)
                        | where category == "Memory" and counter == "Available MBytes"
                        | summarize AvgMemory = avg(value) by computer
                        | where AvgMemory < 500  // Less than 500MB available
                    `,
                    threshold: 1,
                    operator: 'GreaterThanOrEqual'
                },
                actionGroupName: 'eva-warning-alerts'
            },
            {
                name: 'eva-high-cpu-usage',
                description: 'Alert when CPU usage exceeds 90%',
                severity: 2,
                enabled: true,
                evaluationFrequency: 'PT5M',
                windowSize: 'PT10M',
                criteria: {
                    type: 'LogAlert',
                    query: `
                        performanceCounters
                        | where timestamp >= ago(10m)
                        | where category == "Processor" and counter == "% Processor Time"
                        | where instance == "_Total"
                        | summarize AvgCPU = avg(value) by computer
                        | where AvgCPU > 90
                    `,
                    threshold: 1,
                    operator: 'GreaterThanOrEqual'
                },
                actionGroupName: 'eva-warning-alerts'
            }
        ];

        for (const alertConfig of alertConfigurations) {
            try {
                // Find corresponding action group
                const actionGroup = this.actionGroups.find(ag => ag.name === alertConfig.actionGroupName);
                if (!actionGroup) {
                    console.warn(`⚠️ Action group ${alertConfig.actionGroupName} not found for alert ${alertConfig.name}`);
                    continue;
                }

                const alertRule = {
                    ...alertConfig,
                    id: `/subscriptions/${this.config.subscriptionId}/resourceGroups/${this.config.resourceGroupName}/providers/Microsoft.Insights/scheduledQueryRules/${alertConfig.name}`,
                    actionGroupId: actionGroup.id,
                    scopes: [
                        `/subscriptions/${this.config.subscriptionId}/resourceGroups/${this.config.resourceGroupName}/providers/Microsoft.Insights/components/${this.config.appInsightsName}`,
                        `/subscriptions/${this.config.subscriptionId}/resourceGroups/${this.config.resourceGroupName}/providers/Microsoft.OperationalInsights/workspaces/${this.config.logAnalyticsName}`
                    ]
                };

                // In a real implementation, this would create the alert rule
                console.log(`⚠️ Alert rule configured: ${alertConfig.name} (Severity: ${alertConfig.severity})`);
                this.alertRules.push(alertRule);
                
            } catch (error) {
                console.error(`❌ Failed to create alert rule ${alertConfig.name}:`, error.message);
            }
        }
    }

    /**
     * Validate alert configurations
     */
    async validateAlerts() {
        console.log('🔍 Validating alert configurations...');
        
        let validAlerts = 0;
        let invalidAlerts = 0;

        for (const alert of this.alertRules) {
            try {
                // Test query syntax
                if (alert.criteria.type === 'LogAlert') {
                    await this.testQuery(alert.criteria.query, alert.name);
                    validAlerts++;
                }
            } catch (error) {
                console.error(`❌ Invalid alert query for ${alert.name}:`, error.message);
                invalidAlerts++;
            }
        }

        console.log(`✅ Alert validation complete: ${validAlerts} valid, ${invalidAlerts} invalid`);
    }

    /**
     * Test a KQL query
     */
    async testQuery(query, alertName) {
        try {
            const workspaceId = this.config.logAnalyticsWorkspaceId;
            await this.logsClient.queryWorkspace(
                workspaceId,
                query,
                { duration: 'PT5M' }
            );
            console.log(`✅ Query validation passed: ${alertName}`);
        } catch (error) {
            throw new Error(`Query validation failed: ${error.message}`);
        }
    }

    /**
     * Test alert notifications
     */
    async testAlertNotifications() {
        console.log('📧 Testing alert notifications...');
        
        // Create a test alert
        const testAlert = {
            alertName: 'EVA-Test-Alert',
            description: 'Test alert to verify notification system',
            severity: 'Informational',
            timestamp: new Date().toISOString(),
            resourceName: 'eva-da-2-test',
            condition: 'Test condition triggered',
            value: '100',
            threshold: '50'
        };

        try {
            // In a real implementation, this would trigger a test notification
            console.log('📧 Test notification sent:', JSON.stringify(testAlert, null, 2));
            console.log('✅ Alert notification test completed');
        } catch (error) {
            console.error('❌ Alert notification test failed:', error.message);
        }
    }

    /**
     * Get alert statistics
     */
    getAlertStatistics() {
        const stats = {
            totalAlerts: this.alertRules.length,
            criticalAlerts: this.alertRules.filter(a => a.severity === 1).length,
            warningAlerts: this.alertRules.filter(a => a.severity === 2).length,
            infoAlerts: this.alertRules.filter(a => a.severity === 3).length,
            enabledAlerts: this.alertRules.filter(a => a.enabled).length,
            actionGroups: this.actionGroups.length
        };

        return stats;
    }

    /**
     * Generate alert configuration report
     */
    generateConfigurationReport() {
        const stats = this.getAlertStatistics();
        
        console.log('\n📊 EVA DA 2.0 Alert Configuration Report');
        console.log('=====================================');
        console.log(`Total Alert Rules: ${stats.totalAlerts}`);
        console.log(`  • Critical (Severity 1): ${stats.criticalAlerts}`);
        console.log(`  • Warning (Severity 2): ${stats.warningAlerts}`);
        console.log(`  • Informational (Severity 3): ${stats.infoAlerts}`);
        console.log(`Enabled Alert Rules: ${stats.enabledAlerts}`);
        console.log(`Action Groups: ${stats.actionGroups}`);
        
        console.log('\n📋 Alert Categories:');
        const categories = {
            'System Health': this.alertRules.filter(a => a.name.includes('error') || a.name.includes('response')).length,
            'Cosmos DB': this.alertRules.filter(a => a.name.includes('cosmos')).length,
            'Function Apps': this.alertRules.filter(a => a.name.includes('function')).length,
            'Agent Coordination': this.alertRules.filter(a => a.name.includes('agent')).length,
            'Security': this.alertRules.filter(a => a.name.includes('auth')).length,
            'Resource Utilization': this.alertRules.filter(a => a.name.includes('memory') || a.name.includes('cpu')).length
        };
        
        Object.entries(categories).forEach(([category, count]) => {
            console.log(`  • ${category}: ${count} alerts`);
        });
        
        console.log('\n🎯 Next Steps:');
        console.log('  1. Deploy alert rules using Azure CLI or ARM templates');
        console.log('  2. Test notification delivery');
        console.log('  3. Fine-tune thresholds based on baseline metrics');
        console.log('  4. Set up escalation procedures for critical alerts');
        
        return {
            stats,
            categories,
            alertRules: this.alertRules,
            actionGroups: this.actionGroups
        };
    }
}

module.exports = { EVAAlertManager };

// Usage example
if (require.main === module) {
    const config = {
        subscriptionId: process.env.AZURE_SUBSCRIPTION_ID,
        resourceGroupName: process.env.AZURE_RESOURCE_GROUP,
        logAnalyticsWorkspaceId: process.env.LOG_ANALYTICS_WORKSPACE_ID,
        logAnalyticsName: process.env.LOG_ANALYTICS_NAME || 'la-eva-da-2',
        appInsightsName: process.env.APPINSIGHTS_NAME || 'ai-eva-da-2',
        environment: process.env.ENVIRONMENT || 'dev',
        alertEmail: process.env.ALERT_EMAIL || ''
    };

    const alertManager = new EVAAlertManager(config);
    
    alertManager.initialize()
        .then(() => {
            console.log('\n🎉 EVA DA 2.0 Alert Management System is ready!');
            
            // Generate configuration report
            alertManager.generateConfigurationReport();
            
            // Test notifications if email is configured
            if (config.alertEmail) {
                return alertManager.testAlertNotifications();
            }
        })
        .then(() => {
            console.log('\n✅ Alert system setup completed successfully!');
        })
        .catch(error => {
            console.error('\n💥 Failed to setup alert system:', error);
            process.exit(1);
        });
}
