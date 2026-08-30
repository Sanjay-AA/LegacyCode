/**
 * Client-side Migration Safety Scoring Service
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

  const behavioralVerification = 0;
  const depCount = (analysis.inventory?.configFiles?.length || 0) + (analysis.externalDependencies?.length || 1);
  const dependencyHealth = Math.max(5, Math.min(20, 20 - jqueryUsage - depCount));

  const archScore = analysis.health?.score ? Math.round((analysis.health.score / 100) * 15) : 7;
  const architectureQuality = Math.max(3, Math.min(15, archScore));
  const legacyPatternRemoval = 0;
  const testResults = 5;

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

export function calculateModernSafetyScore(session) {
  const analysis = session?.analysis;
  const verification = session?.verification;
  const migratedCode = session?.migratedCode;

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
    behavioralVerification = 25;
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
  if (session?.errorState) {
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
