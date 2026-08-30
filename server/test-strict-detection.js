import fs from 'fs';
import path from 'path';
import os from 'os';
import { detectProjectStack } from './src/modernization/projectDetector.js';
import { orchestrateProjectMigration } from './src/modernization/projectOrchestrator.js';
import { FIXTURES } from '../samples/test-fixtures/test-fixtures.js';

console.log('==================================================');
console.log('STRICT EVIDENCE-DRIVEN DETECTION REGRESSION SUITE');
console.log('==================================================\n');

// REGRESSION TEST 1: jQuery Only
console.log('[Test 1/4] Regression Test 1: Uploading jQuery-only project...');
const files1 = new Map();
files1.set('frontend/index.html', '<html><body><script src="legacy.js"></script></body></html>');
files1.set('frontend/legacy.js', '$(document).ready(function() { $("#btn").click(function() { alert("hi"); }); });');

const stack1 = detectProjectStack(files1);
console.log('  ✓ Detected Technologies:', stack1.technologies.map(t => t.technology).join(', '));

const hasRuby1 = stack1.technologies.some(t => t.technology === 'Ruby');
const hasPHP1 = stack1.technologies.some(t => t.technology === 'PHP');
const hasJava1 = stack1.technologies.some(t => t.technology === 'Java');
const hasPython1 = stack1.technologies.some(t => t.technology === 'Python');

if (!hasRuby1 && !hasPHP1 && !hasJava1 && !hasPython1) {
  console.log('  ✓ Verified: Ruby, PHP, Java, Python all reported as NOT DETECTED');
} else {
  console.error('  ✕ FAILED: Undetected backend technology was falsely reported!');
  process.exit(1);
}

const sessionDir1 = path.join(os.tmpdir(), 'test-strict-1-' + Date.now());
fs.mkdirSync(sessionDir1, { recursive: true });
const mockAnalysis1 = { inventory: { totalFiles: 2, javaScriptFiles: ['frontend/legacy.js'] }, fileContentsMap: files1 };
const orch1 = orchestrateProjectMigration(sessionDir1, mockProjectAnalysis(files1));

const generatedFiles1 = fs.readdirSync(path.join(sessionDir1, 'modern', 'src', 'components'));
console.log('  ✓ Generated Modern Workspace Files:', generatedFiles1.join(', '));
const hasRubyOutput1 = fs.existsSync(path.join(sessionDir1, 'modern', 'backend'));
if (!hasRubyOutput1) {
  console.log('  ✓ Verified: ZERO Ruby/Rails files generated in modern workspace!');
} else {
  console.error('  ✕ FAILED: Ruby files were falsely generated!');
  process.exit(1);
}

// REGRESSION TEST 2: jQuery + Python
console.log('\n[Test 2/4] Regression Test 2: Uploading jQuery + Python project...');
const files2 = new Map();
files2.set('frontend/app.js', FIXTURES.jquery.code);
files2.set('backend/app.py', FIXTURES.python.code);

const stack2 = detectProjectStack(files2);
const techList2 = stack2.technologies.map(t => t.technology).join(', ');
console.log('  ✓ Detected Technologies:', techList2);

if (techList2.includes('jQuery') && techList2.includes('Python') && !techList2.includes('Ruby') && !techList2.includes('PHP')) {
  console.log('  ✓ Verified: Detected jQuery & Python ONLY. Ruby & PHP NOT DETECTED.');
} else {
  console.error('  ✕ FAILED: Unexpected backend technology detected!');
  process.exit(1);
}

const sessionDir2 = path.join(os.tmpdir(), 'test-strict-2-' + Date.now());
fs.mkdirSync(sessionDir2, { recursive: true });
const orch2 = orchestrateProjectMigration(sessionDir2, mockProjectAnalysis(files2));
const hasFastApi2 = fs.existsSync(path.join(sessionDir2, 'modern', 'backend', 'app', 'routers'));
const hasRuby2 = fs.existsSync(path.join(sessionDir2, 'modern', 'backend', 'app', 'controllers'));

if (hasFastApi2 && !hasRuby2) {
  console.log('  ✓ Verified: Python → FastAPI migrated, Ruby → Rails NOT executed!');
} else {
  console.error('  ✕ FAILED: Incorrect backend migration executed!');
  process.exit(1);
}

// REGRESSION TEST 3: jQuery + Ruby
console.log('\n[Test 3/4] Regression Test 3: Uploading jQuery + Ruby project...');
const files3 = new Map();
files3.set('frontend/app.js', FIXTURES.jquery.code);
files3.set('backend/app.rb', 'require "sinatra"\nget "/cart" do\n  params[:count]\nend');

const stack3 = detectProjectStack(files3);
const techList3 = stack3.technologies.map(t => t.technology).join(', ');
console.log('  ✓ Detected Technologies:', techList3);

if (techList3.includes('jQuery') && techList3.includes('Ruby')) {
  console.log('  ✓ Verified: Ruby detected when .rb file is present!');
} else {
  console.error('  ✕ FAILED: Ruby failed to detect when app.rb was present!');
  process.exit(1);
}

const sessionDir3 = path.join(os.tmpdir(), 'test-strict-3-' + Date.now());
fs.mkdirSync(sessionDir3, { recursive: true });
const orch3 = orchestrateProjectMigration(sessionDir3, mockProjectAnalysis(files3));
const hasRails3 = fs.existsSync(path.join(sessionDir3, 'modern', 'backend', 'app', 'controllers'));

if (hasRails3) {
  console.log('  ✓ Verified: Ruby → Rails executed ONLY when Ruby evidence was present!');
} else {
  console.error('  ✕ FAILED: Rails controller missing!');
  process.exit(1);
}

// REGRESSION TEST 4: User Target Selection Mismatch Guard
console.log('\n[Test 4/4] Regression Test 4: User selects Ruby → Rails but uploads jQuery-only project...');
const sessionDir4 = path.join(os.tmpdir(), 'test-strict-4-' + Date.now());
fs.mkdirSync(sessionDir4, { recursive: true });
const orch4 = orchestrateProjectMigration(sessionDir4, mockProjectAnalysis(files1), 'ruby-to-rails');

const hasRuby4 = fs.existsSync(path.join(sessionDir4, 'modern', 'backend'));
const explanations4 = orch4.explanations.join(' | ');

if (!hasRuby4 && explanations4.includes('was skipped because source technology "Ruby" was not detected')) {
  console.log('  ✓ Strict Migration Gate: Skipped Ruby → Rails because Ruby source was not detected!');
  console.log('  ✓ Explanation:', explanations4);
} else {
  console.error('  ✕ FAILED: Strict migration gate failed to block unrepresented target selector!');
  process.exit(1);
}

function mockProjectAnalysis(fileContentsMap) {
  const javaScriptFiles = [];
  const backendFiles = [];
  for (const p of fileContentsMap.keys()) {
    if (p.endsWith('.js')) javaScriptFiles.push(p);
    if (p.endsWith('.rb') || p.endsWith('.py')) backendFiles.push(p);
  }
  return {
    inventory: { totalFiles: fileContentsMap.size, javaScriptFiles, backendFiles },
    fileContentsMap
  };
}

console.log('\n==================================================');
console.log('ALL STRICT EVIDENCE-DRIVEN TESTS PASSED!');
console.log('==================================================');
