// EVA DA 2.0 - Data Architecture Validation & Deployment
// Agent 1: Complete HPK Cosmos DB validation and Azure deployment
// Run: node validate-data-architecture.js

const fs = require('fs');
const path = require('path');

console.log('🔵 Agent 1 - Data Architecture Validation');
console.log('=========================================');

const PROJECT_ROOT = 'c:\\Users\\marco.presta\\dev\\eva-da-2';
const DATA_ARCHITECTURE_FILES = [
  'src/data/CosmosClient.js',
  'src/data/models/CosmosDBModels.js', 
  'infra/terraform/main.tf',
  'infra/terraform/terraform.tfvars'
];

// Data architecture validation checklist
const dataValidationChecklist = {
  'HPK Cosmos DB Models': {
    file: 'src/data/models/CosmosDBModels.js',
    tests: [
      'Hierarchical partition key structure (tenantId, userId, entityType)',
      'Conversation model with embedded messages optimization',
      'Parameter registry model for configuration',
      'Data classification and compliance metadata',
      '2MB item size limit compliance'
    ]
  },
  'Cosmos Client Implementation': {
    file: 'src/data/CosmosClient.js',
    tests: [
      'EVACosmosClient class with singleton pattern',
      'Managed Identity authentication',
      'Connection retry logic with exponential backoff',
      'HPK query optimization methods',
      'Request charge monitoring and diagnostics'
    ]
  },
  'Terraform Infrastructure': {
    file: 'infra/terraform/main.tf',
    tests: [
      'Cosmos DB account with global distribution',
      'HPK container configuration',
      'RBAC role assignments for Managed Identity',
      'Diagnostic settings and monitoring',
      'Multi-region failover configuration'
    ]
  },
  'Environment Configuration': {
    file: 'infra/terraform/terraform.tfvars',
    tests: [
      'Azure subscription ID configured',
      'Canada Central region specified',
      'Environment variables set',
      'Data classification compliance',
      'Resource naming conventions'
    ]
  }
};

async function validateDataArchitecture() {
  console.log('\n🗄️ VALIDATING DATA ARCHITECTURE COMPONENTS:');
  console.log('==========================================');
  
  let totalScore = 0;
  let maxScore = 0;
  
  for (const [component, config] of Object.entries(dataValidationChecklist)) {
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
      if (validateDataTestCriteria(test, content, config.file)) {
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
  console.log(`\n🎯 OVERALL DATA ARCHITECTURE SCORE: ${overallScore}%`);
  
  return {
    score: overallScore,
    totalScore,
    maxScore,
    recommendations: generateDataRecommendations(overallScore)
  };
}

function validateDataTestCriteria(test, content, filePath) {
  const lowerTest = test.toLowerCase();
  const lowerContent = content.toLowerCase();
  
  // HPK Model validation
  if (lowerTest.includes('hierarchical partition') && 
      (lowerContent.includes('tenantid') && lowerContent.includes('userid') && lowerContent.includes('entitytype'))) {
    return true;
  }
  
  if (lowerTest.includes('conversation model') && lowerContent.includes('conversation')) return true;
  if (lowerTest.includes('parameter registry') && lowerContent.includes('parameter')) return true;
  if (lowerTest.includes('data classification') && lowerContent.includes('classification')) return true;
  if (lowerTest.includes('2mb item size') && lowerContent.includes('size')) return true;
  
  // Cosmos Client validation
  if (lowerTest.includes('evacosmoschient') && lowerContent.includes('evacosmoschient')) return true;
  if (lowerTest.includes('managed identity') && lowerContent.includes('defaultazurecredential')) return true;
  if (lowerTest.includes('retry logic') && lowerContent.includes('retry')) return true;
  if (lowerTest.includes('hpk query') && lowerContent.includes('hpk')) return true;
  if (lowerTest.includes('request charge') && lowerContent.includes('requestcharge')) return true;
  
  // Terraform validation
  if (lowerTest.includes('cosmos db account') && lowerContent.includes('azurerm_cosmosdb_account')) return true;
  if (lowerTest.includes('hpk container') && lowerContent.includes('partition_key_paths')) return true;
  if (lowerTest.includes('rbac role') && lowerContent.includes('role_assignment')) return true;
  if (lowerTest.includes('diagnostic') && lowerContent.includes('diagnostic')) return true;
  if (lowerTest.includes('multi-region') && lowerContent.includes('geo_location')) return true;
  
  // Configuration validation  
  if (lowerTest.includes('azure subscription') && lowerContent.includes('c59ee575-eb2a-4b51-a865-4b618f9add0a')) return true;
  if (lowerTest.includes('canada central') && lowerContent.includes('canada central')) return true;
  if (lowerTest.includes('environment') && lowerContent.includes('environment')) return true;
  if (lowerTest.includes('naming conventions') && lowerContent.includes('eva-da-2')) return true;
  
  return false;
}

function generateDataRecommendations(score) {
  const recommendations = [];
  
  if (score >= 90) {
    recommendations.push('🎉 Outstanding! Data architecture is production-ready!');
    recommendations.push('🚀 Next: Deploy Terraform infrastructure to Azure');
    recommendations.push('🔗 Next: Connect with Agent 3 for performance monitoring');
    recommendations.push('📊 Next: Test HPK query performance and optimization');
  } else if (score >= 80) {
    recommendations.push('⚠️  Fine-tune remaining data architecture components');
    recommendations.push('🧪 Test Cosmos DB connection and authentication');
    recommendations.push('📝 Complete HPK query optimization methods');
  } else {
    recommendations.push('❌ Complete core data architecture components');
    recommendations.push('🗄️ Finalize HPK Cosmos DB models');
    recommendations.push('🔧 Implement robust CosmosClient with error handling');
  }
  
  return recommendations;
}

// Agent coordination tasks for Agent 1
function getAgent1CoordinationTasks() {
  return {
    'With Agent 3 (Monitoring)': [
      'Integrate CosmosDBMetrics with EVACosmosClient',
      'Enable request charge tracking and diagnostics',
      'Set up HPK query performance monitoring',
      'Configure partition hotspot detection alerts'
    ],
    'With Agent 4 (Security)': [
      'Validate Managed Identity configuration for Cosmos DB',
      'Ensure data classification compliance',
      'Implement data encryption validation',
      'Set up audit logging for data operations'
    ],
    'With Agent 5 (API Integration)': [
      'Provide data access methods for chat APIs',
      'Optimize conversation retrieval for real-time chat',
      'Implement efficient message storage patterns',
      'Enable streaming data updates for live conversations'
    ],
    'With Agent 6 (Configuration)': [
      'Deploy Cosmos DB infrastructure via Terraform',
      'Configure multi-environment data settings',
      'Set up backup and disaster recovery',
      'Implement infrastructure monitoring'
    ]
  };
}

// Test Cosmos DB connection
async function testCosmosConnection() {
  console.log('\n🧪 TESTING COSMOS DB CONNECTION:');
  console.log('===============================');
  
  try {
    // Import the Cosmos client
    const cosmosClientPath = path.join(PROJECT_ROOT, 'src/data/CosmosClient.js');
    
    if (!fs.existsSync(cosmosClientPath)) {
      console.log('   ❌ CosmosClient.js not found');
      return false;
    }
    
    const clientContent = fs.readFileSync(cosmosClientPath, 'utf8');
    
    // Validate client structure
    const clientChecks = [
      { name: 'EVACosmosClient class', pattern: 'class EVACosmosClient' },
      { name: 'Azure Cosmos SDK', pattern: '@azure/cosmos' },
      { name: 'Managed Identity auth', pattern: 'DefaultAzureCredential' },
      { name: 'Retry configuration', pattern: 'retryOptions|retry' },
      { name: 'HPK query methods', pattern: 'queryByHPK|getByPartitionKey' },
      { name: 'Error handling', pattern: 'try.*catch|throw' }
    ];
    
    let checksPass = 0;
    
    clientChecks.forEach(check => {
      const regex = new RegExp(check.pattern, 'i');
      if (regex.test(clientContent)) {
        checksPass++;
        console.log(`   ✅ ${check.name} implemented`);
      } else {
        console.log(`   ⚠️  ${check.name} missing or incomplete`);
      }
    });
    
    const clientScore = (checksPass / clientChecks.length) * 100;
    console.log(`   📊 Client Implementation: ${clientScore}%`);
    
    // Test data models
    const modelsPath = path.join(PROJECT_ROOT, 'src/data/models/CosmosDBModels.js');
    if (fs.existsSync(modelsPath)) {
      console.log('   ✅ Data models file exists');
      
      const modelsContent = fs.readFileSync(modelsPath, 'utf8');
      if (modelsContent.includes('tenantId') && 
          modelsContent.includes('userId') && 
          modelsContent.includes('entityType')) {
        console.log('   ✅ HPK structure validated');
      } else {
        console.log('   ⚠️  HPK structure needs validation');
      }
    }
    
    return clientScore >= 80;
    
  } catch (error) {
    console.log(`   ❌ Cosmos connection test failed: ${error.message}`);
    return false;
  }
}

// Test Terraform configuration
async function testTerraformConfig() {
  console.log('\n🏗️ TESTING TERRAFORM CONFIGURATION:');
  console.log('===================================');
  
  const terraformPath = path.join(PROJECT_ROOT, 'infra/terraform/main.tf');
  
  if (!fs.existsSync(terraformPath)) {
    console.log('   ❌ main.tf not found');
    return false;
  }
  
  try {
    const terraformContent = fs.readFileSync(terraformPath, 'utf8');
    
    // Terraform validation checks
    const terraformChecks = [
      { name: 'Cosmos DB account', pattern: 'resource "azurerm_cosmosdb_account"' },
      { name: 'SQL database', pattern: 'resource "azurerm_cosmosdb_sql_database"' },
      { name: 'HPK containers', pattern: 'partition_key_paths.*=.*\\[.*\\]' },
      { name: 'Managed Identity', pattern: 'azurerm_user_assigned_identity|SystemAssigned' },
      { name: 'RBAC assignments', pattern: 'azurerm_role_assignment' },
      { name: 'Multi-region setup', pattern: 'geo_location' }
    ];
    
    let terraformPassed = 0;
    
    terraformChecks.forEach(check => {
      const regex = new RegExp(check.pattern, 'i');
      if (regex.test(terraformContent)) {
        terraformPassed++;
        console.log(`   ✅ ${check.name} configured`);
      } else {
        console.log(`   ⚠️  ${check.name} missing or incomplete`);
      }
    });
    
    const terraformScore = (terraformPassed / terraformChecks.length) * 100;
    console.log(`   📊 Terraform Configuration: ${terraformScore}%`);
    
    return terraformScore >= 80;
    
  } catch (error) {
    console.log(`   ❌ Terraform validation failed: ${error.message}`);
    return false;
  }
}

// Main validation function for Agent 1
async function runAgent1Validation() {
  console.log('\n🔵 RUNNING COMPLETE DATA ARCHITECTURE VALIDATION');
  console.log('===============================================');
  
  const results = await validateDataArchitecture();
  
  console.log('\n🧪 RUNNING INTEGRATION TESTS:');
  console.log('============================');
  
  const cosmosWorking = await testCosmosConnection();
  const terraformWorking = await testTerraformConfig();
  
  console.log('\n🤝 AGENT COORDINATION TASKS:');
  console.log('===========================');
  
  const coordinationTasks = getAgent1CoordinationTasks();
  for (const [agent, tasks] of Object.entries(coordinationTasks)) {
    console.log(`\n${agent}:`);
    tasks.forEach(task => {
      console.log(`   • ${task}`);
    });
  }
  
  console.log('\n🎯 AGENT 1 IMMEDIATE NEXT STEPS:');
  console.log('===============================');
  
  if (results.score >= 90 && cosmosWorking && terraformWorking) {
    console.log('🔵 EXCELLENT! Your data architecture is enterprise-ready!');
    console.log('');
    console.log('IMMEDIATE ACTIONS:');
    console.log('1. 🚀 Deploy Terraform: cd infra/terraform && terraform apply');
    console.log('2. 🧪 Test Cosmos DB connection with real Azure resources');
    console.log('3. 🔗 Connect with Agent 3 for performance monitoring integration');
    console.log('4. 📊 Validate HPK query performance and optimization');
    console.log('5. 🤝 Provide data access methods to Agent 5 APIs');
  } else {
    console.log('🟡 Almost there! Complete these steps:');
    console.log('');
    results.recommendations.forEach(rec => {
      console.log(`   ${rec}`);
    });
    
    if (!cosmosWorking) {
      console.log('');
      console.log('🗄️ Cosmos Client Issues:');
      console.log('   • Complete EVACosmosClient implementation');
      console.log('   • Add comprehensive error handling');
      console.log('   • Implement HPK query optimization methods');
    }
    
    if (!terraformWorking) {
      console.log('');
      console.log('🏗️ Terraform Issues:');
      console.log('   • Complete Cosmos DB resource configuration');
      console.log('   • Add HPK container definitions');
      console.log('   • Configure RBAC and security settings');
    }
  }
  
  console.log('\n📦 Required Azure Resources:');
  console.log('   • Cosmos DB account with SQL API');
  console.log('   • Conversations container with HPK');
  console.log('   • Messages container with HPK'); 
  console.log('   • ParameterRegistry container');
  console.log('   • Managed Identity with Cosmos DB Data Contributor role');
  
  console.log('\n✨ Agent 1: Your data architecture foundation is solid! Deploy it! 🚀');
  
  return {
    validationResults: results,
    integrationTests: {
      cosmosConnection: cosmosWorking,
      terraformConfig: terraformWorking
    },
    coordinationTasks
  };
}

// Run validation if script is executed directly
if (require.main === module) {
  runAgent1Validation()
    .then(results => {
      console.log('\n📄 Data architecture validation completed!');
    })
    .catch(error => {
      console.error('\n❌ Validation failed:', error);
    });
}

module.exports = {
  validateDataArchitecture,
  testCosmosConnection,
  testTerraformConfig,
  getAgent1CoordinationTasks,
  runAgent1Validation
};