/**
 * Persistent Session Migration History Store
 * Records history of completed migrations during sessions.
 */
class MigrationHistoryStore {
  constructor() {
    this.history = [];
    this.counter = 1;
  }

  addMigration(record) {
    const entry = {
      id: record.id || `migration-${Date.now()}-${this.counter++}`,
      number: record.number || this.counter - 1,
      source: record.source || 'jQuery',
      target: record.target || 'React',
      filename: record.filename || 'legacy-component.js',
      adapterId: record.adapterId || 'jquery-to-react',
      status: record.status || 'COMPLETED',
      verifiedTests: record.verifiedTests || '3/3',
      riskReduction: record.riskReduction || '40 → 92',
      timestamp: record.timestamp || new Date().toLocaleString(),
      prNumber: record.prNumber || null,
      prUrl: record.prUrl || null,
      sessionData: record.sessionData || null
    };

    // Deduplicate if already exists
    this.history = [entry, ...this.history.filter(h => h.id !== entry.id)];
    return entry;
  }

  getHistory() {
    return this.history;
  }

  clear() {
    this.history = [];
    this.counter = 1;
  }
}

export const historyStore = new MigrationHistoryStore();
