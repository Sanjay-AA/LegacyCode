import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

/**
 * Validates session ID format and ensures workspace directory exists and is strictly confined to allowed roots.
 */
export function validateSessionId(sessionId) {
  if (!sessionId || typeof sessionId !== 'string') {
    return false;
  }
  // Hex session ID validation
  return /^[0-9a-fA-F]{8,64}$/.test(sessionId) || /^[0-9a-fA-F\-]{8,64}$/.test(sessionId);
}

export function isSafeWorkspacePath(targetDir) {
  if (!targetDir || typeof targetDir !== 'string') return false;

  const normalized = path.normalize(targetDir);

  // Must exist and be a directory
  if (!fs.existsSync(normalized)) return false;
  const stat = fs.statSync(normalized);
  if (!stat.isDirectory()) return false;

  // Verify allowed base roots (temp sessions dir or project root sample directories)
  const allowedRoots = [
    path.normalize(path.join(os.tmpdir(), 'latentcode', 'sessions')),
    path.normalize(process.cwd())
  ];

  const isUnderAllowedRoot = allowedRoots.some(root => {
    const relative = path.relative(root, normalized);
    return !relative.startsWith('..') && !path.isAbsolute(relative);
  });

  return isUnderAllowedRoot;
}
