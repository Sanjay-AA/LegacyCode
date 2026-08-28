/**
 * In-memory session store for Legacy Rescue agent state.
 * Holds active analysis results so future stages (Plan, Migrate, etc.) can access them.
 */

class SessionStore {
  constructor() {
    this.session = {
      filename: null,
      rawCode: null,
      analysis: null,
      plan: null,
      migratedCode: null,
      migrationSummary: null,
      updatedAt: null
    };
  }

  setAnalysis(filename, rawCode, analysis) {
    this.session = {
      ...this.session,
      filename,
      rawCode,
      analysis,
      updatedAt: new Date().toISOString()
    };
    return this.session;
  }

  setPlan(plan) {
    this.session = {
      ...this.session,
      plan,
      updatedAt: new Date().toISOString()
    };
    return this.session;
  }

  setMigration(migratedCode, summary) {
    this.session = {
      ...this.session,
      migratedCode,
      migrationSummary: summary,
      updatedAt: new Date().toISOString()
    };
    return this.session;
  }

  getSession() {
    return this.session;
  }

  clear() {
    this.session = {
      filename: null,
      rawCode: null,
      analysis: null,
      plan: null,
      migratedCode: null,
      migrationSummary: null,
      updatedAt: null
    };
  }
}

export const activeStore = new SessionStore();
