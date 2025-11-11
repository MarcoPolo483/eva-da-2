/**
 * EVA DA 2.0 - Managed Identity Client
 * Secure authentication using Azure Managed Identity
 */

const { DefaultAzureCredential, ManagedIdentityCredential } = require('@azure/identity');

class ManagedIdentityClient {
    constructor(options = {}) {
        this.options = options;
        this.credential = null;
        this.isInitialized = false;
    }

    /**
     * Initialize managed identity credential
     */
    initialize() {
        try {
            if (this.options.clientId) {
                // User-assigned managed identity
                this.credential = new ManagedIdentityCredential(this.options.clientId);
            } else {
                // System-assigned managed identity or DefaultAzureCredential chain
                this.credential = new DefaultAzureCredential();
            }
            
            this.isInitialized = true;
            console.log('✅ Managed Identity initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize Managed Identity:', error);
            throw error;
        }
    }

    /**
     * Get access token for specified scope
     */
    async getAccessToken(scope = 'https://management.azure.com/.default') {
        if (!this.isInitialized) {
            throw new Error('Managed Identity not initialized');
        }

        try {
            const tokenResponse = await this.credential.getToken(scope);
            return tokenResponse.token;
        } catch (error) {
            console.error('❌ Failed to get access token:', error);
            throw error;
        }
    }

    /**
     * Get credential for SDK usage
     */
    getCredential() {
        if (!this.isInitialized) {
            throw new Error('Managed Identity not initialized');
        }
        return this.credential;
    }

    /**
     * Validate managed identity access
     */
    async validateAccess() {
        try {
            const token = await this.getAccessToken();
            return {
                isValid: !!token,
                hasToken: !!token,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                isValid: false,
                hasToken: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

module.exports = ManagedIdentityClient;
