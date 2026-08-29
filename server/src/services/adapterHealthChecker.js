import fs from 'fs';
import path from 'path';
import { migrationRegistry } from '../adapters/MigrationRegistry.js';

function getRepoRoot() {
  let curr = process.cwd();
  while (curr) {
    if (fs.existsSync(path.join(curr, 'samples'))) {
      return curr;
    }
    const parent = path.dirname(curr);
    if (parent === curr) break;
    curr = parent;
  }
  return process.cwd();
}

const SAMPLE_FIXTURES = {
  'jquery-to-react': { relPath: 'samples/web/jquery-react/legacy-counter.js', filename: 'legacy-counter.js' },
  'vue-to-react': { relPath: 'samples/web/vue-react/legacy-cart.vue', filename: 'legacy-cart.vue' },
  'angular-to-react': { relPath: 'samples/web/angular-react/legacy-user.ts', filename: 'legacy-user.ts' },
  'php-to-laravel': { relPath: 'samples/backend/php-laravel/legacy-register.php', filename: 'legacy-register.php' },
  'java-to-spring': { relPath: 'samples/backend/java-spring/LegacyServlet.java', filename: 'LegacyServlet.java' },
  'python-to-fastapi': { relPath: 'samples/backend/python-fastapi/legacy_app.py', filename: 'legacy_app.py' },
  'android-java-to-kotlin': { relPath: 'samples/mobile/android-kotlin/LegacyActivity.java', filename: 'LegacyActivity.java' },
  'react-native-modernization': { relPath: 'samples/mobile/react-native/LegacyScreen.js', filename: 'LegacyScreen.js' },
  'legacy-mobile': { relPath: 'samples/mobile/react-native/LegacyScreen.js', filename: 'LegacyScreen.js' },
  'schema-modernization': { relPath: 'samples/data/database/legacy-schema.sql', filename: 'legacy-schema.sql' },
  'database-migration': { relPath: 'samples/data/database/legacy-schema.sql', filename: 'legacy-schema.sql' },
  'api-modernization': { relPath: 'samples/data/api/legacy-service.wsdl', filename: 'legacy-service.wsdl' },
  'infrastructure-modernization': { relPath: 'samples/infrastructure/deploy-script.sh', filename: 'deploy-script.sh' },
  'legacy-cloud-config': { relPath: 'samples/infrastructure/deploy-script.sh', filename: 'deploy-script.sh' }
};

export async function runAdapterHealthCheck(adapterId = null) {
  const adaptersToTest = adapterId
    ? [migrationRegistry.getAdapter(adapterId)]
    : migrationRegistry.getAllAdapters();

  const rootDir = getRepoRoot();
  const results = [];

  for (const adapter of adaptersToTest) {
    if (!adapter) continue;

    const fixtureInfo = SAMPLE_FIXTURES[adapter.id];
    let sampleCode = '$(document).ready(function() { var c=0; $("#b").click(function(){ c++; }); });';
    let filename = 'legacy-sample.js';

    if (fixtureInfo) {
      try {
        const fullPath = path.join(rootDir, fixtureInfo.relPath);
        if (fs.existsSync(fullPath)) {
          sampleCode = fs.readFileSync(fullPath, 'utf-8');
          filename = fixtureInfo.filename;
        }
      } catch (_) {}
    }

    const capabilities = {
      detect: false,
      analyze: false,
      plan: false,
      migrate: false,
      verify: false,
      repair: false,
      ship: false
    };

    const metrics = {
      analysisDurationMs: 0,
      migrationDurationMs: 0,
      verificationDurationMs: 0
    };

    let adapterStatus = 'experimental';
    const errors = [];

    try {
      // 1. Detect
      const detectConf = adapter.detect(sampleCode, filename);
      capabilities.detect = detectConf > 0;

      // 2. Analyze
      const t0 = performance.now();
      const analysis = adapter.analyze(sampleCode, filename);
      metrics.analysisDurationMs = Math.round(performance.now() - t0);
      capabilities.analyze = !!(analysis && analysis.health && analysis.behavioralContract);

      // 3. Plan
      const plan = adapter.createPlan(analysis);
      capabilities.plan = !!(plan && plan.componentName);

      // 4. Migrate
      const t1 = performance.now();
      const migrationResult = adapter.migrate(sampleCode, analysis, plan);
      metrics.migrationDurationMs = Math.round(performance.now() - t1);
      capabilities.migrate = !!(migrationResult && migrationResult.migratedCode && migrationResult.migratedCode.length > 20);

      // 5. Verify
      const t2 = performance.now();
      const verification = adapter.verify(sampleCode, analysis, plan, migrationResult.migratedCode, { simulateFailure: false });
      metrics.verificationDurationMs = Math.round(performance.now() - t2);
      capabilities.verify = !!(verification && verification.overallStatus === 'VERIFIED' && verification.testCases?.length > 0);

      // 6. Repair
      const repairMigration = adapter.migrate(sampleCode, analysis, plan, 'Fix state boundary clamp invariant');
      const repairVerification = adapter.verify(sampleCode, analysis, plan, repairMigration.migratedCode, { simulateFailure: false });
      capabilities.repair = !!(repairVerification && repairVerification.overallStatus === 'VERIFIED');

      // 7. Ship Preparation
      capabilities.ship = capabilities.verify && capabilities.repair;

      // Determine Implemented vs Experimental Status
      const allPassed = Object.values(capabilities).every(Boolean);
      adapterStatus = allPassed ? 'implemented' : 'experimental';
    } catch (err) {
      errors.push(err.message);
      adapterStatus = 'experimental';
    }

    results.push({
      id: adapter.id,
      source: adapter.source,
      target: adapter.target,
      category: adapter.category,
      status: adapterStatus,
      capabilities,
      metrics,
      health: adapterStatus === 'implemented' ? 'HEALTHY' : 'DEGRADED',
      errors
    });
  }

  return {
    timestamp: new Date().toISOString(),
    totalAdapters: results.length,
    implementedCount: results.filter(r => r.status === 'implemented').length,
    experimentalCount: results.filter(r => r.status === 'experimental').length,
    results
  };
}
