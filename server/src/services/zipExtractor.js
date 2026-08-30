import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import AdmZip from 'adm-zip';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB single file
const MAX_TOTAL_SIZE = 150 * 1024 * 1024; // 150MB total archive limit
const MAX_DIRECTORY_DEPTH = 15;

const IGNORED_PATHS = [
  'node_modules', '.git', 'build', 'dist', 'coverage', '.next', '.cache',
  'temp', 'tmp', '.vscode', '.idea', 'vendor', '__pycache__', '.pytest_cache'
];

export function extractProjectZip(buffer, originalFilename = 'project.zip') {
  const sessionId = crypto.randomBytes(8).toString('hex');
  const sessionDir = path.join(os.tmpdir(), 'latentcode', 'sessions', sessionId);
  const legacyDir = path.join(sessionDir, 'legacy');
  const modernDir = path.join(sessionDir, 'modern');

  fs.mkdirSync(legacyDir, { recursive: true });
  fs.mkdirSync(modernDir, { recursive: true });

  const zip = new AdmZip(buffer);
  const zipEntries = zip.getEntries();

  let totalExtractedBytes = 0;
  const extractedFiles = [];

  for (const entry of zipEntries) {
    if (entry.isDirectory) continue;

    const rawName = entry.entryName || '';
    const entryName = rawName.replace(/\\/g, '/');

    // Skip ignored directory paths (e.g., node_modules, .git, etc.)
    if (IGNORED_PATHS.some(p => entryName.includes(`/${p}/`) || entryName.startsWith(`${p}/`))) {
      continue;
    }

    // 1. Path Traversal & Absolute Path Protection
    if (
      entryName.includes('..') ||
      entryName.startsWith('/') ||
      entryName.startsWith('\\') ||
      path.isAbsolute(entryName) ||
      path.normalize(entryName).startsWith('..')
    ) {
      throw new Error(`Security Violation: Path traversal detected in ZIP entry "${entryName}"`);
    }

    // 2. Symlink Protection
    if (entry.isSymbolicLink || (entry.attr && (entry.attr & 0x20000))) {
      throw new Error(`Security Violation: Symbolic links are forbidden in project archive "${entryName}"`);
    }

    // 3. Directory Depth Limit
    const depth = entryName.split('/').length;
    if (depth > MAX_DIRECTORY_DEPTH) {
      throw new Error(`Security Violation: Directory depth exceeds maximum limit (${MAX_DIRECTORY_DEPTH}) in "${entryName}"`);
    }

    // 4. File Size Limit & Zip Bomb Prevention
    const uncompressedSize = entry.header.size || entry.getData().length;
    if (uncompressedSize > MAX_FILE_SIZE) {
      continue; // Safely skip single oversized binary files without breaking analysis
    }

    totalExtractedBytes += uncompressedSize;
    if (totalExtractedBytes > MAX_TOTAL_SIZE) {
      throw new Error(`Security Violation: Total extracted archive size exceeds ${MAX_TOTAL_SIZE / (1024 * 1024)}MB limit`);
    }

    // Safe Target Destination inside legacyDir
    const targetPath = path.join(legacyDir, entryName);
    const targetDir = path.dirname(targetPath);

    // Double-check resolved path stays inside legacyDir
    if (!targetPath.startsWith(legacyDir)) {
      throw new Error(`Security Violation: Target path "${targetPath}" escapes legacy directory`);
    }

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetPath, entry.getData());

    extractedFiles.push({
      relativePath: entryName,
      sizeBytes: uncompressedSize,
      extension: path.extname(entryName).toLowerCase()
    });
  }

  return {
    sessionId,
    sessionDir,
    legacyDir,
    modernDir,
    totalFiles: extractedFiles.length,
    totalSizeBytes: totalExtractedBytes,
    extractedFiles
  };
}
