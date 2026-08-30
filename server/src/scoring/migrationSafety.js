/**
 * Migration Safety Scoring Engine
 * 
 * Calculates the Migration Safety Score using a deterministic weighted model:
 * - Behavioral Verification: 30%
 * - Dependency Health: 20%
 * - Architecture Quality: 15%
 * - Legacy-Pattern Removal: 15%
 * - Test Results: 10%
 * - Critical Migration Issues: 10%
 * 
 * Score Ranges:
 * 0 - 39: HIGH RISK
 * 40 - 69: MEDIUM RISK
 * 70 - 100: LOW RISK
 */

export function getRiskLevel(score) {
  if (score < 40) return 'HIGH RISK';
  if (score < 70) return 'MEDIUM RISK';
  return 'LOW RISK';
}

export function getRiskLevelShort(score) {
  if (score < 40) return 'HIGH';
  if (score < 70) return 'MEDIUM';
  return 'LOW';
}

/**
 * Calculates Migration Safety Score for Legacy (Before Migration)
 */
export function calculateLegacySafetyScore(analysis) {
  if (!analysis) {
    return {
      totalScore: 42,
      riskLevel: 'MEDIUM RISK',
      riskLevelShort: 'MEDIUM',
      breakdown: {
        behavioralVerification: { score: 0, max: 30 },
        dependencyHealth: { score: 10, max: 20 },
        architectureQuality: { score: 7, max: 15 },
        legacyPatternRemoval: { score: 0, max: 15 },
        testResults: { score: 5, max: 10 },
        criticalIssues: { score: 10, max: 10 }
      }
    };
  }

  const metrics = analysis.metrics || {};
  const domMutations = metrics.domMutationsCount || (analysis.inventory?.javaScriptFiles?.length ? 5 : 2);
  const globalVars = metrics.globalVarsCount || 2;
  const jqueryUsage = metrics.jqueryUsageCount || 3;

  // 1. Behavioral Verification (Before = 0 because legacy code is unverified in target framework)
  const behavioralVerification = 0;

  // 2. Dependency Health (Legacy scripts with raw unencapsulated libs)
  const depCount = (analysis.inventory?.configFiles?.length || 0) + (analysis.externalDependencies?.length || 1);
  const dependencyHealth = Math.max(5, Math.min(20, 20 - jqueryUsage - depCount));

  // 3. Architecture Quality (Monolithic DOM scripts)
  const archScore = analysis.health?.score ? Math.round((analysis.health.score / 100) * 15) : 7;
  const architectureQuality = Math.max(3, Math.min(15, archScore));

  // 4. Legacy Pattern Removal (Before migration = 0% removed)
  const legacyPatternRemoval = 0;

  // 5. Test Results (Legacy unverified script test baseline)
  const testResults = 5;

  // 6. Critical Issues
  const criticalDeduction = (analysis.risks?.length || 1) * 2;
  const criticalIssues = Math.max(0, Math.min(10, 10 - criticalDeduction));

  const totalScore = Math.max(0, Math.min(100,
    behavioralVerification + dependencyHealth + architectureQuality + legacyPatternRemoval + testResults + criticalIssues
  ));

  return {
    totalScore,
    riskLevel: getRiskLevel(totalScore),
    riskLevelShort: getRiskLevelShort(totalScore),
    breakdown: {
      behavioralVerification: { score: behavioralVerification, max: 30 },
      dependencyHealth: { score: dependencyHealth, max: 20 },
      architectureQuality: { score: architectureQuality, max: 15 },
      legacyPatternRemoval: { score: legacyPatternRemoval, max: 15 },
      testResults: { score: testResults, max: 10 },
      criticalIssues: { score: criticalIssues, max: 10 }
    }
  };
}

/**
 * Calculates Migration Safety Score for Modernized Code (After Migration)
 */
export function calculateModernSafetyScore(sessionOrData) {
  const analysis = sessionOrData?.analysis;
  const verification = sessionOrData?.verification || sessionOrData?.verificationResult;
  const migratedCode = sessionOrData?.migratedCode;

  // 1. Behavioral Verification (Max 30)
  let behavioralVerification = 0;
  if (verification) {
    if (verification.metrics && verification.metrics.totalTests > 0) {
      const passRate = verification.metrics.passedTests / verification.metrics.totalTests;
      behavioralVerification = Math.round(passRate * 30);
    } else if (verification.overallStatus === 'VERIFIED') {
      behavioralVerification = 30;
    }
  } else if (migratedCode) {
    behavioralVerification = 25; // Generated code present but pending full suite execution
  }

  // 2. Dependency Health (Max 20)
  let dependencyHealth = 18;
  if (analysis?.inventory?.sensitiveFiles?.length > 0) {
    dependencyHealth -= 2;
  }

  // 3. Architecture Quality (Max 15)
  let architectureQuality = 14;
  if (migratedCode) {
    if (migratedCode.includes('useState') || migratedCode.includes('useEffect')) {
      architectureQuality = 15;
    }
  }

  // 4. Legacy Pattern Removal (Max 15)
  let legacyPatternRemoval = 15;
  if (migratedCode) {
    const remainingDOM = (migratedCode.match(/\.(html|append|click|on)\s*\(/g) || []).length;
    const remainingJQuery = (migratedCode.match(/(\$\(|jQuery\()/g) || []).length;
    if (remainingDOM > 0 || remainingJQuery > 0) {
      legacyPatternRemoval = Math.max(5, 15 - (remainingDOM + remainingJQuery) * 3);
    }
  }

  // 5. Test Results (Max 10)
  let testResults = 10;
  if (verification?.metrics?.failedTests > 0) {
    testResults = Math.max(0, 10 - verification.metrics.failedTests * 3);
  }

  // 6. Critical Issues (Max 10)
  let criticalIssues = 10;
  if (sessionOrData?.errorState) {
    criticalIssues = 2;
  } else if (verification?.overallStatus === 'FAILED') {
    criticalIssues = 4;
  }

  const totalScore = Math.max(0, Math.min(100,
    behavioralVerification + dependencyHealth + architectureQuality + legacyPatternRemoval + testResults + criticalIssues
  ));

  return {
    totalScore,
    riskLevel: getRiskLevel(totalScore),
    riskLevelShort: getRiskLevelShort(totalScore),
    breakdown: {
      behavioralVerification: { score: behavioralVerification, max: 30 },
      dependencyHealth: { score: dependencyHealth, max: 20 },
      architectureQuality: { score: architectureQuality, max: 15 },
      legacyPatternRemoval: { score: legacyPatternRemoval, max: 15 },
      testResults: { score: testResults, max: 10 },
      criticalIssues: { score: criticalIssues, max: 10 }
    }
  };
}
