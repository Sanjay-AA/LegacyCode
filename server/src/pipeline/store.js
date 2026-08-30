import path from 'path';

/**
 * In-memory session store for Legacy Rescue agent state with stage checkpoints
 * and dual workspace support (legacyWorkspace vs. modernWorkspace).
 */

class SessionStore {
  constructor() {
    this.checkpoints = new Map();
    this.session = {
      id: null,
      legacyWorkspace: null,
      modernWorkspace: null,
      workspaceDir: null,
      workspaceBaseline: null,
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

  setWorkspace(sessionId, legacyWorkspace, modernWorkspace = null, baseline = null) {
    let legPath = legacyWorkspace;
    let modPath = modernWorkspace;

    // Handle backward compatibility signature (sessionId, workspaceDir, baseline)
    if (typeof legacyWorkspace === 'string' && !modernWorkspace && baseline === null) {
      if (legacyWorkspace.endsWith('legacy') || legacyWorkspace.endsWith('modern')) {
        legPath = legacyWorkspace.replace(/[/\\]modern$/, '').replace(/[/\\]legacy$/, '') + '/legacy';
        modPath = legacyWorkspace.replace(/[/\\]modern$/, '').replace(/[/\\]legacy$/, '') + '/modern';
      } else {
        legPath = path.join(legacyWorkspace, 'legacy');
        modPath = path.join(legacyWorkspace, 'modern');
      }
    }

    this.session = {
      ...this.session,
      id: sessionId,
      legacyWorkspace: legPath,
      modernWorkspace: modPath,
      workspaceDir: modPath || legPath,
      workspaceBaseline: baseline,
      updatedAt: new Date().toISOString()
    };
    return this.session;
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
      id: null,
      legacyWorkspace: null,
      modernWorkspace: null,
      workspaceDir: null,
      workspaceBaseline: null,
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
