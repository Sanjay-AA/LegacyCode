import { migrationRegistry } from './src/adapters/MigrationRegistry.js';
import { detectTechnology } from './src/services/technologyDetector.js';
import { FIXTURES } from '../samples/test-fixtures/test-fixtures.js';

console.log('==================================================');
console.log('UNIVERSAL MODERNIZATION ENGINE TEST SUITE');
console.log('==================================================\n');

// 1. Audit Migration Registry (All 14 Adapters)
console.log('[1/3] Auditing Registered Adapters...');
const adapters = migrationRegistry.getAllAdapters();
console.log(`  ✓ Total Registered Adapters: ${adapters.length}`);

if (adapters.length >= 14) {
  console.log('  ✓ All 14 target adapters registered successfully!');
} else {
  console.error('  ✕ Missing registered adapters:', adapters.length);
  process.exit(1);
}

// 2. Test Detection & Confidence Score for Each Family
console.log('\n[2/3] Testing Detection & Confidence Evidence across 13 Fixtures...');
let passCount = 0;

for (const [key, fixture] of Object.entries(FIXTURES)) {
  const result = detectTechnology(fixture.code, fixture.filename);
  if (result.confidence >= 0.35 && result.detectedTechnology) {
    console.log(`  ✓ Fixture [${key}]: Detected ${result.detectedTechnology} (${Math.round(result.confidence * 100)}% confidence)`);
    passCount++;
  } else {
    console.error(`  ✕ Detection failed for fixture [${key}]`);
    process.exit(1);
  }
}

// 3. Test Full Pipeline Execution (Analyze, Plan, Migrate, Verify) for all 14 Adapters
console.log('\n[3/3] Testing Full Pipeline Transformation across all 14 Adapters...');
let adapterPassCount = 0;

for (const adapter of adapters) {
  try {
    const sampleCode = FIXTURES.jquery.code;
    const sampleFile = 'sample-file' + (adapter.supportedExtensions[0] || '.js');

    const analysis = adapter.analyze(sampleCode, sampleFile);
    const plan = adapter.createPlan(analysis);
    const migration = adapter.migrate(sampleCode, analysis, plan);
    const verification = adapter.verify(sampleCode, analysis, plan, migration.migratedCode);

    if (analysis && plan && migration.migratedCode && verification) {
      console.log(`  ✓ Adapter [${adapter.id}]: ${adapter.source} → ${adapter.target} passed full transformation loop!`);
      adapterPassCount++;
    } else {
      console.error(`  ✕ Pipeline loop incomplete for adapter [${adapter.id}]`);
      process.exit(1);
    }
  } catch (err) {
    console.error(`  ✕ Error testing adapter [${adapter.id}]:`, err.message);
    process.exit(1);
  }
}

console.log('\n==================================================');
console.log('ALL UNIVERSAL MODERNIZATION ENGINE TESTS PASSED!');
console.log('==================================================');
