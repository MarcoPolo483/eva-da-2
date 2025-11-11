/**
 * EVA DA 2.0 - Azure Cosmos DB Data Models
 * Enterprise-grade data models with Hierarchical Partition Keys (HPK)
 * 
 * Implements Protected B data classification for Canadian Government
 * Multi-tenant isolation with tenantId/userId/entityType HPK structure
 */

/**
 * Base Model with HPK Support
 * All models inherit from this to ensure proper partitioning
 */
class BaseCosmosModel {
    constructor(tenantId, userId, entityType, entityId) {
        // Hierarchical Partition Key (HPK) - overcomes 20GB partition limit
        this.tenantId = tenantId;           // Level 1: Tenant isolation
        this.userId = userId;               // Level 2: User isolation  
        this.entityType = entityType;       // Level 3: Entity type grouping
        
        // Unique identifiers
        this.id = entityId || this.generateId();
        this.pk = `${tenantId}/${userId}/${entityType}`; // Composite partition key
        
        // Audit fields for compliance
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
        this.version = 1;
        this.dataClassification = 'ProtectedB'; // Canadian Government classification
        
        // Soft delete support
        this.isDeleted = false;
        this.deletedAt = null;
    }

    generateId() {
        return `${this.entityType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    updateVersion() {
        this.version++;
        this.updatedAt = new Date().toISOString();
    }

    softDelete() {
        this.isDeleted = true;
        this.deletedAt = new Date().toISOString();
        this.updateVersion();
    }

    toJSON() {
        return {
            id: this.id,
            pk: this.pk,
            tenantId: this.tenantId,
            userId: this.userId,
            entityType: this.entityType,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            version: this.version,
            dataClassification: this.dataClassification,
            isDeleted: this.isDeleted,
            deletedAt: this.deletedAt,
            ...this.getEntityData()
        };
    }

    getEntityData() {
        // Override in child classes
        return {};
    }
}

/**
 * User Profile Model
 * Stores user information and preferences
 */
class UserProfile extends BaseCosmosModel {
    constructor(tenantId, userId, profileData = {}) {
        super(tenantId, userId, 'user-profile', `profile-${userId}`);
        
        this.displayName = profileData.displayName || '';
        this.email = profileData.email || '';
        this.department = profileData.department || '';
        this.role = profileData.role || 'user';
        this.language = profileData.language || 'en';
        this.timezone = profileData.timezone || 'UTC';
        this.preferences = profileData.preferences || {};
        this.lastLoginAt = profileData.lastLoginAt || null;
        this.isActive = profileData.isActive !== false;
    }

    getEntityData() {
        return {
            displayName: this.displayName,
            email: this.email,
            department: this.department,
            role: this.role,
            language: this.language,
            timezone: this.timezone,
            preferences: this.preferences,
            lastLoginAt: this.lastLoginAt,
            isActive: this.isActive
        };
    }
}

/**
 * Chat Conversation Model
 * Stores chat sessions with AI assistants
 */
class ChatConversation extends BaseCosmosModel {
    constructor(tenantId, userId, conversationData = {}) {
        super(tenantId, userId, 'chat-conversation');
        
        this.title = conversationData.title || 'New Conversation';
        this.model = conversationData.model || 'gpt-4o';
        this.messages = conversationData.messages || [];
        this.metadata = conversationData.metadata || {};
        this.tags = conversationData.tags || [];
        this.isArchived = conversationData.isArchived || false;
        this.totalTokens = conversationData.totalTokens || 0;
        this.estimatedCost = conversationData.estimatedCost || 0;
    }

    addMessage(message) {
        message.timestamp = new Date().toISOString();
        message.messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        this.messages.push(message);
        this.updateVersion();
    }

    getEntityData() {
        return {
            title: this.title,
            model: this.model,
            messages: this.messages,
            metadata: this.metadata,
            tags: this.tags,
            isArchived: this.isArchived,
            totalTokens: this.totalTokens,
            estimatedCost: this.estimatedCost
        };
    }
}

/**
 * Parameter Configuration Model
 * Stores system parameters and configurations
 */
class ParameterConfig extends BaseCosmosModel {
    constructor(tenantId, userId, parameterData = {}) {
        super(tenantId, userId, 'parameter-config');
        
        this.parameterId = parameterData.parameterId || '';
        this.name = parameterData.name || '';
        this.value = parameterData.value || '';
        this.type = parameterData.type || 'string';
        this.description = parameterData.description || '';
        this.category = parameterData.category || 'general';
        this.scope = parameterData.scope || 'user'; // user, tenant, system
        this.isEncrypted = parameterData.isEncrypted || false;
        this.validationRules = parameterData.validationRules || {};
    }

    getEntityData() {
        return {
            parameterId: this.parameterId,
            name: this.name,
            value: this.value,
            type: this.type,
            description: this.description,
            category: this.category,
            scope: this.scope,
            isEncrypted: this.isEncrypted,
            validationRules: this.validationRules
        };
    }
}

/**
 * Audit Log Model
 * Tracks all system actions for compliance
 */
class AuditLog extends BaseCosmosModel {
    constructor(tenantId, userId, auditData = {}) {
        super(tenantId, userId, 'audit-log');
        
        this.action = auditData.action || '';
        this.resource = auditData.resource || '';
        this.resourceId = auditData.resourceId || '';
        this.oldValues = auditData.oldValues || {};
        this.newValues = auditData.newValues || {};
        this.ipAddress = auditData.ipAddress || '';
        this.userAgent = auditData.userAgent || '';
        this.sessionId = auditData.sessionId || '';
        this.result = auditData.result || 'success';
        this.errorMessage = auditData.errorMessage || null;
    }

    getEntityData() {
        return {
            action: this.action,
            resource: this.resource,
            resourceId: this.resourceId,
            oldValues: this.oldValues,
            newValues: this.newValues,
            ipAddress: this.ipAddress,
            userAgent: this.userAgent,
            sessionId: this.sessionId,
            result: this.result,
            errorMessage: this.errorMessage
        };
    }
}

/**
 * File Upload Model
 * Tracks uploaded files and their metadata
 */
class FileUpload extends BaseCosmosModel {
    constructor(tenantId, userId, fileData = {}) {
        super(tenantId, userId, 'file-upload');
        
        this.originalName = fileData.originalName || '';
        this.fileName = fileData.fileName || '';
        this.mimeType = fileData.mimeType || '';
        this.fileSize = fileData.fileSize || 0;
        this.storageUrl = fileData.storageUrl || '';
        this.checksum = fileData.checksum || '';
        this.uploadStatus = fileData.uploadStatus || 'pending';
        this.processingStatus = fileData.processingStatus || 'pending';
        this.tags = fileData.tags || [];
        this.metadata = fileData.metadata || {};
    }

    getEntityData() {
        return {
            originalName: this.originalName,
            fileName: this.fileName,
            mimeType: this.mimeType,
            fileSize: this.fileSize,
            storageUrl: this.storageUrl,
            checksum: this.checksum,
            uploadStatus: this.uploadStatus,
            processingStatus: this.processingStatus,
            tags: this.tags,
            metadata: this.metadata
        };
    }
}

/**
 * Model Factory
 * Creates appropriate model instances based on entity type
 */
class CosmosModelFactory {
    static create(entityType, tenantId, userId, data = {}) {
        switch (entityType) {
            case 'user-profile':
                return new UserProfile(tenantId, userId, data);
            case 'chat-conversation':
                return new ChatConversation(tenantId, userId, data);
            case 'parameter-config':
                return new ParameterConfig(tenantId, userId, data);
            case 'audit-log':
                return new AuditLog(tenantId, userId, data);
            case 'file-upload':
                return new FileUpload(tenantId, userId, data);
            default:
                throw new Error(`Unknown entity type: ${entityType}`);
        }
    }

    static getAvailableTypes() {
        return [
            'user-profile',
            'chat-conversation', 
            'parameter-config',
            'audit-log',
            'file-upload'
        ];
    }
}

/**
 * Query Builder for HPK-optimized queries
 */
class CosmosQueryBuilder {
    constructor() {
        this.query = '';
        this.parameters = [];
    }

    // Query by full partition key (most efficient)
    byPartitionKey(tenantId, userId, entityType) {
        this.query = 'SELECT * FROM c WHERE c.pk = @pk';
        this.parameters = [{ name: '@pk', value: `${tenantId}/${userId}/${entityType}` }];
        return this;
    }

    // Query by tenant (cross-partition within tenant)
    byTenant(tenantId) {
        this.query = 'SELECT * FROM c WHERE c.tenantId = @tenantId';
        this.parameters = [{ name: '@tenantId', value: tenantId }];
        return this;
    }

    // Query by user within tenant
    byUser(tenantId, userId) {
        this.query = 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.userId = @userId';
        this.parameters = [
            { name: '@tenantId', value: tenantId },
            { name: '@userId', value: userId }
        ];
        return this;
    }

    // Add filters
    where(condition, paramName, paramValue) {
        if (this.query.includes('WHERE')) {
            this.query += ` AND ${condition}`;
        } else {
            this.query += ` WHERE ${condition}`;
        }
        this.parameters.push({ name: paramName, value: paramValue });
        return this;
    }

    // Add ordering
    orderBy(field, direction = 'ASC') {
        this.query += ` ORDER BY c.${field} ${direction}`;
        return this;
    }

    // Add pagination
    limit(count, offset = 0) {
        this.query += ` OFFSET ${offset} LIMIT ${count}`;
        return this;
    }

    // Exclude soft-deleted items
    excludeDeleted() {
        return this.where('c.isDeleted = @isDeleted', '@isDeleted', false);
    }

    build() {
        return {
            query: this.query,
            parameters: this.parameters
        };
    }
}

module.exports = {
    BaseCosmosModel,
    UserProfile,
    ChatConversation,
    ParameterConfig,
    AuditLog,
    FileUpload,
    CosmosModelFactory,
    CosmosQueryBuilder
};
