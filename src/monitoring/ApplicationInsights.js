// EVA DA 2.0 - Azure Application Insights Integration
// Enterprise monitoring with Azure Monitor and Application Insights
// Comprehensive observability for multi-agent platform

const { ApplicationInsights } = require('applicationinsights');
const { DefaultAzureCredential } = require('@azure/identity');

/**
 * EVA Application Insights Manager
 * Provides comprehensive monitoring for the multi-agent platform
 */
class EVAApplicationInsights {
  constructor() {
    this.appInsights = null;
    this.telemetryClient = null;
    this.isInitialized = false;
    
    // Configuration from environment variables
    this.config = {
      connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
      instrumentationKey: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
      enableAutoCollection: true,
      enableLiveMetrics: true,
      enableDistributedTracing: true,
      samplingPercentage: process.env.NODE_ENV === 'production' ? 10 : 100
    };
  }

  /**
   * Initialize Application Insights with enterprise configuration
   */
  initialize() {
    try {
      if (!this.config.connectionString && !this.config.instrumentationKey) {
        console.warn('⚠️ Application Insights not configured - monitoring disabled');
        return false;
      }

      // Configure Application Insights
      ApplicationInsights.setup(this.config.connectionString || this.config.instrumentationKey)
        .setAutoCollectRequests(this.config.enableAutoCollection)
        .setAutoCollectPerformance(this.config.enableAutoCollection, true)
        .setAutoCollectExceptions(this.config.enableAutoCollection)
        .setAutoCollectDependencies(this.config.enableAutoCollection)
        .setAutoCollectConsole(this.config.enableAutoCollection)
        .setUseDiskRetryCaching(true)
        .setSendLiveMetrics(this.config.enableLiveMetrics)
        .setDistributedTracingMode(ApplicationInsights.DistributedTracingModes.AI_AND_W3C)
        .start();

      this.appInsights = ApplicationInsights;
      this.telemetryClient = ApplicationInsights.defaultClient;
      
      // Configure sampling
      this.telemetryClient.config.samplingPercentage = this.config.samplingPercentage;
      
      // Add custom properties to all telemetry
      this.telemetryClient.addTelemetryProcessor((envelope) => {
        envelope.data.baseData = envelope.data.baseData || {};
        envelope.data.baseData.properties = envelope.data.baseData.properties || {};
        
        // Add EVA-specific context
        envelope.data.baseData.properties.application = 'EVA-DA-2.0';
        envelope.data.baseData.properties.environment = process.env.NODE_ENV || 'development';
        envelope.data.baseData.properties.version = '1.0.0';
        envelope.data.baseData.properties.platform = 'Multi-Agent-AI';
        
        return true;
      });

      this.isInitialized = true;
      console.log('✅ Application Insights initialized successfully');
      
      // Send initialization event
      this.trackEvent('ApplicationInsights_Initialized', {
        configuration: 'EVA-DA-2.0-Multi-Agent',
        samplingPercentage: this.config.samplingPercentage
      });

      return true;
    } catch (error) {
      console.error('❌ Application Insights initialization failed:', error);
      return false;
    }
  }

  /**
   * Track custom events with enhanced context
   */
  trackEvent(name, properties = {}, measurements = {}) {
    if (!this.isInitialized) return;

    const enhancedProperties = {
      ...properties,
      timestamp: new Date().toISOString(),
      source: 'EVA-DA-2.0-MultiAgent'
    };

    this.telemetryClient.trackEvent({
      name,
      properties: enhancedProperties,
      measurements
    });
  }

  /**
   * Track agent-specific activities
   */
  trackAgentActivity(agentId, agentName, activity, properties = {}, measurements = {}) {
    this.trackEvent('Agent_Activity', {
      agentId,
      agentName,
      activity,
      ...properties
    }, measurements);
  }

  /**
   * Track Cosmos DB operations with performance metrics
   */
  trackCosmosDBOperation(operation, containerName, partitionKey, properties = {}, measurements = {}) {
    this.trackEvent('CosmosDB_Operation', {
      operation,
      containerName,
      partitionKey: typeof partitionKey === 'object' ? JSON.stringify(partitionKey) : partitionKey,
      ...properties
    }, {
      requestCharge: measurements.requestCharge || 0,
      itemCount: measurements.itemCount || 0,
      duration: measurements.duration || 0,
      ...measurements
    });
  }

  /**
   * Track OpenAI API calls
   */
  trackOpenAICall(model, tokensUsed, responseTime, properties = {}) {
    this.trackEvent('OpenAI_API_Call', {
      model,
      ...properties
    }, {
      tokensUsed,
      responseTime,
      costEstimate: this.calculateOpenAICost(model, tokensUsed)
    });
  }

  /**
   * Track user conversations
   */
  trackConversation(tenantId, userId, conversationId, messageCount, properties = {}) {
    this.trackEvent('User_Conversation', {
      tenantId,
      userId,
      conversationId,
      ...properties
    }, {
      messageCount
    });
  }

  /**
   * Track security events
   */
  trackSecurityEvent(eventType, severity, properties = {}) {
    this.trackEvent('Security_Event', {
      eventType,
      severity,
      ...properties
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformanceMetric(metricName, value, properties = {}) {
    if (!this.isInitialized) return;

    this.telemetryClient.trackMetric({
      name: metricName,
      value,
      properties
    });
  }

  /**
   * Track exceptions with enhanced context
   */
  trackException(error, properties = {}) {
    if (!this.isInitialized) return;

    this.telemetryClient.trackException({
      exception: error,
      properties: {
        ...properties,
        source: 'EVA-DA-2.0-MultiAgent',
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Track HTTP requests
   */
  trackRequest(name, url, duration, resultCode, success, properties = {}) {
    if (!this.isInitialized) return;

    this.telemetryClient.trackRequest({
      name,
      url,
      duration,
      resultCode,
      success,
      properties
    });
  }

  /**
   * Track dependencies (external service calls)
   */
  trackDependency(name, commandName, duration, success, properties = {}) {
    if (!this.isInitialized) return;

    this.telemetryClient.trackDependency({
      target: name,
      name: commandName,
      data: commandName,
      duration,
      success,
      properties
    });
  }

  /**
   * Flush telemetry data
   */
  flush() {
    if (!this.isInitialized) return;
    
    return new Promise((resolve) => {
      this.telemetryClient.flush({
        callback: () => {
          console.log('📊 Telemetry data flushed to Application Insights');
          resolve();
        }
      });
    });
  }

  /**
   * Calculate estimated OpenAI costs
   */
  calculateOpenAICost(model, tokens) {
    const pricing = {
      'gpt-4': 0.03 / 1000,
      'gpt-4-32k': 0.06 / 1000,
      'gpt-3.5-turbo': 0.002 / 1000,
      'text-embedding-ada-002': 0.0001 / 1000
    };
    
    return (pricing[model] || 0.002 / 1000) * tokens;
  }

  /**
   * Create custom dashboard data
   */
  getDashboardMetrics() {
    return {
      timestamp: new Date().toISOString(),
      metrics: {
        activeAgents: 6,
        totalConversations: 0, // Will be populated from Cosmos DB
        totalMessages: 0,
        averageResponseTime: 0,
        errorRate: 0,
        apiCallsPerMinute: 0
      }
    };
  }
}

// Singleton instance
let evaMonitoring = null;

/**
 * Get or create the EVA monitoring instance
 */
function getEVAMonitoring() {
  if (!evaMonitoring) {
    evaMonitoring = new EVAApplicationInsights();
    evaMonitoring.initialize();
  }
  return evaMonitoring;
}

/**
 * Middleware for Express.js to track all HTTP requests
 */
function createMonitoringMiddleware() {
  const monitoring = getEVAMonitoring();
  
  return (req, res, next) => {
    const startTime = Date.now();
    
    // Track request start
    monitoring.trackEvent('HTTP_Request_Start', {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
    
    // Override res.end to capture response
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      const duration = Date.now() - startTime;
      const success = res.statusCode < 400;
      
      monitoring.trackRequest(
        `${req.method} ${req.route?.path || req.url}`,
        req.url,
        duration,
        res.statusCode,
        success,
        {
          method: req.method,
          statusCode: res.statusCode,
          contentLength: res.get('Content-Length') || 0
        }
      );
      
      originalEnd.call(this, chunk, encoding);
    };
    
    next();
  };
}

/**
 * Health check function for monitoring
 */
async function performHealthCheck() {
  const monitoring = getEVAMonitoring();
  const healthStatus = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    services: {
      applicationInsights: monitoring.isInitialized,
      cosmosDB: false, // Will be checked by Agent 1
      openAI: false,   // Will be checked by Agent 5
      functions: false // Will be checked by Agent 5
    },
    metrics: {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    }
  };

  // Track health check
  monitoring.trackEvent('Health_Check', {
    status: healthStatus.status,
    services: JSON.stringify(healthStatus.services)
  }, {
    uptime: healthStatus.metrics.uptime,
    memoryHeapUsed: healthStatus.metrics.memoryUsage.heapUsed,
    memoryHeapTotal: healthStatus.metrics.memoryUsage.heapTotal
  });

  return healthStatus;
}

// Export for use in other modules
module.exports = {
  EVAApplicationInsights,
  getEVAMonitoring,
  createMonitoringMiddleware,
  performHealthCheck
};

// Initialize monitoring if this file is run directly
if (require.main === module) {
  console.log('🟢 Initializing EVA DA 2.0 Monitoring System...');
  const monitoring = getEVAMonitoring();
  
  // Test monitoring
  monitoring.trackEvent('Monitoring_System_Test', {
    testType: 'initialization',
    success: true
  });
  
  console.log('✅ Monitoring system test completed');
}