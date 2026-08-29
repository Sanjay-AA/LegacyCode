/**
 * In-memory Session Migration History
 * Records history of completed or active migrations during the session.
 */
class MigrationHistoryStore {
  constructor() {
    this.history = [];
    this.counter = 1;
  }

  addMigration(record) {
    const entry = {
      id: `migration-${this.counter++}`,
      number: this.counter - 1,
      source: record.source || 'jQuery',
      target: record.target || 'React',
      filename: record.filename || 'legacy-component.js',
      adapterId: record.adapterId || 'jquery-to-react',
      status: record.status || 'VERIFIED', // 'VERIFIED' | 'SHIPPED' | 'FAILED' | 'AWAITING_APPROVAL'
      verifiedTests: record.verifiedTests || '6/6',
      riskReduction: record.riskReduction || '30 → 92',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      prNumber: record.prNumber || null,
      prUrl: record.prUrl || null
    };

    this.history.unshift(entry); // Newest first
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
