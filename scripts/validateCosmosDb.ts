// scripts/validateCosmosDb.ts
// Quick validation script for Cosmos DB connectivity and seed data integrity

import { cosmosDbClient } from '../src/lib/cosmosDbClient';
import { validateSeedData, getSeedDataSummary } from '../src/data/seed';

async function validateCosmosDb() {
  console.log('==========================================');
  console.log('EVA DA 2.0 - Cosmos DB Validation Script');
  console.log('==========================================\n');

  // Validate seed data
  console.log('Step 1: Validating seed data...');
  const validation = validateSeedData();
  if (!validation.valid) {
    console.error('❌ Seed data validation failed:');
    validation.errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Warnings:');
    validation.warnings.forEach(warn => console.warn(`  - ${warn}`));
  }
  console.log('✓ Seed data validated successfully\n');
  console.log(getSeedDataSummary());
  console.log('\n');

  // Test Cosmos DB connection
  try {
    console.log('Step 2: Testing Cosmos DB connection...');
    await cosmosDbClient.initialize();
    console.log('✓ Connected to Cosmos DB');
    const config = cosmosDbClient.getConfig();
    console.log(`Database: ${config.databaseName}`);
    console.log(`Endpoint: ${config.endpoint}`);
    console.log(`Auth Method: ${config.authMethod}\n`);
  } catch (error) {
    console.error('❌ Cosmos DB connection failed:', error);
    process.exit(1);
  }

  // Test reading a project
  try {
    console.log('Step 3: Reading sample project...');
    const project = await cosmosDbClient.readItem('projects', 'canadalife', 'canadalife');
    if (project) {
      console.log('✓ Sample project found:', project.displayName || project.name);
    } else {
      console.warn('⚠️ Sample project not found. Try running the seed script.');
    }
  } catch (error) {
    console.error('❌ Error reading sample project:', error);
  }

  // Test reading a user
  try {
    console.log('Step 4: Reading sample user...');
    const user = await cosmosDbClient.readItem('users', 'user_admin_001', 'user_admin_001');
    if (user) {
      console.log('✓ Sample user found:', user.name || user.email);
    } else {
      console.warn('⚠️ Sample user not found. Try running the seed script.');
    }
  } catch (error) {
    console.error('❌ Error reading sample user:', error);
  }

  console.log('\n==========================================');
  console.log('Validation complete.');
  console.log('==========================================\n');
}

validateCosmosDb();
