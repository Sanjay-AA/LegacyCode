import { calculateLegacySafetyScore, calculateModernSafetyScore } from '../scoring/migrationSafety.js';

/**
 * Base Migration Adapter Class
 * Defines the standard contract for all technology migration adapters.
 */
export class BaseAdapter {
  constructor(config) {
    this.id = config.id;
    this.category = config.category; // 'web' | 'backend' | 'mobile' | 'data' | 'infrastructure'
    this.source = config.source;
    this.target = config.target;
    this.status = config.status || 'SUPPORTED'; // 'SUPPORTED' | 'EXPERIMENTAL'
    this.supportedExtensions = config.supportedExtensions || [];
    this.description = config.description || `Migrate ${config.source} to ${config.target}`;
  }

  detect(code, filename) {
    throw new Error(`detect() not implemented for adapter ${this.id}`);
  }

  analyze(code, filename) {
    throw new Error(`analyze() not implemented for adapter ${this.id}`);
  }

  createPlan(analysis) {
    throw new Error(`createPlan() not implemented for adapter ${this.id}`);
  }

  migrate(code, analysis, plan, repairHint = null) {
    throw new Error(`migrate() not implemented for adapter ${this.id}`);
  }

  verify(code, analysis, plan, migratedCode, options = {}) {
    throw new Error(`verify() not implemented for adapter ${this.id}`);
  }

  getRiskAssessment(analysis, migratedCode) {
    const legacy = calculateLegacySafetyScore(analysis);
    const modern = calculateModernSafetyScore({ analysis, migratedCode });
    return {
      beforeScore: legacy.totalScore,
      afterScore: modern.totalScore,
      beforeLevel: legacy.riskLevel,
      afterLevel: modern.riskLevel,
      breakdown: modern.breakdown,
      reasons: (analysis.risks || []).map(r => r.title)
    };
  }
}
