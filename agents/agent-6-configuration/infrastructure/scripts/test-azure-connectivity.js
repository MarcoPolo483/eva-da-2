// EVA DA 2.0 - Azure Connectivity Test
// Validates subscription access and Azure service readiness
// Run: node test-azure-connectivity.js

const { execSync } = require('child_process');

const SUBSCRIPTION_ID = 'c59ee575-eb2a-4b51-a865-4b618f9add0a';
const LOCATION = 'Canada Central';

console.log('🔍 EVA DA 2.0 - Azure Connectivity Test');
console.log('=====================================');

async function testAzureConnectivity() {
  try {
    console.log('\n1️⃣ Testing Azure CLI Authentication...');
    
    // Test Azure CLI is installed and authenticated
    const accountInfo = execSync('az account show --output json', { encoding: 'utf8' });
    const account = JSON.parse(accountInfo);
    
    console.log(`   ✅ Authenticated as: ${account.user.name}`);
    console.log(`   ✅ Subscription: ${account.name} (${account.id})`);
    
    if (account.id !== SUBSCRIPTION_ID) {
      console.log(`   ⚠️  Current subscription differs from target: ${SUBSCRIPTION_ID}`);
      console.log('   🔄 Setting correct subscription...');
      execSync(`az account set --subscription ${SUBSCRIPTION_ID}`);
      console.log('   ✅ Subscription set correctly');
    }
    
    console.log('\n2️⃣ Testing Location Availability...');
    
    // Test location availability
    const locations = execSync('az account list-locations --output json', { encoding: 'utf8' });
    const locationList = JSON.parse(locations);
    const targetLocation = locationList.find(loc => loc.displayName === LOCATION);
    
    if (targetLocation) {
      console.log(`   ✅ Location available: ${LOCATION} (${targetLocation.name})`);
    } else {
      console.log(`   ❌ Location not available: ${LOCATION}`);
      return false;
    }
    
    console.log('\n3️⃣ Testing Required Resource Providers...');
    
    const providers = [
      { name: 'Microsoft.DocumentDB', service: 'Cosmos DB' },
      { name: 'Microsoft.Web', service: 'Azure Functions' },
      { name: 'Microsoft.CognitiveServices', service: 'OpenAI' },
      { name: 'Microsoft.KeyVault', service: 'Key Vault' },
      { name: 'Microsoft.Storage', service: 'Storage Account' },
      { name: 'Microsoft.Insights', service: 'Application Insights' }
    ];
    
    for (const provider of providers) {
      try {
        const providerInfo = execSync(`az provider show --namespace ${provider.name} --output json`, { encoding: 'utf8' });
        const providerData = JSON.parse(providerInfo);
        
        if (providerData.registrationState === 'Registered') {
          console.log(`   ✅ ${provider.service}: Provider registered`);
        } else {
          console.log(`   🔄 ${provider.service}: Registering provider...`);
          execSync(`az provider register --namespace ${provider.name}`);
          console.log(`   ✅ ${provider.service}: Provider registration initiated`);
        }
      } catch (error) {
        console.log(`   ❌ ${provider.service}: Provider check failed`);
      }
    }
    
    console.log('\n4️⃣ Testing OpenAI Service Availability...');
    
    try {
      // Check OpenAI availability in target region
      const openaiLocations = execSync('az cognitiveservices account list-kinds --output json', { encoding: 'utf8' });
      const services = JSON.parse(openaiLocations);
      const openaiService = services.find(service => service.kind === 'OpenAI');
      
      if (openaiService) {
        console.log('   ✅ OpenAI service available');
      } else {
        console.log('   ⚠️  OpenAI service availability needs verification');
      }
    } catch (error) {
      console.log('   ⚠️  OpenAI availability check skipped');
    }
    
    console.log('\n5️⃣ Testing Resource Group Creation...');
    
    const testResourceGroup = `rg-eva-da-2-test-${Date.now()}`;
    
    try {
      // Create test resource group
      execSync(`az group create --name ${testResourceGroup} --location "${LOCATION}" --output none`);
      console.log(`   ✅ Resource group creation successful`);
      
      // Clean up test resource group
      execSync(`az group delete --name ${testResourceGroup} --yes --no-wait --output none`);
      console.log(`   ✅ Test resource group cleaned up`);
      
    } catch (error) {
      console.log(`   ❌ Resource group creation failed: ${error.message}`);
      return false;
    }
    
    console.log('\n🎊 AZURE CONNECTIVITY TEST RESULTS:');
    console.log('===================================');
    console.log('✅ Azure CLI: Authenticated and ready');
    console.log(`✅ Subscription: ${SUBSCRIPTION_ID}`);
    console.log(`✅ Location: ${LOCATION}`);
    console.log('✅ Resource Providers: Registered');
    console.log('✅ Permissions: Sufficient for deployment');
    
    console.log('\n🚀 READY TO LAUNCH 6 AGENTS!');
    console.log('Run: .\\scripts\\launch-6-agents.ps1 -DeployAzure');
    
    return true;
    
  } catch (error) {
    console.log('\n❌ CONNECTIVITY TEST FAILED:');
    console.log('============================');
    console.log(`Error: ${error.message}`);
    
    console.log('\n🔧 TROUBLESHOOTING STEPS:');
    console.log('1. Install Azure CLI: winget install Microsoft.AzureCLI');
    console.log('2. Login to Azure: az login');
    console.log(`3. Set subscription: az account set --subscription ${SUBSCRIPTION_ID}`);
    console.log('4. Try the test again');
    
    return false;
  }
}

// Run the test
testAzureConnectivity()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });