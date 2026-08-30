import fs from 'fs';
import path from 'path';
import http from 'http';
import app from './src/app.js';
import { activeStore } from './src/pipeline/store.js';
import { extractProjectZip } from './src/services/zipExtractor.js';
import { analyzeProject } from './src/services/projectAnalyzer.js';
import { migrateProject } from './src/services/projectMigrator.js';
import { openWorkspaceInVSCode } from './src/workspace/workspaceService.js';
import AdmZip from 'adm-zip';

console.log('==================================================');
console.log('TESTING VS CODE MODERN WORKSPACE SEPARATION');
console.log('==================================================\n');

async function runTest() {
  activeStore.clear();

  // 1. Create mock legacy project zip
  console.log('[1/5] Creating mock legacy project ZIP...');
  const zip = new AdmZip();
  zip.addFile('index.html', Buffer.from('<html><body><script src="js/app.js"></script></body></html>', 'utf-8'));
  zip.addFile('js/app.js', Buffer.from('$(document).ready(function() { $("#btn").click(function() { alert("legacy"); }); });', 'utf-8'));
  const zipBuffer = zip.toBuffer();

  // 2. Extract ZIP
  console.log('[2/5] Extracting project ZIP...');
  const extraction = extractProjectZip(zipBuffer, 'mock-legacy.zip');
  activeStore.setWorkspace(extraction.sessionId, extraction.legacyDir, extraction.modernDir);

  const legacyFiles = fs.readdirSync(extraction.legacyDir);
  console.log('  ✓ Legacy Workspace path:', extraction.legacyDir);
  console.log('  ✓ Legacy Workspace files:', legacyFiles.join(', '));

  if (!fs.existsSync(path.join(extraction.legacyDir, 'index.html')) || !fs.existsSync(path.join(extraction.legacyDir, 'js', 'app.js'))) {
    console.error('  ✕ Legacy files missing from legacy workspace!');
    process.exit(1);
  }

  // 3. Verify VS Code fails before migration completion
  console.log('\n[3/5] Verifying VS Code opening fails before migration completes...');
  const preRes = await openWorkspaceInVSCode(extraction.sessionId);
  if (!preRes.success && preRes.error === 'MIGRATION_NOT_COMPLETE') {
    console.log('  ✓ Correctly rejected opening VS Code before migration completion:', preRes.message);
  } else {
    console.error('  ✕ Expected MIGRATION_NOT_COMPLETE error before migration completion!');
    process.exit(1);
  }

  // 4. Run Migration
  console.log('\n[4/5] Running migration to populate Modern Workspace...');
  const projectAnalysis = analyzeProject(extraction.legacyDir, extraction.extractedFiles);
  activeStore.setAnalysis('mock-legacy.zip', 'Mock Code', projectAnalysis);

  const migrationRes = migrateProject(extraction.sessionDir, projectAnalysis, 'jquery-to-react');
  activeStore.setMigration(migrationRes.mainAppCode, migrationRes.projectDiff);
  activeStore.setVerification(migrationRes.projectVerification);

  const modernFiles = fs.readdirSync(extraction.modernDir);
  console.log('  ✓ Modern Workspace path:', extraction.modernDir);
  console.log('  ✓ Modern Workspace files:', modernFiles.join(', '));

  const hasPackageJson = fs.existsSync(path.join(extraction.modernDir, 'package.json'));
  const hasAppJsx = fs.existsSync(path.join(extraction.modernDir, 'src', 'App.jsx'));
  const hasComponent = fs.existsSync(path.join(extraction.modernDir, 'src', 'components', 'App.jsx'));

  if (hasPackageJson && (hasAppJsx || hasComponent)) {
    console.log('  ✓ Modern workspace contains actual generated React files!');
  } else {
    console.error('  ✕ Modern workspace missing generated React components!');
    process.exit(1);
  }

  // Confirm original legacy workspace is unchanged
  const legacyContentAfter = fs.readFileSync(path.join(extraction.legacyDir, 'js', 'app.js'), 'utf-8');
  if (legacyContentAfter.includes('$(document).ready')) {
    console.log('  ✓ Original Legacy Workspace files remain 100% unchanged!');
  } else {
    console.error('  ✕ Legacy workspace was accidentally mutated!');
    process.exit(1);
  }

  // 5. Test VS Code resolution after migration
  console.log('\n[5/5] Testing VS Code resolution after migration...');
  const session = activeStore.getSession();
  console.log('  ✓ Session legacyWorkspace:', session.legacyWorkspace);
  console.log('  ✓ Session modernWorkspace :', session.modernWorkspace);

  const postRes = await openWorkspaceInVSCode(extraction.sessionId);
  if (postRes.success && postRes.workspaceOpened === extraction.modernDir) {
    console.log('  ✓ OPENED MODERN WORKSPACE IN VS CODE SUCCESSFULLY:', postRes.workspaceOpened);
  } else {
    console.error('  ✕ Expected VS Code to open modern workspace, got:', postRes);
    process.exit(1);
  }

  console.log('\n==================================================');
  console.log('VS CODE MODERN WORKSPACE SEPARATION TEST PASSED!');
  console.log('==================================================');
}

runTest().catch(err => {
  console.error('Test Error:', err);
  process.exit(1);
});
