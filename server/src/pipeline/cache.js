import crypto from 'crypto';

/**
 * In-memory Analysis Cache
 * Avoids re-analyzing identical files during the same migration session.
 */
class AnalysisCache {
  constructor() {
    this.cache = new Map();
  }

  getHash(code, filename) {
    return crypto.createHash('sha256').update(`${filename}:${code}`).digest('hex');
  }

  get(code, filename) {
    const hash = this.getHash(code, filename);
    return this.cache.get(hash) || null;
  }

  set(code, filename, analysis) {
    const hash = this.getHash(code, filename);
    this.cache.set(hash, {
      analysis,
      cachedAt: new Date().toISOString()
    });
  }

  clear() {
    this.cache.clear();
  }
}

export const sessionCache = new AnalysisCache();
