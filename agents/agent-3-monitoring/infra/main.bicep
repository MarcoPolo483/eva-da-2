// EVA DA 2.0 Monitoring Infrastructure
// Comprehensive monitoring, alerting, and performance optimization
// Agent 3 - Monitoring Expert

@description('Environment name (dev, staging, prod)')
param environment string = 'dev'

@description('Location for all resources')
param location string = resourceGroup().location

@description('Application name prefix')
param appName string = 'eva-da-2'

@description('Enable advanced monitoring features')
param enableAdvancedMonitoring bool = true

@description('Enable custom metrics and alerts')
param enableCustomAlerts bool = true

@description('Notification email for alerts')
param alertNotificationEmail string = ''

// Variables for resource naming
var resourceSuffix = '${appName}-${environment}-${substring(uniqueString(resourceGroup().id), 0, 6)}'
var logAnalyticsName = 'la-monitoring-${resourceSuffix}'
var appInsightsName = 'ai-monitoring-${resourceSuffix}'
var dashboardName = 'dashboard-${resourceSuffix}'
var actionGroupName = 'ag-${resourceSuffix}'
var workbookName = 'workbook-${resourceSuffix}'

// Tags for resource organization
var commonTags = {
  Environment: environment
  Application: appName
  Component: 'Monitoring'
  ManagedBy: 'Agent-3-Monitoring'
  Project: 'EVA-DA-2.0'
  CostCenter: 'IT-Observability'
}

// Enhanced Log Analytics Workspace with advanced monitoring
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsName
  location: location
  tags: commonTags
  properties: {
    sku: {
      name: environment == 'prod' ? 'PerGB2018' : 'pergb2018'
    }
    retentionInDays: environment == 'prod' ? 90 : 30
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
      immediatePurgeDataOn30Days: environment != 'prod'
    }
    workspaceCapping: {
      dailyQuotaGb: environment == 'prod' ? 100 : 5
    }
  }
}

// Application Insights with advanced configuration
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  tags: commonTags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
    IngestionMode: 'LogAnalytics'
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
    SamplingPercentage: environment == 'prod' ? 10 : 100
    RetentionInDays: environment == 'prod' ? 90 : 30
  }
}

// Action Group for alert notifications
resource actionGroup 'Microsoft.Insights/actionGroups@2023-01-01' = if (!empty(alertNotificationEmail)) {
  name: actionGroupName
  location: 'Global'
  tags: commonTags
  properties: {
    groupShortName: 'EVA-Alerts'
    enabled: true
    emailReceivers: [
      {
        name: 'AdminEmail'
        emailAddress: alertNotificationEmail
        useCommonAlertSchema: true
      }
    ]
    smsReceivers: []
    webhookReceivers: []
    eventHubReceivers: []
    itsmReceivers: []
    azureAppPushReceivers: []
    automationRunbookReceivers: []
    voiceReceivers: []
    logicAppReceivers: []
    azureFunctionReceivers: []
    armRoleReceivers: []
  }
}

// Cosmos DB Performance Alert
resource cosmosDbRuAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = if (enableCustomAlerts && !empty(alertNotificationEmail)) {
  name: 'CosmosDB-HighRU-Alert-${resourceSuffix}'
  location: 'Global'
  tags: commonTags
  properties: {
    description: 'Alert when Cosmos DB RU consumption exceeds 80%'
    enabled: true
    severity: 2
    evaluationFrequency: 'PT1M'
    windowSize: 'PT5M'
    scopes: [
      '/subscriptions/${subscription().subscriptionId}/resourceGroups/${resourceGroup().name}/providers/Microsoft.DocumentDB/databaseAccounts/*'
    ]
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'HighRUConsumption'
          metricName: 'NormalizedRUConsumption'
          operator: 'GreaterThan'
          threshold: 80
          timeAggregation: 'Average'
          criterionType: 'StaticThresholdCriterion'
        }
      ]
    }
    actions: [
      {
        actionGroupId: actionGroup.id
      }
    ]
  }
}

// Function App Performance Alert
resource functionAppAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = if (enableCustomAlerts && !empty(alertNotificationEmail)) {
  name: 'FunctionApp-HighLatency-Alert-${resourceSuffix}'
  location: 'Global'
  tags: commonTags
  properties: {
    description: 'Alert when Function App response time exceeds 5 seconds'
    enabled: true
    severity: 2
    evaluationFrequency: 'PT1M'
    windowSize: 'PT5M'
    scopes: [
      '/subscriptions/${subscription().subscriptionId}/resourceGroups/${resourceGroup().name}/providers/Microsoft.Web/sites/*'
    ]
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'HighResponseTime'
          metricName: 'HttpResponseTime'
          operator: 'GreaterThan'
          threshold: 5000
          timeAggregation: 'Average'
          criterionType: 'StaticThresholdCriterion'
        }
      ]
    }
    actions: [
      {
        actionGroupId: actionGroup.id
      }
    ]
  }
}

// Application Insights Error Rate Alert
resource appInsightsErrorAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = if (enableCustomAlerts && !empty(alertNotificationEmail)) {
  name: 'AppInsights-HighErrorRate-Alert-${resourceSuffix}'
  location: 'Global'
  tags: commonTags
  properties: {
    description: 'Alert when error rate exceeds 5%'
    enabled: true
    severity: 1
    evaluationFrequency: 'PT1M'
    windowSize: 'PT5M'
    scopes: [
      appInsights.id
    ]
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'HighErrorRate'
          metricName: 'requests/failed'
          operator: 'GreaterThan'
          threshold: 5
          timeAggregation: 'Count'
          criterionType: 'StaticThresholdCriterion'
        }
      ]
    }
    actions: [
      {
        actionGroupId: actionGroup.id
      }
    ]
  }
}

// Custom Dashboard for EVA DA 2.0
resource dashboard 'Microsoft.Portal/dashboards@2020-09-01-preview' = {
  name: dashboardName
  location: location
  tags: commonTags
  properties: {
    lenses: [
      {
        order: 0
        parts: [
          // Application Insights Performance Tile
          {
            position: {
              x: 0
              y: 0
              rowSpan: 4
              colSpan: 6
            }
            metadata: {
              inputs: [
                {
                  name: 'ComponentId'
                  value: appInsights.id
                }
                {
                  name: 'TimeRange'
                  value: 'PT1H'
                }
              ]
              type: 'Extension/AppInsightsExtension/PartType/AppMapGalPt'
              settings: {
                content: {
                  title: 'EVA DA 2.0 - Application Map'
                }
              }
            }
          }
          // Performance Counters Tile
          {
            position: {
              x: 6
              y: 0
              rowSpan: 4
              colSpan: 6
            }
            metadata: {
              inputs: [
                {
                  name: 'ComponentId'
                  value: appInsights.id
                }
                {
                  name: 'TimeRange'
                  value: 'PT1H'
                }
              ]
              type: 'Extension/AppInsightsExtension/PartType/PerformanceCountersPinnedPart'
              settings: {
                content: {
                  title: 'Performance Metrics'
                }
              }
            }
          }
          // Cosmos DB Metrics Tile
          {
            position: {
              x: 0
              y: 4
              rowSpan: 4
              colSpan: 12
            }
            metadata: {
              inputs: [
                {
                  name: 'ResourceId'
                  value: '/subscriptions/${subscription().subscriptionId}/resourceGroups/${resourceGroup().name}/providers/Microsoft.DocumentDB/databaseAccounts'
                }
                {
                  name: 'TimeRange'
                  value: 'PT1H'
                }
              ]
              type: 'Extension/Microsoft_Azure_DocumentDB/PartType/MonitoringPart'
              settings: {
                content: {
                  title: 'Cosmos DB - RU Consumption & Latency'
                }
              }
            }
          }
        ]
      }
    ]
    metadata: {
      model: {
        timeRange: {
          value: {
            relative: {
              duration: 24
              timeUnit: 1
            }
          }
          type: 'MsPortalFx.Composition.Configuration.ValueTypes.TimeRange'
        }
        filterLocale: {
          value: 'en-us'
        }
        filters: {
          value: {
            MsPortalFx_TimeRange: {
              model: {
                format: 'utc'
                granularity: 'auto'
                relative: '24h'
              }
              displayCache: {
                name: 'UTC Time'
                value: 'Past 24 hours'
              }
              filteredPartIds: []
            }
          }
        }
      }
    }
  }
}

// Output values for integration with other agents
output logAnalyticsWorkspaceId string = logAnalytics.id
output logAnalyticsCustomerId string = logAnalytics.properties.customerId
output appInsightsId string = appInsights.id
output appInsightsInstrumentationKey string = appInsights.properties.InstrumentationKey
output appInsightsConnectionString string = appInsights.properties.ConnectionString
output dashboardId string = dashboard.id
output actionGroupId string = enableCustomAlerts && !empty(alertNotificationEmail) ? actionGroup.id : ''

// Data collection rules for enhanced monitoring
resource dataCollectionRule 'Microsoft.Insights/dataCollectionRules@2022-06-01' = if (enableAdvancedMonitoring) {
  name: 'dcr-${resourceSuffix}'
  location: location
  tags: commonTags
  properties: {
    description: 'Enhanced monitoring data collection for EVA DA 2.0'
    dataSources: {
      performanceCounters: [
        {
          name: 'perfCounterDataSource'
          streams: ['Microsoft-Perf']
          samplingFrequencyInSeconds: 60
          counterSpecifiers: [
            '\\Processor(_Total)\\% Processor Time'
            '\\Memory\\Available MBytes'
            '\\Network Interface(*)\\Bytes Total/sec'
          ]
        }
      ]
      windowsEventLogs: [
        {
          name: 'eventLogDataSource'
          streams: ['Microsoft-WindowsEvent']
          xPathQueries: [
            'Application!*[System[(Level=1 or Level=2 or Level=3)]]'
            'System!*[System[(Level=1 or Level=2 or Level=3)]]'
          ]
        }
      ]
    }
    destinations: {
      logAnalytics: [
        {
          workspaceResourceId: logAnalytics.id
          name: 'la-destination'
        }
      ]
    }
    dataFlows: [
      {
        streams: ['Microsoft-Perf']
        destinations: ['la-destination']
      }
      {
        streams: ['Microsoft-WindowsEvent']
        destinations: ['la-destination']
      }
    ]
  }
}
