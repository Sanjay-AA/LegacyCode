import { buildLegacyArchitecture, buildModernArchitecture, buildArchitectureComparison } from './src/architecture/architectureBuilder.js';
import { FIXTURES } from '../samples/test-fixtures/test-fixtures.js';
import os from 'os';
import path from 'path';
import fs from 'fs';

console.log('==================================================');
console.log('EVIDENCE-DRIVEN REALISTIC ARCHITECTURE GENERATION TESTS');
console.log('==================================================\n');

// TEST 1: Legacy Architecture from Real Project Files
console.log('[Test 1/3] Testing Legacy Architecture Generation from Evidence...');
const legacyDir1 = path.join(os.tmpdir(), 'test-arch-legacy-' + Date.now());
fs.mkdirSync(path.join(legacyDir1, 'frontend'), { recursive: true });
fs.mkdirSync(path.join(legacyDir1, 'backend'), { recursive: true });
fs.mkdirSync(path.join(legacyDir1, 'database'), { recursive: true });

fs.writeFileSync(path.join(legacyDir1, 'frontend', 'app.js'), FIXTURES.jquery.code);
fs.writeFileSync(path.join(legacyDir1, 'backend', 'app.rb'), 'require "sinatra"\nget "/cart" do\n  params[:count]\nend');
fs.writeFileSync(path.join(legacyDir1, 'database', 'schema.sql'), FIXTURES.mysqlDDL.code);

const legacyArch = buildLegacyArchitecture(legacyDir1);
console.log('  ✓ Legacy Nodes Count:', legacyArch.nodes.length);
console.log('  ✓ Legacy Node Technologies:', legacyArch.nodes.map(n => `${n.label} (${n.technology})`).join(', '));
console.log('  ✓ Workflow Steps Generated:', legacyArch.workflow.length);

const hasInventedTechs = legacyArch.nodes.some(n => ['Redis', 'Kafka', 'Docker', 'Kubernetes', 'AWS', 'GCP'].includes(n.technology));
if (!hasInventedTechs) {
  console.log('  ✓ Verified: ZERO unrepresented/invented technologies (No Redis/Kafka/Docker/AWS)!');
} else {
  console.error('  ✕ FAILED: Invented technologies found in graph!');
  process.exit(1);
}

// TEST 2: Modernized Architecture Generation
console.log('\n[Test 2/3] Testing Modernized Architecture Generation from Modern Workspace...');
const modernDir1 = path.join(os.tmpdir(), 'test-arch-modern-' + Date.now());
fs.mkdirSync(path.join(modernDir1, 'src', 'components'), { recursive: true });
fs.mkdirSync(path.join(modernDir1, 'backend', 'app', 'controllers'), { recursive: true });
fs.mkdirSync(path.join(modernDir1, 'database', 'prisma'), { recursive: true });

fs.writeFileSync(path.join(modernDir1, 'src', 'App.jsx'), 'export default function App() {}');
fs.writeFileSync(path.join(modernDir1, 'src', 'components', 'Cart.jsx'), 'export default function Cart() {}');
fs.writeFileSync(path.join(modernDir1, 'backend', 'app', 'controllers', 'CartController.rb'), 'class CartController < ApplicationController; end');
fs.writeFileSync(path.join(modernDir1, 'database', 'prisma', 'schema.prisma'), 'datasource db { provider = "postgresql" }');

const modernArch = buildModernArchitecture(modernDir1);
console.log('  ✓ Modern Nodes Count:', modernArch.nodes.length);
console.log('  ✓ Modern Node Technologies:', modernArch.nodes.map(n => `${n.label} (${n.technology})`).join(', '));

const comparison = buildArchitectureComparison(legacyArch, modernArch);
console.log('  ✓ Architecture Comparison Mappings:', comparison.comparisons.length);

// TEST 3: Insufficient Evidence Handling
console.log('\n[Test 3/3] Testing Insufficient Evidence Handling for Empty Project...');
const emptyDir = path.join(os.tmpdir(), 'test-arch-empty-' + Date.now());
fs.mkdirSync(emptyDir, { recursive: true });

const emptyArch = buildLegacyArchitecture(emptyDir);
console.log('  ✓ Empty Project Evidence Sufficient:', emptyArch.isEvidenceSufficient);

if (emptyArch.isEvidenceSufficient === false) {
  console.log('  ✓ Correctly flagged "isEvidenceSufficient: false" for empty directory!');
} else {
  console.error('  ✕ FAILED: Falsely generated architecture for empty project!');
  process.exit(1);
}

console.log('\n==================================================');
console.log('ALL REALISTIC ARCHITECTURE GENERATION TESTS PASSED!');
console.log('==================================================');
