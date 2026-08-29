import fs from 'fs';
import path from 'path';
import os from 'os';

const CLEANUP_MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

export function cleanupStaleSessions() {
  const sessionsBaseDir = path.join(os.tmpdir(), 'latentcode', 'sessions');
  if (!fs.existsSync(sessionsBaseDir)) return;

  const now = Date.now();

  try {
    const sessionFolders = fs.readdirSync(sessionsBaseDir);
    for (const folder of sessionFolders) {
      const folderPath = path.join(sessionsBaseDir, folder);
      try {
        const stats = fs.statSync(folderPath);
        if (now - stats.mtimeMs > CLEANUP_MAX_AGE_MS) {
          fs.rmSync(folderPath, { recursive: true, force: true });
        }
      } catch (_) {}
    }
  } catch (err) {
    console.warn('Session cleanup warning:', err.message);
  }
}
