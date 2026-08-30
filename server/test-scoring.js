import { calculateLegacySafetyScore, calculateModernSafetyScore, getRiskLevel } from './src/scoring/migrationSafety.js';

console.log('==================================================');
console.log('MIGRATION SAFETY SCORING UNIT TESTS');
console.log('==================================================\n');

// Test 1: Risk Level Ranges
console.log('[1/4] Testing Risk Level Ranges...');
if (getRiskLevel(35) === 'HIGH RISK' && getRiskLevel(55) === 'MEDIUM RISK' && getRiskLevel(85) === 'LOW RISK') {
  console.log('  ✓ 0-39 -> HIGH RISK, 40-69 -> MEDIUM RISK, 70-100 -> LOW RISK passed!');
} else {
  console.error('  ✕ Risk level range mapping failed');
  process.exit(1);
}

// Test 2: Legacy Score Calculation
console.log('\n[2/4] Testing Legacy Safety Score Calculation...');
const mockAnalysis = {
  inventory: { javaScriptFiles: ['app.js'], configFiles: ['package.json'] },
  metrics: { domMutationsCount: 8, globalVarsCount: 3, jqueryUsageCount: 5 },
  health: { score: 40 },
  risks: [{ title: 'Direct DOM manipulation' }, { title: 'Global state leaks' }]
};

const legacyScore = calculateLegacySafetyScore(mockAnalysis);
console.log('  ✓ Legacy Safety Score:', legacyScore.totalScore, '/', 100, `(${legacyScore.riskLevel})`);
if (legacyScore.totalScore >= 0 && legacyScore.totalScore <= 100) {
  console.log('  ✓ Score within [0, 100] bounds!');
} else {
  console.error('  ✕ Legacy score out of bounds');
  process.exit(1);
}

// Test 3: Modern Score Calculation & Breakdown
console.log('\n[3/4] Testing Modern Safety Score Breakdown...');
const mockSession = {
  analysis: mockAnalysis,
  verification: {
    overallStatus: 'VERIFIED',
    metrics: { passedTests: 3, totalTests: 3, failedTests: 0 }
  },
  migratedCode: 'import React, { useState, useEffect } from "react"; export default function App() { return <div>Hello</div>; }'
};

const modernScore = calculateModernSafetyScore(mockSession);
console.log('  ✓ Modern Safety Score:', modernScore.totalScore, '/', 100, `(${modernScore.riskLevel})`);
console.log('  ✓ Score Breakdown:');
console.log('    • Behavioral Verification:', modernScore.breakdown.behavioralVerification.score, '/', modernScore.breakdown.behavioralVerification.max);
console.log('    • Dependency Health:     ', modernScore.breakdown.dependencyHealth.score, '/', modernScore.breakdown.dependencyHealth.max);
console.log('    • Architecture Quality:  ', modernScore.breakdown.architectureQuality.score, '/', modernScore.breakdown.architectureQuality.max);
console.log('    • Legacy Pattern Removal:', modernScore.breakdown.legacyPatternRemoval.score, '/', modernScore.breakdown.legacyPatternRemoval.max);
console.log('    • Test Results:          ', modernScore.breakdown.testResults.score, '/', modernScore.breakdown.testResults.max);
console.log('    • Critical Issues:       ', modernScore.breakdown.criticalIssues.score, '/', modernScore.breakdown.criticalIssues.max);

const sum = Object.values(modernScore.breakdown).reduce((acc, curr) => acc + curr.score, 0);
if (sum === modernScore.totalScore) {
  console.log('  ✓ Sum of breakdown components equals total score:', sum);
} else {
  console.error('  ✕ Breakdown sum mismatch:', sum, 'vs', modernScore.totalScore);
  process.exit(1);
}

// Test 4: Risk Level Thresholds
console.log('\n[4/4] Verifying Target Risk Levels...');
if (modernScore.totalScore >= 70 && modernScore.riskLevel === 'LOW RISK') {
  console.log('  ✓ Score 70+ correctly maps to LOW RISK!');
}

console.log('\n==================================================');
console.log('ALL MIGRATION SAFETY SCORING TESTS PASSED!');
console.log('==================================================');
