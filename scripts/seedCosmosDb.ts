// scripts/seedCosmosDb.ts
// Data seeding script for Azure Cosmos DB
// Loads all seed data into Cosmos DB containers

import { cosmosDbClient } from '../src/lib/cosmosDbClient';
import { seedData, validateSeedData, getSeedDataSummary } from '../src/data/seed';

/**
 * Seed Cosmos DB with all foundation data
 */
async function seedCosmosDb() {
  console.log('==========================================');
  console.log('EVA DA 2.0 - Cosmos DB Seeding Script');
  console.log('==========================================\n');

  try {
    // Validate seed data before proceeding
    console.log('Step 1: Validating seed data...');
    const validation = validateSeedData();
    
    if (!validation.valid) {
      console.error('\n❌ Seed data validation failed:');
      validation.errors.forEach(err => console.error(`  - ${err}`));
      process.exit(1);
    }

    if (validation.warnings.length > 0) {
      console.warn('\n⚠️ Warnings:');
      validation.warnings.forEach(warn => console.warn(`  - ${warn}`));
    }

    console.log('✓ Seed data validated successfully\n');
    console.log(getSeedDataSummary());
    console.log('\n');

    // Initialize Cosmos DB client
    console.log('Step 2: Connecting to Cosmos DB...');
    await cosmosDbClient.initialize();
    console.log('✓ Connected to Cosmos DB\n');

    const config = cosmosDbClient.getConfig();
    console.log(`Database: ${config.databaseName}`);
    console.log(`Endpoint: ${config.endpoint}`);
    console.log(`Auth Method: ${config.authMethod}\n`);

    // Seed translations
    console.log('Step 3: Seeding translations...');
    const translationResults = await cosmosDbClient.batchCreateItems(
      'translations',
      seedData.translations.map(t => ({
        ...t,
        type: 'translation',
        _partitionKey: t.category
      }))
    );
    console.log(`✓ Seeded ${translationResults.length} translations\n`);

    // Seed themes
    console.log('Step 4: Seeding themes...');
    const themeResults = await cosmosDbClient.batchCreateItems(
      'settings',
      seedData.defaultSettings.themes.map(t => ({
        ...t,
        type: 'theme',
        _partitionKey: 'theme'
      }))
    );
    console.log(`✓ Seeded ${themeResults.length} themes\n`);

    // Seed accessibility settings
    console.log('Step 5: Seeding default accessibility settings...');
    await cosmosDbClient.createItem('settings', {
      id: 'default-accessibility',
      type: 'accessibility',
      ...seedData.defaultSettings.accessibility,
      _partitionKey: 'accessibility'
    });
    console.log('✓ Seeded default accessibility settings\n');

    // Seed global settings
    console.log('Step 6: Seeding global settings...');
    await cosmosDbClient.createItem('settings', {
      ...seedData.defaultSettings.global,
      type: 'global',
      _partitionKey: 'global'
    });
    console.log('✓ Seeded global settings\n');

    // Seed roles
    console.log('Step 7: Seeding roles...');
    const roleResults = await cosmosDbClient.batchCreateItems(
      'roles',
      seedData.roles.map(r => ({
        ...r,
        _partitionKey: r.level
      }))
    );
    console.log(`✓ Seeded ${roleResults.length} roles\n`);

    // Seed projects
    console.log('Step 8: Seeding projects...');
    const projectResults = await cosmosDbClient.batchCreateItems(
      'projects',
      seedData.projects.map(p => ({
        ...p,
        _partitionKey: p.id
      }))
    );
    console.log(`✓ Seeded ${projectResults.length} projects\n`);

    // Seed users
    console.log('Step 9: Seeding users...');
    const userResults = await cosmosDbClient.batchCreateItems(
      'users',
      seedData.users.map(u => ({
        ...u,
        _partitionKey: u.id
      }))
    );
    console.log(`✓ Seeded ${userResults.length} users\n`);

    // Seed quick questions
    console.log('Step 10: Seeding quick questions...');
    const questionResults = await cosmosDbClient.batchCreateItems(
      'quickQuestions',
      seedData.quickQuestions.map(q => ({
        ...q,
        _partitionKey: q.projectId
      }))
    );
    console.log(`✓ Seeded ${questionResults.length} quick questions\n`);

    // Summary
    console.log('==========================================');
    console.log('✓ SEEDING COMPLETED SUCCESSFULLY');
    console.log('==========================================\n');
    console.log('Summary:');
    console.log(`  Translations: ${translationResults.length}`);
    console.log(`  Themes: ${themeResults.length}`);
    console.log(`  Accessibility Settings: 1`);
    console.log(`  Global Settings: 1`);
    console.log(`  Roles: ${roleResults.length}`);
    console.log(`  Projects: ${projectResults.length}`);
    console.log(`  Users: ${userResults.length}`);
    console.log(`  Quick Questions: ${questionResults.length}`);
    console.log(`  Total Records: ${
      translationResults.length + 
      themeResults.length + 
      roleResults.length + 
      projectResults.length + 
      userResults.length + 
      questionResults.length + 
      2
    }\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    console.error('\nError details:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run the seeding script
seedCosmosDb();
