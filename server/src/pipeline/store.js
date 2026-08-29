/**
 * In-memory session store for Legacy Rescue agent state with stage checkpoints
 * and shipping idempotency protection.
 */

class SessionStore {
  constructor() {
    this.checkpoints = new Map();
    this.session = {
      filename: null,
      rawCode: null,
      analysis: null,
      plan: null,
      migratedCode: null,
      migrationSummary: null,
      verificationResult: null,
      shipResult: null,
      lastStage: 'idle',
      updatedAt: null
    };
  }

  saveCheckpoint(stage, data) {
    this.checkpoints.set(stage, {
      data,
      savedAt: new Date().toISOString()
    });
  }

  getCheckpoint(stage) {
    return this.checkpoints.get(stage)?.data || null;
  }

  setAnalysis(filename, rawCode, analysis) {
    this.session = {
      ...this.session,
      filename,
      rawCode,
      analysis,
      lastStage: 'analyze',
      updatedAt: new Date().toISOString()
    };
    this.saveCheckpoint('analyze', { filename, rawCode, analysis });
    return this.session;
  }

  setPlan(plan) {
    this.session = {
      ...this.session,
      plan,
      lastStage: 'plan',
      updatedAt: new Date().toISOString()
    };
    this.saveCheckpoint('plan', { plan });
    return this.session;
  }

  setMigration(migratedCode, summary) {
    this.session = {
      ...this.session,
      migratedCode,
      migrationSummary: summary,
      lastStage: 'migrate',
      updatedAt: new Date().toISOString()
    };
    this.saveCheckpoint('migrate', { migratedCode, summary });
    return this.session;
  }

  setVerification(verificationResult) {
    this.session = {
      ...this.session,
      verificationResult,
      lastStage: 'verify',
      updatedAt: new Date().toISOString()
    };
    this.saveCheckpoint('verify', { verificationResult });
    return this.session;
  }

  setShip(shipResult) {
    this.session = {
      ...this.session,
      shipResult,
      lastStage: 'ship',
      updatedAt: new Date().toISOString()
    };
    this.saveCheckpoint('ship', { shipResult });
    return this.session;
  }

  getSession() {
    return this.session;
  }

  clear() {
    this.checkpoints.clear();
    this.session = {
      filename: null,
      rawCode: null,
      analysis: null,
      plan: null,
      migratedCode: null,
      migrationSummary: null,
      verificationResult: null,
      shipResult: null,
      lastStage: 'idle',
      updatedAt: null
    };
  }
}

export const activeStore = new SessionStore();
