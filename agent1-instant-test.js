const { DefaultAzureCredential } = require('@azure/identity');
const { CosmosClient } = require('@azure/cosmos');

async function instantTest() {
  try {
    const client = new CosmosClient({
      endpoint: 'https://eva-da-2-cosmos-dev.documents.azure.com:443/',
      aadCredentials: new DefaultAzureCredential()
    });
    
    const database = client.database('eva-conversations');
    const container = database.container('conversations');
    
    // Test write
    const testDoc = {
      id: 'test-' + Date.now(),
      tenantId: 'eva-test',
      userId: 'agent1-test', 
      entityType: 'test-conversation',
      title: 'Agent 1 Deployment Test',
      message: 'SUCCESS! Agent 1 is LIVE!',
      timestamp: new Date().toISOString()
    };
    
    const { resource, requestCharge } = await container.items.create(testDoc);
    
    console.log('🎉 AGENT 1 DEPLOYMENT SUCCESSFUL!');
    console.log('✅ Document created:', resource.id);
    console.log('💰 Request charge:', requestCharge, 'RU');
    console.log('🚀 Cosmos DB is LIVE and ready!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('💡 Wait 2-3 minutes for Azure propagation, then try again');
  }
}

instantTest();
