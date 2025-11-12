// scripts/initializeContainers.ts
// Container initialization script for Azure Cosmos DB
// Creates database and containers with proper partition keys and indexing policies

import { CosmosClient, Database } from '@azure/cosmos';
import { DefaultAzureCredential } from '@azure/identity';
import { CONTAINER_CONFIGS } from '../src/lib/cosmosDbClient';

/**
 * Container initialization configuration
 */
interface InitConfig {
  endpoint: string;
  databaseName: string;
  authMethod: 'managedIdentity' | 'connectionString';
  connectionString?: string;
  throughput: number; // RU/s for database or container
  sharedThroughput: boolean; // Use database-level throughput
}

/**
 * Load configuration from environment variables
 */
function loadConfig(): InitConfig {
  const endpoint = process.env.VITE_COSMOS_DB_ENDPOINT || '';
  const databaseName = process.env.VITE_COSMOS_DB_DATABASE_NAME || 'eva-da-2';
  const authMethod = (process.env.VITE_COSMOS_DB_AUTH_METHOD as 'managedIdentity' | 'connectionString') || 'managedIdentity';
  const connectionString = process.env.VITE_COSMOS_DB_CONNECTION_STRING;
  const throughput = parseInt(process.env.COSMOS_DB_THROUGHPUT || '400');
  const sharedThroughput = process.env.COSMOS_DB_SHARED_THROUGHPUT !== 'false';

  if (!endpoint) {
    throw new Error('VITE_COSMOS_DB_ENDPOINT is not configured');
  }

  if (authMethod === 'connectionString' && !connectionString) {
    throw new Error('VITE_COSMOS_DB_CONNECTION_STRING is required when using connectionString auth');
  }

  return {
    endpoint,
    databaseName,
    authMethod,
    connectionString,
    throughput,
    sharedThroughput
  };
}

/**
 * Create Cosmos DB client
 */
function createClient(config: InitConfig): CosmosClient {
  if (config.authMethod === 'managedIdentity') {
    console.log('Using Managed Identity authentication...');
    const credential = new DefaultAzureCredential();
    return new CosmosClient({
      endpoint: config.endpoint,
      aadCredentials: credential
    });
  } else {
    console.log('Using connection string authentication...');
    return new CosmosClient({
      connectionString: config.connectionString!
    });
  }
}

/**
 * Create database if it doesn't exist
 */
async function createDatabase(client: CosmosClient, config: InitConfig): Promise<Database> {
  console.log(`\nCreating database: ${config.databaseName}`);
  
  const options = config.sharedThroughput 
    ? { throughput: config.throughput }
    : undefined;

  const { database } = await client.databases.createIfNotExists({
    id: config.databaseName,
    ...options
  });

  console.log(`✓ Database ready: ${config.databaseName}`);
  if (config.sharedThroughput) {
    console.log(`  Shared throughput: ${config.throughput} RU/s`);
  }

  return database;
}

/**
 * Create container with partition key and indexing policy
 */
async function createContainer(
  database: Database, 
  containerConfig: { id: string; partitionKey: string; uniqueKeys?: string[] },
  throughput?: number
): Promise<void> {  console.log(`\nCreating container: ${containerConfig.id}`);
  console.log(`  Partition key: ${containerConfig.partitionKey}`);

  const containerDef = {
    id: containerConfig.id,
    partitionKey: {
      paths: [containerConfig.partitionKey],
      kind: 'Hash' as const
    }
  } as any;

  // Add unique key constraints if specified
  if (containerConfig.uniqueKeys && containerConfig.uniqueKeys.length > 0) {
    containerDef.uniqueKeyPolicy = {
      uniqueKeys: containerConfig.uniqueKeys.map(key => ({
        paths: [key]
      }))
    };
    console.log(`  Unique keys: ${containerConfig.uniqueKeys.join(', ')}`);
  }

  // Add indexing policy for better query performance
  containerDef.indexingPolicy = {
    automatic: true,
    indexingMode: 'consistent',
    includedPaths: [
      {
        path: '/*'
      }
    ],
    excludedPaths: [
      {
        path: '/"_etag"/?'
      }
    ]
  };

  const options = throughput ? { throughput } : undefined;

  await database.containers.createIfNotExists(containerDef, options);
  
  console.log(`✓ Container ready: ${containerConfig.id}`);
  if (throughput) {
    console.log(`  Dedicated throughput: ${throughput} RU/s`);
  }
}

/**
 * Initialize all containers
 */
async function initializeContainers() {
  console.log('==========================================');
  console.log('EVA DA 2.0 - Container Initialization');
  console.log('==========================================\n');

  try {
    // Load configuration
    const config = loadConfig();
    console.log('Configuration:');
    console.log(`  Endpoint: ${config.endpoint}`);
    console.log(`  Database: ${config.databaseName}`);
    console.log(`  Auth Method: ${config.authMethod}`);
    console.log(`  Shared Throughput: ${config.sharedThroughput}`);
    if (config.sharedThroughput) {
      console.log(`  Throughput: ${config.throughput} RU/s`);
    }

    // Create client
    const client = createClient(config);

    // Create database
    const database = await createDatabase(client, config);    // Create containers
    console.log('\nCreating containers...');
    
    for (const containerConfig of Object.values(CONTAINER_CONFIGS)) {
      await createContainer(
        database, 
        containerConfig,
        config.sharedThroughput ? undefined : config.throughput
      );
    }

    // Summary
    console.log('\n==========================================');
    console.log('✓ INITIALIZATION COMPLETED SUCCESSFULLY');
    console.log('==========================================\n');
    console.log('Summary:');
    console.log(`  Database: ${config.databaseName}`);
    console.log(`  Containers created: ${Object.keys(CONTAINER_CONFIGS).length}`);
    console.log('\nContainers:');
    Object.entries(CONTAINER_CONFIGS).forEach(([name, cfg]) => {
      console.log(`  - ${cfg.id} (partition: ${cfg.partitionKey})`);
    });
    console.log('\nNext steps:');
    console.log('  1. Verify containers in Azure Portal');
    console.log('  2. Run seed script: npm run seed:cosmos');
    console.log('  3. Test application connectivity\n');

  } catch (error) {
    console.error('\n❌ Initialization failed:', error);
    console.error('\nError details:', error instanceof Error ? error.message : 'Unknown error');
    
    if (error instanceof Error && error.message.includes('ENOTFOUND')) {
      console.error('\nTroubleshooting:');
      console.error('  - Check VITE_COSMOS_DB_ENDPOINT is correct');
      console.error('  - Verify network connectivity to Azure');
      console.error('  - Ensure Cosmos DB account exists');
    }
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      console.error('\nTroubleshooting:');
      console.error('  - Run "az login" if using Managed Identity locally');
      console.error('  - Verify RBAC permissions on Cosmos DB account');
      console.error('  - Check connection string if using that method');
    }

    process.exit(1);
  }
}

// Run the initialization script
initializeContainers();
