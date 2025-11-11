// EVA DA 2.0 - Cosmos DB Performance Monitoring
// Real-time monitoring of HPK containers and RU consumption
// Agent 3 specific: Performance metrics and optimization

const { getEVAMonitoring } = require('./ApplicationInsights');

/**
 * Cosmos DB Performance Monitor
 * Tracks RU consumption, query performance, and HPK efficiency
 */
class CosmosDBMetrics {
  constructor() {
    this.monitoring = getEVAMonitoring();
    this.metrics = {
      totalRequests: 0,
      totalRUConsumed: 0,
      averageLatency: 0,
      hotPartitions: new Set(),
      errorCount: 0,
      throttleCount: 0
    };
    
    // Performance thresholds
    this.thresholds = {
      highLatency: 100, // ms
      highRUConsumption: 50, // RU per operation
      maxRetries: 3
    };
  }

  /**
   * Track Cosmos DB operation performance
   */
  trackOperation(operation) {
    const {
      operationType,
      containerName,
      partitionKey,
      requestCharge,
      duration,
      statusCode,
      activityId,
      itemCount = 1,
      error = null
    } = operation;

    // Update internal metrics
    this.metrics.totalRequests++;
    this.metrics.totalRUConsumed += requestCharge || 0;
    this.metrics.averageLatency = (this.metrics.averageLatency + (duration || 0)) / 2;

    if (error || statusCode >= 400) {
      this.metrics.errorCount++;
      if (statusCode === 429) {
        this.metrics.throttleCount++;
      }
    }

    // Track performance alerts
    const performanceIssues = this.analyzePerformance(operation);
    
    // Send metrics to Application Insights
    this.monitoring.trackCosmosDBOperation(
      operationType,
      containerName,
      partitionKey,
      {
        statusCode: statusCode?.toString(),
        activityId,
        partitionKeyType: typeof partitionKey,
        hasError: !!error,
        errorMessage: error?.message,
        performanceFlags: performanceIssues.join(','),
        timestamp: new Date().toISOString()
      },
      {
        requestCharge: requestCharge || 0,
        duration: duration || 0,
        itemCount,
        averageRUPerItem: itemCount > 0 ? (requestCharge || 0) / itemCount : 0
      }
    );

    // Send performance alerts if needed
    this.handlePerformanceAlerts(operation, performanceIssues);

    return {
      ...operation,
      performanceScore: this.calculatePerformanceScore(operation),
      issues: performanceIssues
    };
  }

  /**
   * Analyze operation performance
   */
  analyzePerformance(operation) {
    const issues = [];
    const { requestCharge, duration, statusCode, partitionKey } = operation;

    // High latency check
    if (duration > this.thresholds.highLatency) {
      issues.push('HIGH_LATENCY');
    }

    // High RU consumption
    if (requestCharge > this.thresholds.highRUConsumption) {
      issues.push('HIGH_RU_CONSUMPTION');
    }

    // Throttling
    if (statusCode === 429) {
      issues.push('THROTTLED');
    }

    // Hot partition detection
    if (this.isHotPartition(partitionKey)) {
      issues.push('HOT_PARTITION');
    }

    // Cross-partition query detection
    if (requestCharge > 20 && duration > 50) {
      issues.push('POTENTIAL_CROSS_PARTITION_QUERY');
    }

    return issues;
  }

  /**
   * Calculate performance score (0-100)
   */
  calculatePerformanceScore(operation) {
    const { requestCharge = 0, duration = 0, statusCode = 200 } = operation;
    
    let score = 100;
    
    // Deduct for high latency
    if (duration > this.thresholds.highLatency) {
      score -= Math.min(30, (duration - this.thresholds.highLatency) / 10);
    }
    
    // Deduct for high RU consumption
    if (requestCharge > this.thresholds.highRUConsumption) {
      score -= Math.min(25, (requestCharge - this.thresholds.highRUConsumption));
    }
    
    // Deduct for errors
    if (statusCode >= 400) {
      score -= statusCode === 429 ? 20 : 40;
    }
    
    return Math.max(0, Math.round(score));
  }

  /**
   * Detect hot partitions
   */
  isHotPartition(partitionKey) {
    // Simple hot partition detection based on frequency
    const key = JSON.stringify(partitionKey);
    
    // Track partition access frequency (simplified)
    if (!this.partitionAccess) {
      this.partitionAccess = new Map();
    }
    
    const currentCount = this.partitionAccess.get(key) || 0;
    this.partitionAccess.set(key, currentCount + 1);
    
    // Consider it hot if accessed more than 10 times in recent memory
    return currentCount > 10;
  }

  /**
   * Handle performance alerts
   */
  handlePerformanceAlerts(operation, issues) {
    if (issues.length === 0) return;

    const severity = this.calculateAlertSeverity(issues);
    
    this.monitoring.trackEvent('CosmosDB_Performance_Alert', {
      container: operation.containerName,
      operationType: operation.operationType,
      issues: issues.join(','),
      severity,
      partitionKey: JSON.stringify(operation.partitionKey),
      activityId: operation.activityId
    }, {
      requestCharge: operation.requestCharge || 0,
      duration: operation.duration || 0,
      performanceScore: this.calculatePerformanceScore(operation)
    });

    // Log critical issues
    if (severity === 'Critical') {
      console.warn(`🚨 Critical Cosmos DB performance issue:`, {
        container: operation.containerName,
        issues,
        requestCharge: operation.requestCharge,
        duration: operation.duration
      });
    }
  }

  /**
   * Calculate alert severity
   */
  calculateAlertSeverity(issues) {
    if (issues.includes('THROTTLED') || issues.includes('HOT_PARTITION')) {
      return 'Critical';
    }
    if (issues.includes('HIGH_RU_CONSUMPTION') || issues.includes('POTENTIAL_CROSS_PARTITION_QUERY')) {
      return 'Warning';
    }
    return 'Info';
  }

  /**
   * Get current performance summary
   */
  getPerformanceSummary() {
    const summary = {
      timestamp: new Date().toISOString(),
      metrics: { ...this.metrics },
      averageRUPerRequest: this.metrics.totalRequests > 0 
        ? this.metrics.totalRUConsumed / this.metrics.totalRequests 
        : 0,
      errorRate: this.metrics.totalRequests > 0 
        ? (this.metrics.errorCount / this.metrics.totalRequests) * 100 
        : 0,
      throttleRate: this.metrics.totalRequests > 0 
        ? (this.metrics.throttleCount / this.metrics.totalRequests) * 100 
        : 0,
      recommendations: this.generateRecommendations()
    };

    // Send summary metrics
    this.monitoring.trackEvent('CosmosDB_Performance_Summary', {
      totalRequests: this.metrics.totalRequests.toString(),
      errorRate: summary.errorRate.toFixed(2),
      throttleRate: summary.throttleRate.toFixed(2)
    }, {
      totalRUConsumed: this.metrics.totalRUConsumed,
      averageLatency: this.metrics.averageLatency,
      averageRUPerRequest: summary.averageRUPerRequest
    });

    return summary;
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.metrics.throttleCount > 0) {
      recommendations.push({
        type: 'SCALE_UP',
        message: 'Consider increasing provisioned throughput to reduce throttling',
        priority: 'High'
      });
    }

    if (this.metrics.averageLatency > this.thresholds.highLatency) {
      recommendations.push({
        type: 'OPTIMIZE_QUERIES',
        message: 'Review queries for cross-partition operations and indexing optimization',
        priority: 'Medium'
      });
    }

    if (this.metrics.totalRUConsumed / this.metrics.totalRequests > 20) {
      recommendations.push({
        type: 'REVIEW_DATA_MODEL',
        message: 'Consider data model optimization to reduce RU consumption',
        priority: 'Medium'
      });
    }

    if (this.metrics.hotPartitions.size > 0) {
      recommendations.push({
        type: 'PARTITION_KEY_REVIEW',
        message: 'Review partition key strategy to distribute load more evenly',
        priority: 'High'
      });
    }

    return recommendations;
  }

  /**
   * HPK-specific monitoring
   */
  trackHPKPerformance(hpkOperation) {
    const {
      tenantId,
      userId,
      entityType,
      queryType, // 'single-partition', 'multi-partition', 'cross-partition'
      partitionsAccessed,
      ...operationData
    } = hpkOperation;

    // Track HPK efficiency
    this.monitoring.trackEvent('CosmosDB_HPK_Operation', {
      tenantId,
      userId,
      entityType,
      queryType,
      partitionsAccessed: partitionsAccessed.toString(),
      hpkLevel1: tenantId,
      hpkLevel2: userId,
      hpkLevel3: entityType
    }, {
      requestCharge: operationData.requestCharge || 0,
      duration: operationData.duration || 0,
      itemCount: operationData.itemCount || 0,
      partitionCount: partitionsAccessed
    });

    // Analyze HPK effectiveness
    const hpkEfficiency = this.analyzeHPKEfficiency(hpkOperation);
    
    if (hpkEfficiency.issues.length > 0) {
      this.monitoring.trackEvent('CosmosDB_HPK_Issue', {
        tenantId,
        userId,
        entityType,
        issues: hpkEfficiency.issues.join(','),
        queryType
      });
    }

    return hpkEfficiency;
  }

  /**
   * Analyze HPK efficiency
   */
  analyzeHPKEfficiency(hpkOperation) {
    const issues = [];
    const { queryType, partitionsAccessed, requestCharge } = hpkOperation;

    // Check if HPK is being used effectively
    if (queryType === 'cross-partition' && partitionsAccessed > 10) {
      issues.push('EXCESSIVE_CROSS_PARTITION_ACCESS');
    }

    if (requestCharge > 50 && queryType !== 'single-partition') {
      issues.push('HIGH_RU_MULTI_PARTITION_QUERY');
    }

    // HPK level utilization
    if (!hpkOperation.tenantId || !hpkOperation.userId) {
      issues.push('INCOMPLETE_HPK_USAGE');
    }

    return {
      efficiency: this.calculateHPKEfficiency(hpkOperation),
      issues,
      recommendations: this.getHPKRecommendations(issues)
    };
  }

  /**
   * Calculate HPK efficiency score
   */
  calculateHPKEfficiency(hpkOperation) {
    const { queryType, partitionsAccessed, requestCharge } = hpkOperation;
    
    let score = 100;
    
    // Prefer single partition queries
    if (queryType === 'single-partition') {
      score += 0; // No penalty
    } else if (queryType === 'multi-partition' && partitionsAccessed <= 3) {
      score -= 10; // Small penalty for limited multi-partition
    } else if (queryType === 'cross-partition') {
      score -= 30; // Larger penalty for cross-partition
    }
    
    // RU efficiency
    if (requestCharge > 20) {
      score -= Math.min(20, (requestCharge - 20) / 2);
    }
    
    return Math.max(0, Math.round(score));
  }

  /**
   * Get HPK-specific recommendations
   */
  getHPKRecommendations(issues) {
    const recommendations = [];
    
    if (issues.includes('EXCESSIVE_CROSS_PARTITION_ACCESS')) {
      recommendations.push('Consider restructuring queries to limit partition access');
    }
    
    if (issues.includes('HIGH_RU_MULTI_PARTITION_QUERY')) {
      recommendations.push('Optimize multi-partition queries or consider data denormalization');
    }
    
    if (issues.includes('INCOMPLETE_HPK_USAGE')) {
      recommendations.push('Ensure all HPK levels (tenantId, userId, entityType) are utilized');
    }
    
    return recommendations;
  }

  /**
   * Reset metrics (for testing or periodic cleanup)
   */
  resetMetrics() {
    this.metrics = {
      totalRequests: 0,
      totalRUConsumed: 0,
      averageLatency: 0,
      hotPartitions: new Set(),
      errorCount: 0,
      throttleCount: 0
    };
    
    this.partitionAccess = new Map();
    
    this.monitoring.trackEvent('CosmosDB_Metrics_Reset', {
      resetTime: new Date().toISOString()
    });
  }
}

// Singleton instance
let cosmosMetrics = null;

/**
 * Get or create Cosmos DB metrics instance
 */
function getCosmosDBMetrics() {
  if (!cosmosMetrics) {
    cosmosMetrics = new CosmosDBMetrics();
  }
  return cosmosMetrics;
}

/**
 * Middleware for Cosmos DB operations
 */
function createCosmosMonitoringWrapper(cosmosClient) {
  const metrics = getCosmosDBMetrics();
  
  return {
    // Wrap container operations
    wrapContainer: (container, containerName) => {
      const originalCreate = container.items.create.bind(container.items);
      const originalRead = container.item.bind(container);
      const originalQuery = container.items.query.bind(container.items);

      // Wrap create operations
      container.items.create = async (body, options = {}) => {
        const startTime = Date.now();
        let result, error;
        
        try {
          result = await originalCreate(body, options);
          
          metrics.trackOperation({
            operationType: 'CREATE',
            containerName,
            partitionKey: options.partitionKey || body.partitionKey,
            requestCharge: result.requestCharge,
            duration: Date.now() - startTime,
            statusCode: result.statusCode,
            activityId: result.activityId,
            itemCount: 1
          });
          
          return result;
        } catch (err) {
          error = err;
          
          metrics.trackOperation({
            operationType: 'CREATE',
            containerName,
            partitionKey: options.partitionKey,
            duration: Date.now() - startTime,
            statusCode: err.code || 500,
            error: err,
            itemCount: 0
          });
          
          throw err;
        }
      };

      // Wrap read operations
      const originalItemMethod = container.item;
      container.item = (id, partitionKey) => {
        const item = originalItemMethod(id, partitionKey);
        const originalItemRead = item.read.bind(item);
        
        item.read = async (options = {}) => {
          const startTime = Date.now();
          
          try {
            const result = await originalItemRead(options);
            
            metrics.trackOperation({
              operationType: 'READ',
              containerName,
              partitionKey,
              requestCharge: result.requestCharge,
              duration: Date.now() - startTime,
              statusCode: result.statusCode,
              activityId: result.activityId,
              itemCount: result.resource ? 1 : 0
            });
            
            return result;
          } catch (err) {
            metrics.trackOperation({
              operationType: 'READ',
              containerName,
              partitionKey,
              duration: Date.now() - startTime,
              statusCode: err.code || 500,
              error: err,
              itemCount: 0
            });
            
            throw err;
          }
        };
        
        return item;
      };

      return container;
    }
  };
}

module.exports = {
  CosmosDBMetrics,
  getCosmosDBMetrics,
  createCosmosMonitoringWrapper
};

// Test the monitoring system
if (require.main === module) {
  console.log('🟢 Testing Cosmos DB Metrics System...');
  
  const metrics = getCosmosDBMetrics();
  
  // Simulate some operations
  metrics.trackOperation({
    operationType: 'CREATE',
    containerName: 'conversations',
    partitionKey: ['tenant1', 'user1', 'conversation'],
    requestCharge: 7.23,
    duration: 15,
    statusCode: 201,
    activityId: 'test-activity-1',
    itemCount: 1
  });
  
  metrics.trackOperation({
    operationType: 'QUERY',
    containerName: 'messages',
    partitionKey: ['tenant1', 'user1', 'conv123'],
    requestCharge: 12.45,
    duration: 35,
    statusCode: 200,
    activityId: 'test-activity-2',
    itemCount: 5
  });
  
  // Get performance summary
  const summary = metrics.getPerformanceSummary();
  console.log('📊 Performance Summary:', JSON.stringify(summary, null, 2));
  
  console.log('✅ Cosmos DB Metrics test completed');
}