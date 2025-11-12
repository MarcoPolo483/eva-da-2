// src/lib/cosmosDbClient.ts
// Azure Cosmos DB client wrapper with best practices for EVA DA 2.0
// Uses Managed Identity for authentication (recommended for production)

import { CosmosClient, Container, Database, type FeedOptions, type IndexingPolicy } from '@azure/cosmos';
import { DefaultAzureCredential } from '@azure/identity';

// Auto-load dotenv for Node.js scripts
let env: Record<string, string | undefined> = {};
if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'browser') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('dotenv').config({ path: '.env.local' });
  } catch {}
  env = process.env;
} else if (typeof import.meta !== 'undefined' && import.meta.env) {
  env = import.meta.env;
}

/**
 * Cosmos DB container configuration
 */
export interface ContainerConfig {
  id: string;
  partitionKey: string;
  uniqueKeys?: string[];
  indexingPolicy?: IndexingPolicy;
}

/**
 * Cosmos DB connection configuration
 */
interface CosmosDbConfig {
  endpoint: string;
  databaseName: string;
  authMethod: 'managedIdentity' | 'connectionString';
  connectionString?: string;
  containers: {
    users: string;
    projects: string;
    translations: string;
    settings: string;
    quickQuestions: string;
    roles: string;
    files: string;
    conversations: string;
  };
  diagnostics?: boolean;
  requestTimeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  connectionMode?: 'Gateway' | 'Direct';
}

/**
 * Container definitions with partition keys
 */
const CONTAINER_CONFIGS: Record<string, ContainerConfig> = {
  users: {
    id: 'users',
    partitionKey: '/id',
    uniqueKeys: ['/email']
  },
  projects: {
    id: 'projects',
    partitionKey: '/id'
  },
  translations: {
    id: 'translations',
    partitionKey: '/category'
  },
  settings: {
    id: 'settings',
    partitionKey: '/type' // 'accessibility', 'theme', 'global'
  },
  quickQuestions: {
    id: 'quickQuestions',
    partitionKey: '/projectId'
  },
  roles: {
    id: 'roles',
    partitionKey: '/level' // 'platform', 'project', 'user'
  },
  files: {
    id: 'files',
    partitionKey: '/projectId'
  },
  conversations: {
    id: 'conversations',
    partitionKey: '/userId'
  }
};

/**
 * Cosmos DB Client Wrapper
 * Implements Azure best practices:
 * - Managed Identity authentication
 * - Retry logic with exponential backoff
 * - Connection pooling
 * - Diagnostic logging
 * - Proper error handling
 */
class CosmosDbClient {
  private client: CosmosClient | null = null;
  private database: Database | null = null;
  private containers: Map<string, Container> = new Map();
  private config: CosmosDbConfig;
  private isInitialized = false;

  constructor() {
    // Load configuration from environment variables (Node.js or Vite)
    this.config = {
      endpoint: env.VITE_COSMOS_DB_ENDPOINT || '',
      databaseName: env.VITE_COSMOS_DB_DATABASE_NAME || 'eva-da-2',
      authMethod: (env.VITE_COSMOS_DB_AUTH_METHOD as 'managedIdentity' | 'connectionString') || 'managedIdentity',
      connectionString: env.VITE_COSMOS_DB_CONNECTION_STRING,
      containers: {
        users: env.VITE_COSMOS_DB_CONTAINER_USERS || 'users',
        projects: env.VITE_COSMOS_DB_CONTAINER_PROJECTS || 'projects',
        translations: env.VITE_COSMOS_DB_CONTAINER_TRANSLATIONS || 'translations',
        settings: env.VITE_COSMOS_DB_CONTAINER_SETTINGS || 'settings',
        quickQuestions: env.VITE_COSMOS_DB_CONTAINER_QUICK_QUESTIONS || 'quickQuestions',
        roles: env.VITE_COSMOS_DB_CONTAINER_ROLES || 'roles',
        files: env.VITE_COSMOS_DB_CONTAINER_FILES || 'files',
        conversations: env.VITE_COSMOS_DB_CONTAINER_CONVERSATIONS || 'conversations'
      },
      diagnostics: env.VITE_COSMOS_DB_ENABLE_DIAGNOSTICS === 'true',
      requestTimeout: parseInt(env.VITE_COSMOS_DB_REQUEST_TIMEOUT || '30000'),
      maxRetries: parseInt(env.VITE_COSMOS_DB_MAX_RETRIES || '3'),
      retryDelay: parseInt(env.VITE_COSMOS_DB_RETRY_DELAY || '1000'),
      connectionMode: (env.VITE_COSMOS_DB_CONNECTION_MODE as 'Gateway' | 'Direct') || 'Gateway'
    };
  }

  /**
   * Initialize Cosmos DB client with Managed Identity (recommended) or connection string
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.log('Initializing Cosmos DB client...');

      // Validate configuration
      if (!this.config.endpoint) {
        throw new Error('VITE_COSMOS_DB_ENDPOINT is not configured');
      }

      // Create client based on authentication method
      if (this.config.authMethod === 'managedIdentity') {
        this.log('Using Managed Identity authentication (recommended)');
        
        // Use DefaultAzureCredential for Managed Identity
        // This works in Azure (Managed Identity) and locally (Azure CLI, VS Code, etc.)
        const credential = new DefaultAzureCredential();
          this.client = new CosmosClient({
          endpoint: this.config.endpoint,
          aadCredentials: credential,
          connectionPolicy: {
            requestTimeout: this.config.requestTimeout,
            enableEndpointDiscovery: true,
            preferredLocations: [], // Add preferred regions if needed
            retryOptions: {
              maxRetryAttemptCount: this.config.maxRetries,
              fixedRetryIntervalInMilliseconds: this.config.retryDelay,
              maxWaitTimeInSeconds: 30
            }
          }
        });
      } else {
        this.log('Using connection string authentication (development only)');
        
        if (!this.config.connectionString) {
          throw new Error('VITE_COSMOS_DB_CONNECTION_STRING is not configured');
        }        this.client = new CosmosClient({
          connectionString: this.config.connectionString,
          connectionPolicy: {
            requestTimeout: this.config.requestTimeout,
            enableEndpointDiscovery: true,
            retryOptions: {
              maxRetryAttemptCount: this.config.maxRetries,
              fixedRetryIntervalInMilliseconds: this.config.retryDelay,
              maxWaitTimeInSeconds: 30
            }
          }
        });
      }

      // Get database reference
      this.database = this.client.database(this.config.databaseName);

      // Test connection
      await this.database.read();
      this.log(`Connected to database: ${this.config.databaseName}`);

      // Initialize container references
      await this.initializeContainers();

      this.isInitialized = true;
      this.log('Cosmos DB client initialized successfully');
    } catch (error) {
      this.logError('Failed to initialize Cosmos DB client', error);
      throw new Error(`Cosmos DB initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Initialize container references
   */
  private async initializeContainers(): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    for (const [key, containerName] of Object.entries(this.config.containers)) {
      try {
        const container = this.database.container(containerName);
        
        // Verify container exists
        await container.read();
        
        this.containers.set(key, container);
        this.log(`Container initialized: ${containerName}`);
      } catch (error) {
        this.logError(`Failed to initialize container: ${containerName}`, error);
        throw error;
      }
    }
  }

  /**
   * Get a container by name
   */
  getContainer(containerName: keyof CosmosDbConfig['containers']): Container {
    if (!this.isInitialized) {
      throw new Error('Cosmos DB client not initialized. Call initialize() first.');
    }

    const container = this.containers.get(containerName);
    if (!container) {
      throw new Error(`Container not found: ${containerName}`);
    }

    return container;
  }
  /**
   * Create an item in a container with retry logic
   */
  async createItem<T extends Record<string, unknown>>(
    containerName: keyof CosmosDbConfig['containers'],
    item: T,
    partitionKeyValue?: string
  ): Promise<T> {
    return this.retryOperation(async () => {
      const container = this.getContainer(containerName);
      const { resource } = await container.items.create(item, {
        partitionKey: partitionKeyValue
      });
      this.log(`Created item in ${containerName}`);
      return resource as T;
    });
  }

  /**
   * Read an item from a container with retry logic
   */
  async readItem<T extends Record<string, unknown>>(
    containerName: keyof CosmosDbConfig['containers'],
    id: string,
    partitionKeyValue: string
  ): Promise<T | null> {
    return this.retryOperation(async () => {
      try {
        const container = this.getContainer(containerName);
        const { resource } = await container.item(id, partitionKeyValue).read();
        this.log(`Read item from ${containerName}: ${id}`);
        return (resource as T) || null;
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 404) {
          return null;
        }
        throw error;
      }
    });
  }

  /**
   * Update an item in a container with retry logic
   */
  async updateItem<T extends Record<string, unknown>>(
    containerName: keyof CosmosDbConfig['containers'],
    id: string,
    item: T,
    partitionKeyValue: string
  ): Promise<T> {
    return this.retryOperation(async () => {
      const container = this.getContainer(containerName);
      const { resource } = await container.item(id, partitionKeyValue).replace(item as any);
      this.log(`Updated item in ${containerName}: ${id}`);
      return resource as T;
    });
  }

  /**
   * Delete an item from a container with retry logic
   */
  async deleteItem(
    containerName: keyof CosmosDbConfig['containers'],
    id: string,
    partitionKeyValue: string
  ): Promise<void> {
    return this.retryOperation(async () => {
      const container = this.getContainer(containerName);
      await container.item(id, partitionKeyValue).delete();
      this.log(`Deleted item from ${containerName}: ${id}`);
    });
  }
  /**
   * Query items with retry logic
   */
  async queryItems<T extends Record<string, unknown>>(
    containerName: keyof CosmosDbConfig['containers'],
    query: string,
    parameters?: Array<{ name: string; value: unknown }>,
    options?: FeedOptions
  ): Promise<T[]> {
    return this.retryOperation(async () => {
      const container = this.getContainer(containerName);
      const { resources } = await container.items
        .query<T>({
          query,
          parameters
        }, options)
        .fetchAll();
      
      this.log(`Queried ${resources.length} items from ${containerName}`);
      return resources;
    });
  }

  /**
   * Batch create items with retry logic
   */
  async batchCreateItems<T extends Record<string, unknown>>(
    containerName: keyof CosmosDbConfig['containers'],
    items: T[]
  ): Promise<T[]> {
    const results: T[] = [];
    
    // Process in batches of 100 (Cosmos DB limitation)
    const batchSize = 100;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(item => this.createItem(containerName, item))
      );
      
      results.push(...batchResults);
      this.log(`Batch created ${batchResults.length} items in ${containerName}`);
    }

    return results;
  }

  /**
   * Retry operation with exponential backoff
   */
  private async retryOperation<T>(
    operation: () => Promise<T>,
    attempt: number = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error: unknown) {
      const isRetryable = this.isRetryableError(error);
      const maxRetries = this.config.maxRetries || 3;

      if (isRetryable && attempt < maxRetries) {
        const delay = this.config.retryDelay! * Math.pow(2, attempt); // Exponential backoff
        this.log(`Retrying operation (attempt ${attempt + 1}/${maxRetries}) after ${delay}ms`);
        
        await this.sleep(delay);
        return this.retryOperation(operation, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    // Retry on transient errors
    const retryableStatusCodes = [408, 429, 500, 503];
    if (error && typeof error === 'object' && 'code' in error) {
      return retryableStatusCodes.includes(error.code as number);
    }
    return false;
  }

  /**
   * Sleep utility for retry logic
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Logging utility
   */
  private log(message: string): void {
    if (this.config.diagnostics) {
      console.log(`[CosmosDB] ${message}`);
    }
  }

  /**
   * Error logging utility
   */
  private logError(message: string, error: unknown): void {
    console.error(`[CosmosDB ERROR] ${message}`, error);
  }

  /**
   * Check if client is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get configuration (for debugging)
   */
  getConfig(): Partial<CosmosDbConfig> {
    return {
      endpoint: this.config.endpoint,
      databaseName: this.config.databaseName,
      authMethod: this.config.authMethod,
      containers: this.config.containers
    };
  }
}

// Export singleton instance
export const cosmosDbClient = new CosmosDbClient();

// Export container configurations for seeding scripts
export { CONTAINER_CONFIGS };
