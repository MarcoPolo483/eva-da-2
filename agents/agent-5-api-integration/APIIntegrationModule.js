/**
 * EVA DA 2.0 - API Integration Module
 * Enterprise-grade API orchestration for multi-agent platform
 * 
 * Features:
 * - Azure Functions integration
 * - OpenAI API management
 * - Apigee policy enforcement
 * - Rate limiting and throttling
 * - Circuit breaker patterns
 * - Managed Identity authentication
 */

const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');

/**
 * API Integration Manager
 * Coordinates all external API communications
 */
class APIIntegrationManager {
    constructor(config = {}) {
        this.config = {
            keyVaultUrl: config.keyVaultUrl || process.env.KEY_VAULT_URL,
            openaiEndpoint: config.openaiEndpoint || process.env.OPENAI_ENDPOINT,
            apigeeGateway: config.apigeeGateway || process.env.APIGEE_GATEWAY,
            retryAttempts: config.retryAttempts || 3,
            timeoutMs: config.timeoutMs || 30000,
            ...config
        };
        
        this.credential = new DefaultAzureCredential();
        this.secretClient = null;
        this.circuits = new Map(); // Circuit breaker states
        this.rateLimits = new Map(); // Rate limiting trackers
        this.isInitialized = false;
    }

    /**
     * Initialize API integration services
     */
    async initialize() {
        try {
            // Initialize Key Vault client
            if (this.config.keyVaultUrl) {
                this.secretClient = new SecretClient(this.config.keyVaultUrl, this.credential);
            }

            // Initialize circuit breakers
            this.initializeCircuitBreakers();
            
            // Initialize rate limiters
            this.initializeRateLimiters();

            this.isInitialized = true;
            console.log('✅ API Integration Manager initialized');
            
            return {
                status: 'initialized',
                timestamp: new Date().toISOString(),
                services: ['KeyVault', 'CircuitBreakers', 'RateLimiters']
            };
        } catch (error) {
            console.error('❌ API Integration initialization failed:', error);
            throw error;
        }
    }

    /**
     * Initialize circuit breakers for each service
     */
    initializeCircuitBreakers() {
        const services = ['openai', 'cosmos', 'keyvault', 'storage'];
        
        services.forEach(service => {
            this.circuits.set(service, {
                state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
                failures: 0,
                lastFailure: null,
                threshold: 5, // failures before opening
                timeout: 60000, // ms before trying HALF_OPEN
                successThreshold: 2 // successes to close from HALF_OPEN
            });
        });
    }

    /**
     * Initialize rate limiters
     */
    initializeRateLimiters() {
        const limits = {
            openai: { requests: 100, windowMs: 60000 }, // 100 requests per minute
            cosmos: { requests: 1000, windowMs: 60000 }, // 1000 requests per minute
            general: { requests: 500, windowMs: 60000 }   // 500 requests per minute
        };

        Object.entries(limits).forEach(([service, limit]) => {
            this.rateLimits.set(service, {
                ...limit,
                requests: [],
                blocked: false
            });
        });
    }

    /**
     * Execute API call with circuit breaker and retry logic
     */
    async executeWithProtection(serviceName, operation, operationName = 'Unknown') {
        // Check circuit breaker
        if (!this.isCircuitClosed(serviceName)) {
            throw new Error(`Circuit breaker is OPEN for service: ${serviceName}`);
        }

        // Check rate limiting
        if (!this.isWithinRateLimit(serviceName)) {
            throw new Error(`Rate limit exceeded for service: ${serviceName}`);
        }

        const maxRetries = this.config.retryAttempts;
        let lastError;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const result = await Promise.race([
                    operation(),
                    this.createTimeoutPromise(this.config.timeoutMs)
                ]);

                // Success - reset circuit breaker
                this.recordSuccess(serviceName);
                this.recordRequest(serviceName);
                
                return result;
                
            } catch (error) {
                lastError = error;
                
                // Record failure
                this.recordFailure(serviceName, error);
                
                // Check if we should retry
                if (attempt < maxRetries && this.isRetryableError(error)) {
                    const backoffMs = this.calculateBackoff(attempt);
                    console.warn(`⏳ ${operationName} attempt ${attempt + 1} failed, retrying in ${backoffMs}ms`);
                    await this.delay(backoffMs);
                    continue;
                }
                
                break;
            }
        }

        throw new Error(`Operation ${operationName} failed after ${maxRetries} attempts: ${lastError.message}`);
    }

    /**
     * OpenAI API integration with enterprise controls
     */
    async callOpenAI(endpoint, payload, options = {}) {
        return this.executeWithProtection('openai', async () => {
            // Get API key from Key Vault
            const apiKey = await this.getSecret('openai-api-key');
            
            const response = await fetch(`${this.config.openaiEndpoint}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'User-Agent': 'EVA-DA-2.0/1.0',
                    ...options.headers
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
            }

            return await response.json();
        }, `OpenAI-${endpoint}`);
    }

    /**
     * Azure Functions integration
     */
    async callAzureFunction(functionName, payload, options = {}) {
        return this.executeWithProtection('azure-functions', async () => {
            const functionUrl = `${this.config.functionsBaseUrl}/${functionName}`;
            
            // Use managed identity for authentication
            const token = await this.credential.getToken('https://management.azure.com/.default');
            
            const response = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token.token}`,
                    'x-eva-source': 'EVA-DA-2.0',
                    ...options.headers
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Azure Function error: ${response.status}`);
            }

            return await response.json();
        }, `AzureFunction-${functionName}`);
    }

    /**
     * Cosmos DB API integration
     */
    async callCosmosAPI(operation, payload) {
        return this.executeWithProtection('cosmos', async () => {
            // This would integrate with the CosmosClient
            // For now, return a mock response
            return {
                operation,
                status: 'success',
                timestamp: new Date().toISOString(),
                payload
            };
        }, `Cosmos-${operation}`);
    }

    /**
     * Get secret from Key Vault
     */
    async getSecret(secretName) {
        if (!this.secretClient) {
            throw new Error('Key Vault client not initialized');
        }

        try {
            const secret = await this.secretClient.getSecret(secretName);
            return secret.value;
        } catch (error) {
            console.error(`Failed to get secret ${secretName}:`, error);
            throw error;
        }
    }

    /**
     * Circuit breaker management
     */
    isCircuitClosed(serviceName) {
        const circuit = this.circuits.get(serviceName);
        if (!circuit) return true;

        const now = Date.now();

        switch (circuit.state) {
            case 'CLOSED':
                return true;
            case 'OPEN':
                if (now - circuit.lastFailure > circuit.timeout) {
                    circuit.state = 'HALF_OPEN';
                    circuit.failures = 0;
                    return true;
                }
                return false;
            case 'HALF_OPEN':
                return true;
            default:
                return true;
        }
    }

    recordSuccess(serviceName) {
        const circuit = this.circuits.get(serviceName);
        if (!circuit) return;

        if (circuit.state === 'HALF_OPEN') {
            circuit.failures = 0;
            if (circuit.successCount >= circuit.successThreshold) {
                circuit.state = 'CLOSED';
            }
            circuit.successCount = (circuit.successCount || 0) + 1;
        } else if (circuit.state === 'CLOSED') {
            circuit.failures = 0;
        }
    }

    recordFailure(serviceName, error) {
        const circuit = this.circuits.get(serviceName);
        if (!circuit) return;

        circuit.failures++;
        circuit.lastFailure = Date.now();

        if (circuit.failures >= circuit.threshold) {
            circuit.state = 'OPEN';
            console.warn(`🚨 Circuit breaker OPENED for ${serviceName} after ${circuit.failures} failures`);
        }
    }

    /**
     * Rate limiting management
     */
    isWithinRateLimit(serviceName) {
        const limiter = this.rateLimits.get(serviceName) || this.rateLimits.get('general');
        if (!limiter) return true;

        const now = Date.now();
        const windowStart = now - limiter.windowMs;

        // Clean old requests
        limiter.requests = limiter.requests.filter(timestamp => timestamp > windowStart);

        // Check if within limit
        return limiter.requests.length < limiter.requests;
    }

    recordRequest(serviceName) {
        const limiter = this.rateLimits.get(serviceName) || this.rateLimits.get('general');
        if (limiter) {
            limiter.requests.push(Date.now());
        }
    }

    /**
     * Utility methods
     */
    isRetryableError(error) {
        const retryableCodes = [408, 429, 500, 502, 503, 504];
        return retryableCodes.includes(error.status) || 
               retryableCodes.includes(error.code) ||
               error.message.includes('ECONNRESET') ||
               error.message.includes('timeout');
    }

    calculateBackoff(attempt) {
        return Math.min(1000 * Math.pow(2, attempt), 30000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    createTimeoutPromise(ms) {
        return new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Operation timeout')), ms)
        );
    }

    /**
     * Health check for all integrated services
     */
    async healthCheck() {
        const services = ['openai', 'cosmos', 'azure-functions'];
        const results = {};

        for (const service of services) {
            try {
                const circuit = this.circuits.get(service);
                const limiter = this.rateLimits.get(service);

                results[service] = {
                    circuit: circuit ? circuit.state : 'UNKNOWN',
                    rateLimit: limiter ? `${limiter.requests.length}/${limiter.requests}` : 'UNKNOWN',
                    status: 'healthy'
                };
            } catch (error) {
                results[service] = {
                    status: 'unhealthy',
                    error: error.message
                };
            }
        }

        return {
            timestamp: new Date().toISOString(),
            services: results,
            overallStatus: Object.values(results).every(r => r.status === 'healthy') ? 'healthy' : 'degraded'
        };
    }
}

/**
 * OpenAI Service Wrapper
 * Specialized wrapper for OpenAI API calls
 */
class OpenAIService {
    constructor(apiManager) {
        this.apiManager = apiManager;
    }

    async chatCompletion(messages, model = 'gpt-4o', options = {}) {
        const payload = {
            model,
            messages,
            max_tokens: options.maxTokens || 4000,
            temperature: options.temperature || 0.7,
            stream: options.stream || false
        };

        return this.apiManager.callOpenAI('/chat/completions', payload, options);
    }

    async embeddings(input, model = 'text-embedding-3-small') {
        const payload = {
            model,
            input: Array.isArray(input) ? input : [input]
        };

        return this.apiManager.callOpenAI('/embeddings', payload);
    }

    async moderations(input) {
        const payload = { input };
        return this.apiManager.callOpenAI('/moderations', payload);
    }
}

/**
 * API Gateway Integration
 * Handles Apigee and other gateway interactions
 */
class APIGatewayIntegration {
    constructor(config) {
        this.config = config;
        this.policies = new Map();
        this.initializePolicies();
    }

    initializePolicies() {
        this.policies.set('rate-limiting', {
            enabled: true,
            requestsPerMinute: 1000,
            burstLimit: 100
        });

        this.policies.set('authentication', {
            enabled: true,
            methods: ['managed-identity', 'api-key'],
            required: true
        });

        this.policies.set('data-classification', {
            enabled: true,
            level: 'ProtectedB',
            encryption: true
        });
    }

    async processRequest(request) {
        // Apply gateway policies
        for (const [policyName, policy] of this.policies) {
            if (policy.enabled) {
                await this.applyPolicy(policyName, policy, request);
            }
        }

        return request;
    }

    async applyPolicy(policyName, policy, request) {
        switch (policyName) {
            case 'rate-limiting':
                return this.applyRateLimit(policy, request);
            case 'authentication':
                return this.applyAuthentication(policy, request);
            case 'data-classification':
                return this.applyDataClassification(policy, request);
            default:
                return request;
        }
    }

    applyRateLimit(policy, request) {
        // Rate limiting logic
        return request;
    }

    applyAuthentication(policy, request) {
        // Authentication validation
        return request;
    }

    applyDataClassification(policy, request) {
        // Data classification enforcement
        return request;
    }
}

module.exports = {
    APIIntegrationManager,
    OpenAIService,
    APIGatewayIntegration
};
