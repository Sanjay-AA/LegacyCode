import fs from 'fs';
import path from 'path';

/**
 * Creates lightweight snapshot baseline of files in a workspace directory.
 */
export function createWorkspaceBaseline(dirPath) {
  if (!dirPath || !fs.existsSync(dirPath)) return null;

  const filesMap = new Map();

  function scanDir(currentDir, baseDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relPath = path.relative(baseDir, fullPath);

      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== '.git') {
          scanDir(fullPath, baseDir);
        }
      } else {
        const stat = fs.statSync(fullPath);
        filesMap.set(relPath, {
          size: stat.size,
          mtimeMs: stat.mtimeMs
        });
      }
    }
  }

  scanDir(dirPath, dirPath);
  return filesMap;
}

/**
 * Checks workspace directory against recorded baseline.
 */
export function checkWorkspaceChanges(dirPath, baselineMap) {
  if (!dirPath || !fs.existsSync(dirPath) || !baselineMap) {
    return { success: false, changed: false, filesChanged: 0 };
  }

  let filesChanged = 0;
  const currentFiles = new Set();

  function scanAndCompare(currentDir, baseDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relPath = path.relative(baseDir, fullPath);

      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== '.git') {
          scanAndCompare(fullPath, baseDir);
        }
      } else {
        currentFiles.add(relPath);
        const stat = fs.statSync(fullPath);
        const baseInfo = baselineMap.get(relPath);

        if (!baseInfo || baseInfo.size !== stat.size || Math.abs(baseInfo.mtimeMs - stat.mtimeMs) > 1000) {
          filesChanged++;
        }
      }
    }
  }

  scanAndCompare(dirPath, dirPath);

  // Check for deleted files
  for (const [relPath] of baselineMap.entries()) {
    if (!currentFiles.has(relPath)) {
      filesChanged++;
    }
  }

  return {
    success: true,
    changed: filesChanged > 0,
    filesChanged
  };
}
