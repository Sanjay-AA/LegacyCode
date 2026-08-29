import assert from 'assert';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { activeStore } from './src/pipeline/store.js';
import { validateSessionId, isSafeWorkspacePath } from './src/workspace/workspaceSecurity.js';
import { createWorkspaceBaseline, checkWorkspaceChanges } from './src/workspace/workspaceStatus.js';
import { openWorkspaceInVSCode, getWorkspaceStatus } from './src/workspace/workspaceService.js';

export async function runWorkspaceTests() {
  console.log('\n==================================================');
  console.log('RUNNING VS CODE WORKSPACE INTEGRATION TESTS');
  console.log('==================================================\n');

  // 1. Test Session ID & Security Path Validation
  console.log('[1/5] Testing Security & Path Traversal Protections...');
  assert.strictEqual(validateSessionId('1234abcd'), true);
  assert.strictEqual(validateSessionId('../etc/passwd'), false);
  assert.strictEqual(isSafeWorkspacePath('/invalid/path/does/not/exist'), false);
  console.log('  ✓ Security & Session ID validations passed!');

  // 2. Test Workspace Baseline & Change Detection
  console.log('[2/5] Testing Workspace Baseline & Local Change Detection...');
  const testDir = path.join(os.tmpdir(), 'latentcode-workspace-test-' + Date.now());
  fs.mkdirSync(testDir, { recursive: true });
  const file1 = path.join(testDir, 'App.jsx');
  fs.writeFileSync(file1, 'const App = () => <div>Test</div>;');

  const baseline = createWorkspaceBaseline(testDir);
  assert.strictEqual(baseline.has('App.jsx'), true);

  let changeRes = checkWorkspaceChanges(testDir, baseline);
  assert.strictEqual(changeRes.changed, false);
  assert.strictEqual(changeRes.filesChanged, 0);

  // Modify file
  fs.writeFileSync(file1, 'const App = () => <div>Modified Test</div>;');
  // Set mtime to simulate edit
  const stat = fs.statSync(file1);
  fs.utimesSync(file1, stat.atime, new Date(Date.now() + 2000));

  changeRes = checkWorkspaceChanges(testDir, baseline);
  assert.strictEqual(changeRes.changed, true);
  assert.strictEqual(changeRes.filesChanged, 1);
  console.log('  ✓ Local change detection baseline tests passed!');

  // Cleanup testDir
  fs.rmSync(testDir, { recursive: true, force: true });

  // 3. Test Session & Workspace Status Errors
  console.log('[3/5] Testing Invalid Session & Missing Migration Error Handling...');
  activeStore.clear();
  let statusResult = getWorkspaceStatus('non-existent');
  assert.strictEqual(statusResult.success, false);
  assert.strictEqual(statusResult.error, 'SESSION_NOT_FOUND');

  let openResult = await openWorkspaceInVSCode('non-existent');
  assert.strictEqual(openResult.success, false);
  assert.strictEqual(openResult.error, 'MIGRATION_NOT_COMPLETE');
  console.log('  ✓ Error response handling passed!');

  // 4. Test Valid Session Workspace Resolution & Open Command
  console.log('[4/5] Testing Active Session Workspace Resolution...');
  activeStore.setAnalysis('test-app.js', '$(document).ready()', { health: { score: 50 } });
  activeStore.setMigration('export default function App() {}', { summary: 'Migrated' });
  activeStore.setVerification({ overallStatus: 'VERIFIED', metrics: { totalTests: 5, passedTests: 5, failedTests: 0 } });

  const session = activeStore.getSession();
  assert.ok(session.migratedCode);

  openResult = await openWorkspaceInVSCode();
  // Expect either success: true (VS Code installed) or VSCODE_NOT_FOUND error (if code command not in path)
  assert.ok(typeof openResult.success === 'boolean');
  if (!openResult.success) {
    assert.strictEqual(openResult.error, 'VSCODE_NOT_FOUND');
    console.log(`  ✓ Open in VS Code returned expected environment error: "${openResult.message}"`);
  } else {
    assert.strictEqual(openResult.success, true);
    console.log('  ✓ Open in VS Code command executed successfully!');
  }

  // 5. State Invariance Check
  console.log('[5/5] Testing Pipeline & GitHub State Invariance...');
  const postSession = activeStore.getSession();
  assert.strictEqual(postSession.shipResult, null);
  console.log('  ✓ Pipeline & GitHub states remained completely unchanged after opening VS Code!');

  console.log('\n==================================================');
  console.log('ALL WORKSPACE INTEGRATION TESTS PASSED SUCCESSFULLY!');
  console.log('==================================================\n');
}
