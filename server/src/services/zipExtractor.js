import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import AdmZip from 'adm-zip';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_DIRECTORY_DEPTH = 10;

export function extractProjectZip(buffer, originalFilename = 'project.zip') {
  const sessionId = crypto.randomBytes(8).toString('hex');
  const sessionDir = path.join(os.tmpdir(), 'latentcode', 'sessions', sessionId);

  fs.mkdirSync(sessionDir, { recursive: true });

  const zip = new AdmZip(buffer);
  const zipEntries = zip.getEntries();

  let totalExtractedBytes = 0;
  const extractedFiles = [];

  for (const entry of zipEntries) {
    if (entry.isDirectory) continue;

    const rawName = entry.entryName || '';
    const entryName = rawName.replace(/\\/g, '/');

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
      throw new Error(`Security Violation: File "${entryName}" exceeds maximum size limit (10MB)`);
    }

    totalExtractedBytes += uncompressedSize;
    if (totalExtractedBytes > MAX_TOTAL_SIZE) {
      throw new Error(`Security Violation: Total extracted archive size exceeds 50MB limit`);
    }

    // Safe Target Destination
    const targetPath = path.join(sessionDir, entryName);
    const targetDir = path.dirname(targetPath);

    // Double-check resolved path stays inside sessionDir
    if (!targetPath.startsWith(sessionDir)) {
      throw new Error(`Security Violation: Target path "${targetPath}" escapes session directory`);
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
    totalFiles: extractedFiles.length,
    totalSizeBytes: totalExtractedBytes,
    extractedFiles
  };
}
