# 🔒 Security & Compliance Agent

## Mission: Government Security, Data Classification & Compliance Frameworks

### 🎯 Tonight's Priority Tasks:

#### 1. Azure AD Integration with RBAC
```typescript
// File: src/security/authentication/AzureADProvider.ts
interface UserRole {
  tenantId: string;
  userId: string;
  roles: ('admin' | 'user' | 'viewer' | 'auditor')[];
  permissions: string[];
  dataClassificationLevel: 'public' | 'internal' | 'protected_a' | 'protected_b';
}
```

#### 2. Protected B Data Handling
- Data classification and labeling system
- PII detection and automatic redaction
- Secure data storage and transmission
- Access logging and audit trails

#### 3. Government Compliance Framework
- Terms of use acceptance and tracking
- Privacy policy enforcement
- Security audit logging
- Data retention and disposal policies

### 🛡 Security Framework Checklist:
- [ ] Azure AD B2C integration for external users
- [ ] Role-based access control (RBAC) implementation
- [ ] Protected B data classification and handling
- [ ] PII detection and redaction utilities
- [ ] Security audit trail with immutable logs
- [ ] Terms of use acceptance tracking
- [ ] Privacy consent management
- [ ] Data encryption at rest and in transit

### 📋 Implementation Priority Order:
1. AzureADProvider.ts - Authentication integration
2. DataClassifier.ts - Protected B classification  
3. PIIDetector.ts - Personal information detection
4. AuditLogger.ts - Security audit trails
5. TermsOfUseService.ts - Legal compliance tracking

### 🔐 Security Patterns:
- Zero-trust architecture principles
- Least privilege access control
- Defense in depth security layers
- Continuous security monitoring
- Automated threat detection

### 🔗 Integration Points:
- Use data models from Agent 1 for audit storage
- Provide auth components to Agent 2
- Share security metrics with Agent 3
- Coordinate with Agent 6 for secure configuration
