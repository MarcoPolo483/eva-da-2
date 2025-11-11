/**
 * EVA DA 2.0 - Application Insights Integration
 * Enterprise monitoring with Azure Application Insights
 * 
 * Features:
 * - Real-time performance monitoring
 * - Custom telemetry tracking
 * - Multi-agent coordination metrics
 * - Dependency tracking
 * - Alert integration
 */

const { ApplicationInsights } = require('applicationinsights');

/**
 * Application Insights Manager
 * Centralized telemetry and monitoring
 */
class ApplicationInsightsManager {
    constructor(config = {}) {
        this.config = {
            instrumentationKey: config.instrumentationKey || process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
            connectionString: config.connectionString || process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
            enableAutoCollection: config.enableAutoCollection !== false,
            enableLiveDashboard: config.enableLiveDashboard !== false,
            samplingPercentage: config.samplingPercentage || 100,
            ...config
        };
        
        this.appInsights = null;
        this.isInitialized = false;
        this.customMetrics = new Map();
    }

    /**
     * Initialize Application Insights
     */
    initialize() {
        try {
            if (this.config.connectionString || this.config.instrumentationKey) {
                // Setup Application Insights
                ApplicationInsights.setup(this.config.connectionString || this.config.instrumentationKey);
                
                // Configure telemetry
                ApplicationInsights.Configuration.setAutoCollectRequests(this.config.enableAutoCollection);
                ApplicationInsights.Configuration.setAutoCollectPerformance(this.config.enableAutoCollection, true);
                ApplicationInsights.Configuration.setAutoCollectExceptions(this.config.enableAutoCollection);
                ApplicationInsights.Configuration.setAutoCollectDependencies(this.config.enableAutoCollection);
                ApplicationInsights.Configuration.setAutoCollectConsole(this.config.enableAutoCollection);
                
                // Set sampling percentage
                ApplicationInsights.Configuration.setSamplingPercentage(this.config.samplingPercentage);
                
                // Enable live dashboard
                if (this.config.enableLiveDashboard) {
                    ApplicationInsights.Configuration.setUseDiskRetryCaching(true);
                }
                
                // Start the client
                ApplicationInsights.start();
                
                this.appInsights = ApplicationInsights.defaultClient;
                
                // Add custom properties to all telemetry
                this.appInsights.addTelemetryProcessor((envelope) => {
                    envelope.data.baseData.properties = {
                        ...envelope.data.baseData.properties,
                        application: 'EVA-DA-2.0',
                        version: '2.0.0',
                        environment: process.env.NODE_ENV || 'development'
                    };
                    return true;
                });

                this.isInitialized = true;
                console.log('✅ Application Insights initialized');
                
                // Send initialization event
                this.trackEvent('ApplicationInsightsInitialized', {
                    timestamp: new Date().toISOString()
                });
                
            } else {
                console.warn('⚠️ Application Insights configuration missing');
            }
        } catch (error) {
            console.error('❌ Application Insights initialization failed:', error);
            throw error;
        }
    }

    /**
     * Track custom events
     */
    trackEvent(name, properties = {}, measurements = {}) {
        if (!this.isInitialized) return;
        
        this.appInsights.trackEvent({
            name,
            properties: {
                ...properties,
                timestamp: new Date().toISOString(),
                source: 'EVA-DA-2.0'
            },
            measurements
        });
    }

    /**
     * Track custom metrics
     */
    trackMetric(name, value, properties = {}) {
        if (!this.isInitialized) return;
        
        this.appInsights.trackMetric({
            name,
            value,
            properties: {
                ...properties,
                timestamp: new Date().toISOString()
            }
        });
        
        // Store in local cache for dashboard
        this.customMetrics.set(name, {
            value,
            timestamp: new Date().toISOString(),
            properties
        });
    }

    /**
     * Track dependencies (external calls)
     */
    trackDependency(name, commandName, elapsedTimeMs, success, dependencyTypeName = 'HTTP') {
        if (!this.isInitialized) return;
        
        this.appInsights.trackDependency({
            name,
            commandName,
            elapsedTimeMs,
            success,
            dependencyTypeName
        });
    }

    /**
     * Track exceptions
     */
    trackException(exception, properties = {}) {
        if (!this.isInitialized) return;
        
        this.appInsights.trackException({
            exception,
            properties: {
                ...properties,
                timestamp: new Date().toISOString(),
                severity: 'error'
            }
        });
    }

    /**
     * Track agent coordination metrics
     */
    trackAgentCoordination(agentId, operation, duration, success, details = {}) {
        this.trackEvent('AgentCoordination', {
            agentId,
            operation,
            success: success.toString(),
            ...details
        }, {
            duration
        });
        
        this.trackMetric(`Agent.${agentId}.OperationDuration`, duration, {
            operation,
            success: success.toString()
        });
    }

    /**
     * Track Cosmos DB operations
     */
    trackCosmosOperation(operation, duration, requestUnits, success, details = {}) {
        this.trackEvent('CosmosDBOperation', {
            operation,
            success: success.toString(),
            ...details
        }, {
            duration,
            requestUnits
        });
        
        this.trackMetric('CosmosDB.RequestUnits', requestUnits, { operation });
        this.trackMetric('CosmosDB.Duration', duration, { operation });
    }

    /**
     * Track API calls
     */
    trackAPICall(endpoint, method, statusCode, duration, details = {}) {
        this.trackEvent('APICall', {
            endpoint,
            method,
            statusCode: statusCode.toString(),
            ...details
        }, {
            duration
        });
        
        this.trackMetric('API.ResponseTime', duration, { endpoint, method });
    }

    /**
     * Track user interactions
     */
    trackUserInteraction(userId, action, details = {}) {
        this.trackEvent('UserInteraction', {
            userId,
            action,
            ...details
        });
    }

    /**
     * Get current metrics for dashboard
     */
    getCurrentMetrics() {
        return {
            timestamp: new Date().toISOString(),
            metrics: Object.fromEntries(this.customMetrics),
            status: this.isInitialized ? 'active' : 'inactive'
        };
    }

    /**
     * Flush all telemetry (useful for Azure Functions)
     */
    flush() {
        if (this.isInitialized) {
            this.appInsights.flush();
        }
    }
}

/**
 * Performance Monitor
 * Tracks application performance metrics
 */
class PerformanceMonitor {
    constructor(appInsights) {
        this.appInsights = appInsights;
        this.performanceEntries = [];
        this.thresholds = {
            apiResponseTime: 5000, // 5 seconds
            databaseQuery: 3000,   // 3 seconds
            functionExecution: 10000, // 10 seconds
            memoryUsage: 512 * 1024 * 1024 // 512MB
        };
    }

    /**
     * Start performance tracking
     */
    startPerformanceTracking(operationName) {
        const startTime = Date.now();
        const startMemory = process.memoryUsage();
        
        return {
            operationName,
            startTime,
            startMemory,
            end: () => {
                const endTime = Date.now();
                const endMemory = process.memoryUsage();
                const duration = endTime - startTime;
                const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;
                
                // Track performance metrics
                this.appInsights.trackMetric(`Performance.${operationName}.Duration`, duration);
                this.appInsights.trackMetric(`Performance.${operationName}.MemoryDelta`, memoryDelta);
                
                // Check thresholds and create alerts if needed
                this.checkPerformanceThresholds(operationName, duration, memoryDelta);
                
                return {
                    duration,
                    memoryDelta,
                    startMemory,
                    endMemory
                };
            }
        };
    }

    /**
     * Check performance thresholds
     */
    checkPerformanceThresholds(operationName, duration, memoryDelta) {
        if (duration > this.thresholds.apiResponseTime) {
            this.appInsights.trackEvent('PerformanceAlert', {
                type: 'SlowOperation',
                operationName,
                duration: duration.toString(),
                threshold: this.thresholds.apiResponseTime.toString()
            });
        }
        
        if (memoryDelta > this.thresholds.memoryUsage) {
            this.appInsights.trackEvent('PerformanceAlert', {
                type: 'HighMemoryUsage',
                operationName,
                memoryDelta: memoryDelta.toString(),
                threshold: this.thresholds.memoryUsage.toString()
            });
        }
    }

    /**
     * Get system performance metrics
     */
    getSystemMetrics() {
        const memory = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        
        return {
            timestamp: new Date().toISOString(),
            memory: {
                heapUsed: memory.heapUsed,
                heapTotal: memory.heapTotal,
                external: memory.external,
                rss: memory.rss
            },
            cpu: {
                user: cpuUsage.user,
                system: cpuUsage.system
            },
            uptime: process.uptime()
        };
    }
}

/**
 * Health Monitor
 * Monitors system health and availability
 */
class HealthMonitor {
    constructor(appInsights) {
        this.appInsights = appInsights;
        this.healthChecks = new Map();
        this.isMonitoring = false;
    }

    /**
     * Register a health check
     */
    registerHealthCheck(name, checkFunction, intervalMs = 60000) {
        this.healthChecks.set(name, {
            checkFunction,
            intervalMs,
            lastCheck: null,
            lastResult: null,
            isHealthy: true
        });
    }

    /**
     * Start health monitoring
     */
    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        
        for (const [name, check] of this.healthChecks) {
            this.runHealthCheckInterval(name, check);
        }
    }

    /**
     * Run health check at intervals
     */
    runHealthCheckInterval(name, check) {
        const runCheck = async () => {
            try {
                const result = await check.checkFunction();
                check.lastCheck = new Date().toISOString();
                check.lastResult = result;
                check.isHealthy = result.healthy;
                
                // Track health status
                this.appInsights.trackEvent('HealthCheck', {
                    checkName: name,
                    healthy: result.healthy.toString(),
                    details: JSON.stringify(result.details || {})
                });
                
                if (!result.healthy) {
                    this.appInsights.trackEvent('HealthAlert', {
                        checkName: name,
                        message: result.message || 'Health check failed'
                    });
                }
                
            } catch (error) {
                check.isHealthy = false;
                check.lastResult = { healthy: false, error: error.message };
                
                this.appInsights.trackException(error, {
                    healthCheck: name
                });
            }
        };
        
        // Run immediately, then at intervals
        runCheck();
        setInterval(runCheck, check.intervalMs);
    }

    /**
     * Get current health status
     */
    getHealthStatus() {
        const checks = {};
        let overallHealthy = true;
        
        for (const [name, check] of this.healthChecks) {
            checks[name] = {
                healthy: check.isHealthy,
                lastCheck: check.lastCheck,
                result: check.lastResult
            };
            
            if (!check.isHealthy) {
                overallHealthy = false;
            }
        }
        
        return {
            timestamp: new Date().toISOString(),
            overall: overallHealthy,
            checks
        };
    }
}

module.exports = {
    ApplicationInsightsManager,
    PerformanceMonitor,
    HealthMonitor
};
