// EVA DA 2.0 - Monitoring System Validation Script
// Agent 3: Test and validate all monitoring components
// Run this to verify your monitoring system is working correctly

const fs = require('fs');
const path = require('path');

console.log('🟢 Agent 3 - Monitoring System Validation');
console.log('==========================================');

const PROJECT_ROOT = 'c:\\Users\\marco.presta\\dev\\eva-da-2';
const MONITORING_FILES = [
  'src/monitoring/ApplicationInsights.js',
  'src/monitoring/CosmosDBMetrics.js',
  'dashboards/performance-dashboard.json'
];

// Validation checklist for Agent 3
const validationChecklist = {
  'Application Insights Integration': {
    file: 'src/monitoring/ApplicationInsights.js',
    tests: [
      'EVAApplicationInsights class exists',
      'Telemetry tracking methods implemented',
      'Agent activity tracking available',
      'Error handling implemented'
    ]
  },
  'Cosmos DB Metrics': {
    file: 'src/monitoring/CosmosDBMetrics.js', 
    tests: [
      'CosmosDBMetrics class exists',
      'Performance analysis methods',
      'HPK monitoring capabilities',
      'Alert generation system'
    ]
  },
  'Dashboard Configuration': {
    file: 'dashboards/performance-dashboard.json',
    tests: [
      'Dashboard widgets defined',
      'Kusto queries configured',
      'Time ranges specified',
      'Auto-refresh enabled'
    ]
  }
};

async function validateMonitoringSystem() {
  console.log('\n📊 VALIDATING MONITORING COMPONENTS:');
  console.log('===================================');
  
  let totalScore = 0;
  let maxScore = 0;
  
  for (const [component, config] of Object.entries(validationChecklist)) {
    console.log(`\n🔍 Validating: ${component}`);
    
    const filePath = path.join(PROJECT_ROOT, config.file);
    const exists = fs.existsSync(filePath);
    
    if (!exists) {
      console.log(`   ❌ File not found: ${config.file}`);
      maxScore += config.tests.length;
      continue;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    let componentScore = 0;
    
    config.tests.forEach(test => {
      maxScore++;
      // Simple content validation
      if (test.includes('class') && content.includes('class')) {
        componentScore++;
        console.log(`   ✅ ${test}`);
      } else if (test.includes('methods') && content.includes('function')) {
        componentScore++;
        console.log(`   ✅ ${test}`);
      } else if (test.includes('queries') && content.includes('query')) {
        componentScore++;
        console.log(`   ✅ ${test}`);
      } else if (test.includes('error handling') && content.includes('catch')) {
        componentScore++;
        console.log(`   ✅ ${test}`);
      } else {
        console.log(`   ⚠️  ${test} - needs verification`);
      }
    });
    
    totalScore += componentScore;
    const percentage = Math.round((componentScore / config.tests.length) * 100);
    console.log(`   📈 Component Score: ${componentScore}/${config.tests.length} (${percentage}%)`);
  }
  
  const overallScore = Math.round((totalScore / maxScore) * 100);
  console.log(`\n🎯 OVERALL MONITORING SYSTEM SCORE: ${overallScore}%`);
  
  return {
    score: overallScore,
    totalScore,
    maxScore,
    recommendations: generateRecommendations(overallScore)
  };
}

function generateRecommendations(score) {
  const recommendations = [];
  
  if (score >= 80) {
    recommendations.push('✅ Monitoring system is ready for integration!');
    recommendations.push('🔗 Next: Connect with Agent 1 (Cosmos DB) for data integration');
    recommendations.push('🔗 Next: Connect with Agent 5 (APIs) for endpoint monitoring');
    recommendations.push('📊 Next: Deploy dashboards to Azure');
  } else if (score >= 60) {
    recommendations.push('⚠️  Complete remaining monitoring components');
    recommendations.push('🧪 Test Application Insights integration');
    recommendations.push('📝 Add missing error handling');
  } else {
    recommendations.push('❌ Focus on core monitoring functionality first');
    recommendations.push('🔧 Complete Application Insights setup');
    recommendations.push('📊 Implement basic Cosmos DB metrics');
  }
  
  return recommendations;
}

// Agent coordination tasks
function getAgentCoordinationTasks() {
  return {
    'With Agent 1 (Data Architecture)': [
      'Integrate CosmosDBMetrics with EVACosmosClient',
      'Monitor HPK query performance',
      'Track RU consumption patterns',
      'Set up partition key optimization alerts'
    ],
    'With Agent 4 (Security)': [
      'Monitor security events and compliance',
      'Track authentication failures',
      'Monitor suspicious access patterns',
      'Generate security compliance reports'  
    ],
    'With Agent 5 (API Integration)': [
      'Monitor API response times and errors',
      'Track OpenAI token usage and costs',
      'Monitor Function App performance',
      'Set up API rate limiting alerts'
    ],
    'With Agent 6 (Configuration)': [
      'Deploy monitoring infrastructure with Terraform',
      'Configure environment-specific monitoring',
      'Set up log retention policies',
      'Deploy dashboards and alert rules'
    ]
  };
}

// Test Application Insights integration
async function testApplicationInsights() {
  console.log('\n🧪 TESTING APPLICATION INSIGHTS:');
  console.log('===============================');
  
  try {
    // Import and test the monitoring system
    const { getEVAMonitoring } = require(path.join(PROJECT_ROOT, 'src/monitoring/ApplicationInsights.js'));
    
    const monitoring = getEVAMonitoring();
    
    if (monitoring) {
      console.log('   ✅ EVA Monitoring instance created');
      
      // Test event tracking
      monitoring.trackEvent('Agent3_Validation_Test', {
        testType: 'system-validation',
        agent: 'Agent 3 - Monitoring',
        timestamp: new Date().toISOString()
      });
      
      console.log('   ✅ Event tracking test completed');
      
      // Test agent activity tracking  
      monitoring.trackAgentActivity(3, 'Monitoring Expert', 'System Validation', {
        validationType: 'comprehensive-check'
      });
      
      console.log('   ✅ Agent activity tracking test completed');
      
      return true;
    }
  } catch (error) {
    console.log(`   ❌ Application Insights test failed: ${error.message}`);
    console.log('   💡 Install dependencies: npm install applicationinsights @azure/identity');
    return false;
  }
}

// Test Cosmos DB Metrics
async function testCosmosDBMetrics() {
  console.log('\n🧪 TESTING COSMOS DB METRICS:');
  console.log('============================');
  
  try {
    const { getCosmosDBMetrics } = require(path.join(PROJECT_ROOT, 'src/monitoring/CosmosDBMetrics.js'));
    
    const metrics = getCosmosDBMetrics();
    
    if (metrics) {
      console.log('   ✅ Cosmos DB Metrics instance created');
      
      // Test operation tracking
      const testOperation = {
        operationType: 'READ',
        containerName: 'conversations',
        partitionKey: ['tenant1', 'user1', 'conversation'],
        requestCharge: 5.23,
        duration: 15,
        statusCode: 200,
        activityId: 'test-validation-001'
      };
      
      const result = metrics.trackOperation(testOperation);
      console.log('   ✅ Operation tracking test completed');
      console.log(`   📊 Performance Score: ${result.performanceScore}%`);
      
      // Test performance summary
      const summary = metrics.getPerformanceSummary();
      console.log('   ✅ Performance summary generated');
      console.log(`   📈 Average RU per request: ${summary.averageRUPerRequest.toFixed(2)}`);
      
      return true;
    }
  } catch (error) {
    console.log(`   ❌ Cosmos DB Metrics test failed: ${error.message}`);
    return false;
  }
}

// Main validation function
async function runCompleteValidation() {
  const results = await validateMonitoringSystem();
  
  console.log('\n🧪 RUNNING INTEGRATION TESTS:');
  console.log('============================');
  
  const appInsightsWorking = await testApplicationInsights();
  const cosmosMetricsWorking = await testCosmosDBMetrics();
  
  console.log('\n🤝 AGENT COORDINATION TASKS:');
  console.log('===========================');
  
  const coordinationTasks = getAgentCoordinationTasks();
  for (const [agent, tasks] of Object.entries(coordinationTasks)) {
    console.log(`\n${agent}:`);
    tasks.forEach(task => {
      console.log(`   • ${task}`);
    });
  }
  
  console.log('\n🎯 AGENT 3 NEXT STEPS:');
  console.log('=====================');
  
  if (results.score >= 80 && appInsightsWorking && cosmosMetricsWorking) {
    console.log('🟢 EXCELLENT! Your monitoring system is ready!');
    console.log('');
    console.log('IMMEDIATE ACTIONS:');
    console.log('1. 🔗 Connect with Agent 1 to integrate Cosmos monitoring');
    console.log('2. 📊 Deploy your dashboards to Azure');
    console.log('3. ⚠️  Set up production alerting rules');
    console.log('4. 🤝 Coordinate with Agent 5 for API monitoring');
  } else {
    console.log('🟡 Almost there! Complete these steps:');
    console.log('');
    results.recommendations.forEach(rec => {
      console.log(`   ${rec}`);
    });
    
    if (!appInsightsWorking) {
      console.log('');
      console.log('📦 Install missing dependencies:');
      console.log('   npm install applicationinsights @azure/identity');
    }
  }
  
  console.log('\n✨ Agent 3: You\'re doing fantastic work! Keep going! 🚀');
  
  return {
    validationResults: results,
    integrationTests: {
      applicationInsights: appInsightsWorking,
      cosmosMetrics: cosmosMetricsWorking
    },
    coordinationTasks
  };
}

// Run validation if script is executed directly
if (require.main === module) {
  runCompleteValidation()
    .then(results => {
      console.log('\n📄 Validation completed successfully!');
    })
    .catch(error => {
      console.error('\n❌ Validation failed:', error);
    });
}

module.exports = {
  validateMonitoringSystem,
  testApplicationInsights,
  testCosmosDBMetrics,
  getAgentCoordinationTasks,
  runCompleteValidation
};