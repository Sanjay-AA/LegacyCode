import fs from 'fs';
import path from 'path';
import os from 'os';
import AdmZip from 'adm-zip';
import { extractProjectZip } from './src/services/zipExtractor.js';
import { analyzeProject } from './src/services/projectAnalyzer.js';
import { orchestrateProjectMigration } from './src/modernization/projectOrchestrator.js';

console.log('==================================================');
console.log('TESTING COMPLETE MULTI-FILE PROJECT MIGRATION ENGINE');
console.log('==================================================\n');

// 1. Create a complex mock multi-file project ZIP
const zip = new AdmZip();

// Frontend files
zip.addFile('frontend/src/App.js', Buffer.from('$(document).ready(function() { console.log("App init"); });'));
zip.addFile('frontend/src/pages/Dashboard.js', Buffer.from('function loadDashboard() { $.ajax({ url: "/api/data" }); }'));
zip.addFile('frontend/src/lib/forecast.js', Buffer.from('function calcForecast(data) { return data * 1.5; }'));

// Backend files
zip.addFile('backend/src/main/java/com/healthcare/HealthcareApplication.java', Buffer.from('package com.healthcare; public class HealthcareApplication {}'));
zip.addFile('backend/src/main/java/com/healthcare/HealthcareController.java', Buffer.from('package com.healthcare; public class HealthcareController {}'));
zip.addFile('backend/src/main/java/com/healthcare/HealthcareService.java', Buffer.from('package com.healthcare; public class HealthcareService {}'));
zip.addFile('backend/pom.xml', Buffer.from('<project><artifactId>healthcare-backend</artifactId></project>'));

// Database & Config files
zip.addFile('database/schema.sql', Buffer.from('CREATE TABLE patients (id INT PRIMARY KEY, name VARCHAR(255));'));
zip.addFile('README.md', Buffer.from('# Healthcare Project Documentation'));

const zipBuffer = zip.toBuffer();

console.log('[1/5] Extracting complete multi-file project archive...');
const extraction = extractProjectZip(zipBuffer, 'healthcare-system.zip');
console.log(`  ✓ Total files extracted recursively: ${extraction.totalFiles}`);
if (extraction.totalFiles < 8) {
  console.error('FAIL: Expected at least 8 files extracted recursively');
  process.exit(1);
}

console.log('[2/5] Building project manifest and dynamic architecture...');
const analysis = analyzeProject(extraction.legacyDir, extraction.extractedFiles);
console.log(`  ✓ Project Manifest count: ${analysis.projectManifest.length}`);
console.log('  ✓ Architecture Nodes:', analysis.architecture.nodes.map(n => n.label));

if (analysis.projectManifest.length !== extraction.totalFiles) {
  console.error('FAIL: Project manifest count mismatch');
  process.exit(1);
}

console.log('[3/5] Modernizing complete project file-by-file...');
const migrationResult = orchestrateProjectMigration(extraction.sessionDir, analysis);

console.log(`  ✓ Converted modules count: ${Object.keys(migrationResult.convertedComponents).length}`);
console.log(`  ✓ Total files in modernized workspace diff: ${migrationResult.projectDiff.length}`);

// Verify modern workspace files on disk
const modernFilesOnDisk = [];
function readDirRecursive(dir, base = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      readDirRecursive(path.join(dir, entry.name), rel);
    } else {
      modernFilesOnDisk.push(rel);
    }
  }
}
readDirRecursive(extraction.modernDir);

console.log('\n[4/5] Reconstructed Modernized Workspace Directory Tree on Disk:');
modernFilesOnDisk.forEach(f => console.log(`  ├── ${f}`));

// Verification Checks
const hasDashboardJsx = modernFilesOnDisk.some(f => f.includes('Dashboard.jsx'));
const hasJavaController = modernFilesOnDisk.some(f => f.includes('HealthcareController.java'));
const hasPrismaSchema = modernFilesOnDisk.some(f => f.includes('schema.prisma'));
const hasPomXml = modernFilesOnDisk.some(f => f.includes('pom.xml'));
const hasReadme = modernFilesOnDisk.some(f => f.includes('README.md'));

console.log('\n[5/5] Verifying Reconstructed Project Integrity:');
console.log(`  ✓ Frontend Dashboard.jsx preserved & modernized: ${hasDashboardJsx}`);
console.log(`  ✓ Backend Java Controller preserved & modernized: ${hasJavaController}`);
console.log(`  ✓ Database schema.prisma modernized: ${hasPrismaSchema}`);
console.log(`  ✓ Configuration pom.xml preserved: ${hasPomXml}`);
console.log(`  ✓ Documentation README.md preserved: ${hasReadme}`);

if (!hasDashboardJsx || !hasJavaController || !hasPrismaSchema || !hasPomXml || !hasReadme) {
  console.error('FAIL: Modernized project reconstruction check failed!');
  process.exit(1);
}

console.log('\n==================================================');
console.log('COMPLETE MULTI-FILE PROJECT MIGRATION TEST PASSED!');
console.log('==================================================');
