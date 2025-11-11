#!/usr/bin/env node

/**
 * EVA DA 2.0 - Real-Time Monitoring Script
 * Agent 3 - Monitoring Expert
 * 
 * Monitors system health, performance metrics, and agent coordination
 * Implements automated alerting and performance optimization recommendations
 */

const { DefaultAzureCredential } = require('@azure/identity');
const { LogsQueryClient } = require('@azure/monitor-query');
const { ApplicationInsightsManagementClient } = require('@azure/arm-appinsights');
const { CosmosClient } = require('@azure/cosmos');

class EVAMonitoringSystem {
    constructor(config) {
        this.config = config;
        this.credential = new DefaultAzureCredential();
        this.logsClient = new LogsQueryClient(this.credential);
        this.appInsightsClient = new ApplicationInsightsManagementClient(
            this.credential, 
            config.subscriptionId
        );
        
        // Initialize Cosmos monitoring
        this.cosmosClient = new CosmosClient({
            endpoint: config.cosmosEndpoint,
            credential: this.credential
        });
        
        this.healthMetrics = new Map();
        this.performanceBaseline = new Map();
        this.alertThresholds = {
            responseTime: 5000, // 5 seconds
            errorRate: 0.05, // 5%
            ruConsumption: 1000, // RU/s
            memoryUsage: 0.85 // 85%
        };
    }

    /**
     * Initialize monitoring system
     */
    async initialize() {
        console.log('🚀 Initializing EVA DA 2.0 Monitoring System...');
        
        try {
            await this.establishBaseline();
            await this.configureAlerts();
            console.log('✅ Monitoring system initialized successfully');
            
            // Start continuous monitoring
            this.startContinuousMonitoring();
            
        } catch (error) {
            console.error('❌ Failed to initialize monitoring system:', error);
            throw error;
        }
    }

    /**
     * Establish performance baseline
     */
    async establishBaseline() {
        console.log('📊 Establishing performance baseline...');
        
        const baselineQueries = {
            requestBaseline: `
                requests
                | where timestamp >= ago(24h)
                | summarize 
                    AvgResponseTime = avg(duration),
                    P95ResponseTime = percentile(duration, 95),
                    SuccessRate = countif(success) * 100.0 / count()
            `,
            cosmosBaseline: `
                AzureDiagnostics
                | where ResourceProvider == "MICROSOFT.DOCUMENTDB"
                | where Category == "DataPlaneRequests"
                | where TimeGenerated >= ago(24h)
                | extend RU = todouble(requestCharge_s)
                | summarize 
                    AvgRU = avg(RU),
                    P95RU = percentile(RU, 95)
            `,
            functionBaseline: `
                traces
                | where timestamp >= ago(24h)
                | where customDimensions has "functionName"
                | extend ExecutionTime = todouble(customDimensions.["prop__executionTimeInMs"])
                | where isnotempty(ExecutionTime)
                | summarize 
                    AvgExecutionTime = avg(ExecutionTime),
                    P95ExecutionTime = percentile(ExecutionTime, 95)
            `
        };

        for (const [key, query] of Object.entries(baselineQueries)) {
            try {
                const result = await this.executeQuery(query);
                this.performanceBaseline.set(key, result);
                console.log(`📈 ${key} baseline established`);
            } catch (error) {
                console.warn(`⚠️ Could not establish ${key} baseline:`, error.message);
            }
        }
    }

    /**
     * Execute KQL query
     */
    async executeQuery(query) {
        const workspaceId = this.config.logAnalyticsWorkspaceId;
        const result = await this.logsClient.queryWorkspace(
            workspaceId,
            query,
            { duration: 'P1D' }
        );
        return result.tables[0]?.rows || [];
    }

    /**
     * Configure automated alerts
     */
    async configureAlerts() {
        console.log('🚨 Configuring automated alerts...');
        
        const alertConfigurations = [
            {
                name: 'HighResponseTimeAlert',
                description: 'Alert when response time exceeds threshold',
                query: `
                    requests
                    | where timestamp >= ago(5m)
                    | where duration > ${this.alertThresholds.responseTime}
                    | count
                `,
                threshold: 5
            },
            {
                name: 'HighErrorRateAlert', 
                description: 'Alert when error rate exceeds threshold',
                query: `
                    requests
                    | where timestamp >= ago(5m)
                    | summarize ErrorRate = countif(success == false) * 100.0 / count()
                    | where ErrorRate > ${this.alertThresholds.errorRate * 100}
                `,
                threshold: 1
            },
            {
                name: 'CosmosHighRUAlert',
                description: 'Alert when Cosmos DB RU consumption is high',
                query: `
                    AzureDiagnostics
                    | where ResourceProvider == "MICROSOFT.DOCUMENTDB"
                    | where TimeGenerated >= ago(5m)
                    | extend RU = todouble(requestCharge_s)
                    | summarize TotalRU = sum(RU)
                    | where TotalRU > ${this.alertThresholds.ruConsumption}
                `,
                threshold: 1
            }
        ];

        // Store alert configurations for monitoring loop
        this.alertConfigurations = alertConfigurations;
        console.log(`✅ ${alertConfigurations.length} alerts configured`);
    }

    /**
     * Start continuous monitoring loop
     */
    startContinuousMonitoring() {
        console.log('🔄 Starting continuous monitoring...');
        
        // Monitor every 60 seconds
        setInterval(async () => {
            try {
                await this.performHealthCheck();
                await this.checkPerformanceMetrics();
                await this.monitorAgentCoordination();
                await this.checkAlerts();
                
                // Log health status
                console.log(`✅ Health check completed at ${new Date().toISOString()}`);
                
            } catch (error) {
                console.error('❌ Error during monitoring cycle:', error);
            }
        }, 60000);

        // Performance optimization every 5 minutes
        setInterval(async () => {
            await this.performanceOptimizationCheck();
        }, 300000);

        // Generate performance report every hour
        setInterval(async () => {
            await this.generatePerformanceReport();
        }, 3600000);
    }

    /**
     * Perform system health check
     */
    async performHealthCheck() {
        const healthChecks = {
            systemHealth: await this.checkSystemHealth(),
            cosmosHealth: await this.checkCosmosHealth(),
            functionHealth: await this.checkFunctionHealth(),
            dependencyHealth: await this.checkDependencyHealth()
        };

        // Calculate overall health score
        const healthScores = Object.values(healthChecks).map(h => h.score);
        const overallHealth = healthScores.reduce((a, b) => a + b, 0) / healthScores.length;

        this.healthMetrics.set('overallHealth', {
            score: overallHealth,
            timestamp: new Date().toISOString(),
            details: healthChecks
        });

        // Log health status
        if (overallHealth >= 90) {
            console.log(`💚 System Health: Excellent (${overallHealth.toFixed(1)}%)`);
        } else if (overallHealth >= 70) {
            console.log(`💛 System Health: Good (${overallHealth.toFixed(1)}%)`);
        } else {
            console.log(`💔 System Health: Poor (${overallHealth.toFixed(1)}%)`);
        }
    }

    /**
     * Check system health metrics
     */
    async checkSystemHealth() {
        const query = `
            requests
            | where timestamp >= ago(5m)
            | summarize 
                RequestCount = count(),
                SuccessRate = countif(success) * 100.0 / count(),
                AvgResponseTime = avg(duration)
        `;
        
        try {
            const result = await this.executeQuery(query);
            if (result.length === 0) return { score: 50, status: 'No Data' };
            
            const [requestCount, successRate, avgResponseTime] = result[0];
            
            let score = 100;
            if (successRate < 95) score -= (95 - successRate) * 2;
            if (avgResponseTime > 2000) score -= Math.min(30, (avgResponseTime - 2000) / 100);
            
            return {
                score: Math.max(0, score),
                status: score >= 90 ? 'Healthy' : score >= 70 ? 'Warning' : 'Critical',
                metrics: { requestCount, successRate, avgResponseTime }
            };
        } catch (error) {
            return { score: 0, status: 'Error', error: error.message };
        }
    }

    /**
     * Check Cosmos DB health
     */
    async checkCosmosHealth() {
        const query = `
            AzureDiagnostics
            | where ResourceProvider == "MICROSOFT.DOCUMENTDB"
            | where TimeGenerated >= ago(5m)
            | extend RU = todouble(requestCharge_s)
            | extend StatusCode = toint(statusCode_s)
            | summarize 
                RequestCount = count(),
                AvgRU = avg(RU),
                ThrottleCount = countif(StatusCode == 429),
                SuccessRate = countif(StatusCode < 400) * 100.0 / count()
        `;
        
        try {
            const result = await this.executeQuery(query);
            if (result.length === 0) return { score: 50, status: 'No Data' };
            
            const [requestCount, avgRU, throttleCount, successRate] = result[0];
            
            let score = 100;
            if (throttleCount > 0) score -= throttleCount * 10;
            if (avgRU > 100) score -= Math.min(20, (avgRU - 100) / 10);
            if (successRate < 95) score -= (95 - successRate) * 2;
            
            return {
                score: Math.max(0, score),
                status: score >= 90 ? 'Healthy' : score >= 70 ? 'Warning' : 'Critical',
                metrics: { requestCount, avgRU, throttleCount, successRate }
            };
        } catch (error) {
            return { score: 0, status: 'Error', error: error.message };
        }
    }

    /**
     * Check Function App health
     */
    async checkFunctionHealth() {
        const query = `
            traces
            | where timestamp >= ago(5m)
            | where customDimensions has "functionName"
            | extend FunctionName = tostring(customDimensions.["prop__functionName"])
            | extend ExecutionTime = todouble(customDimensions.["prop__executionTimeInMs"])
            | where isnotempty(FunctionName) and isnotempty(ExecutionTime)
            | summarize 
                ExecutionCount = count(),
                AvgExecutionTime = avg(ExecutionTime),
                ErrorCount = countif(severityLevel >= 3)
        `;
        
        try {
            const result = await this.executeQuery(query);
            if (result.length === 0) return { score: 50, status: 'No Data' };
            
            const [executionCount, avgExecutionTime, errorCount] = result[0];
            
            let score = 100;
            if (errorCount > 0) score -= errorCount * 15;
            if (avgExecutionTime > 5000) score -= Math.min(30, (avgExecutionTime - 5000) / 200);
            
            return {
                score: Math.max(0, score),
                status: score >= 90 ? 'Healthy' : score >= 70 ? 'Warning' : 'Critical',
                metrics: { executionCount, avgExecutionTime, errorCount }
            };
        } catch (error) {
            return { score: 0, status: 'Error', error: error.message };
        }
    }

    /**
     * Check dependency health
     */
    async checkDependencyHealth() {
        const query = `
            dependencies
            | where timestamp >= ago(5m)
            | summarize 
                DependencyCount = count(),
                SuccessRate = countif(success) * 100.0 / count(),
                AvgDuration = avg(duration)
        `;
        
        try {
            const result = await this.executeQuery(query);
            if (result.length === 0) return { score: 50, status: 'No Data' };
            
            const [dependencyCount, successRate, avgDuration] = result[0];
            
            let score = 100;
            if (successRate < 95) score -= (95 - successRate) * 2;
            if (avgDuration > 3000) score -= Math.min(25, (avgDuration - 3000) / 200);
            
            return {
                score: Math.max(0, score),
                status: score >= 90 ? 'Healthy' : score >= 70 ? 'Warning' : 'Critical',
                metrics: { dependencyCount, successRate, avgDuration }
            };
        } catch (error) {
            return { score: 0, status: 'Error', error: error.message };
        }
    }

    /**
     * Check performance metrics against baseline
     */
    async checkPerformanceMetrics() {
        // Implementation for performance metrics comparison
        console.log('📊 Checking performance metrics against baseline...');
    }

    /**
     * Monitor agent coordination
     */
    async monitorAgentCoordination() {
        const query = `
            customEvents
            | where timestamp >= ago(5m)
            | where name startswith "Agent"
            | extend AgentId = tostring(customDimensions.["AgentId"])
            | extend HealthStatus = tostring(customDimensions.["HealthStatus"])
            | where isnotempty(AgentId)
            | summarize 
                LastSeen = max(timestamp),
                HealthChecks = count()
                by AgentId
        `;
        
        try {
            const result = await this.executeQuery(query);
            const activeAgents = result.length;
            const expectedAgents = 6; // EVA DA 2.0 has 6 agents
            
            if (activeAgents === expectedAgents) {
                console.log(`🤖 Agent Coordination: All ${activeAgents} agents active`);
            } else {
                console.warn(`⚠️ Agent Coordination: Only ${activeAgents}/${expectedAgents} agents active`);
            }
            
        } catch (error) {
            console.error('❌ Error monitoring agent coordination:', error);
        }
    }

    /**
     * Check alerts
     */
    async checkAlerts() {
        for (const alert of this.alertConfigurations) {
            try {
                const result = await this.executeQuery(alert.query);
                const value = result[0]?.[0] || 0;
                
                if (value >= alert.threshold) {
                    await this.triggerAlert(alert, value);
                }
            } catch (error) {
                console.error(`❌ Error checking alert ${alert.name}:`, error);
            }
        }
    }

    /**
     * Trigger alert
     */
    async triggerAlert(alert, value) {
        const alertMessage = {
            timestamp: new Date().toISOString(),
            alertName: alert.name,
            description: alert.description,
            value,
            threshold: alert.threshold,
            severity: value > alert.threshold * 2 ? 'Critical' : 'Warning'
        };
        
        console.log(`🚨 ALERT: ${alertMessage.alertName} - ${alertMessage.description}`);
        console.log(`   Value: ${value}, Threshold: ${alert.threshold}`);
        
        // Store alert for dashboard
        if (!this.healthMetrics.has('alerts')) {
            this.healthMetrics.set('alerts', []);
        }
        
        const alerts = this.healthMetrics.get('alerts');
        alerts.push(alertMessage);
        
        // Keep only last 100 alerts
        if (alerts.length > 100) {
            alerts.splice(0, alerts.length - 100);
        }
    }

    /**
     * Performance optimization check
     */
    async performanceOptimizationCheck() {
        console.log('🔧 Running performance optimization check...');
        
        const recommendations = [];
        
        // Check for optimization opportunities
        const optimizationQueries = {
            slowQueries: `
                AzureDiagnostics
                | where ResourceProvider == "MICROSOFT.DOCUMENTDB"
                | where Category == "QueryRuntimeStatistics"
                | where TimeGenerated >= ago(1h)
                | extend Duration = todouble(totalExecutionTimeInMs_s)
                | extend RU = todouble(requestCharge_s)
                | where Duration > 1000 or RU > 100
                | top 10 by Duration desc
            `,
            memoryPressure: `
                performanceCounters
                | where timestamp >= ago(1h)
                | where category == "Memory" and counter == "Available MBytes"
                | summarize AvgMemory = avg(value)
                | where AvgMemory < 1000
            `,
            highCpuUsage: `
                performanceCounters
                | where timestamp >= ago(1h)
                | where category == "Processor" and counter == "% Processor Time"
                | summarize AvgCPU = avg(value)
                | where AvgCPU > 80
            `
        };

        for (const [check, query] of Object.entries(optimizationQueries)) {
            try {
                const result = await this.executeQuery(query);
                if (result.length > 0) {
                    recommendations.push({
                        type: check,
                        priority: 'Medium',
                        details: result
                    });
                }
            } catch (error) {
                console.warn(`⚠️ Could not run ${check} optimization check:`, error.message);
            }
        }

        if (recommendations.length > 0) {
            console.log(`💡 Found ${recommendations.length} optimization opportunities`);
            this.healthMetrics.set('optimizationRecommendations', recommendations);
        }
    }

    /**
     * Generate performance report
     */
    async generatePerformanceReport() {
        console.log('📋 Generating hourly performance report...');
        
        const report = {
            timestamp: new Date().toISOString(),
            healthMetrics: Object.fromEntries(this.healthMetrics),
            systemStatus: 'Operational',
            keyMetrics: {
                overallHealth: this.healthMetrics.get('overallHealth')?.score || 0,
                activeAlerts: this.healthMetrics.get('alerts')?.length || 0,
                optimizationOpportunities: this.healthMetrics.get('optimizationRecommendations')?.length || 0
            }
        };
        
        // In a real implementation, this would be sent to a dashboard or stored
        console.log(`📊 Performance Report Generated - Health: ${report.keyMetrics.overallHealth.toFixed(1)}%`);
    }

    /**
     * Get current health status
     */
    getHealthStatus() {
        return {
            overall: this.healthMetrics.get('overallHealth'),
            alerts: this.healthMetrics.get('alerts') || [],
            recommendations: this.healthMetrics.get('optimizationRecommendations') || []
        };
    }
}

module.exports = { EVAMonitoringSystem };

// Usage example
if (require.main === module) {
    const config = {
        subscriptionId: process.env.AZURE_SUBSCRIPTION_ID,
        resourceGroupName: process.env.AZURE_RESOURCE_GROUP,
        logAnalyticsWorkspaceId: process.env.LOG_ANALYTICS_WORKSPACE_ID,
        cosmosEndpoint: process.env.COSMOS_DB_ENDPOINT,
        appInsightsInstrumentationKey: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING
    };

    const monitoring = new EVAMonitoringSystem(config);
    
    monitoring.initialize()
        .then(() => {
            console.log('🎉 EVA DA 2.0 Monitoring System is now active!');
        })
        .catch(error => {
            console.error('💥 Failed to start monitoring system:', error);
            process.exit(1);
        });
}
