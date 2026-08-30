import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import os from 'os';
import AdmZip from 'adm-zip';
import { openWorkspaceInVSCode, getWorkspaceStatus, ensureWorkspaceForSession } from '../workspace/workspaceService.js';
import { activeStore } from '../pipeline/store.js';

const router = Router();

/**
 * POST /api/workspace/open-vscode
 * Opens the authoritative modernized project directory in local VS Code.
 */
router.post('/open-vscode', async (req, res) => {
  const { sessionId, migrationId, sessionData } = req.body || {};
  const activeSessionId = migrationId || sessionId;
  const result = await openWorkspaceInVSCode(activeSessionId, sessionData);

  if (!result.success) {
    return res.status(result.statusCode || 400).json({
      success: false,
      error: result.error || 'VSCODE_LAUNCH_FAILED',
      message: result.message || 'Failed to open VS Code'
    });
  }

  return res.status(200).json({
    success: true,
    message: result.message || 'Modernized project opened in VS Code',
    workspacePath: result.workspaceOpened
  });
});

/**
 * GET or POST /api/workspace/download-zip
 * Zips and downloads the complete modernized project directory tree.
 */
const handleZipDownload = async (req, res) => {
  try {
    const sessionId = req.query.sessionId || req.body?.sessionId || activeStore.getSession()?.id;
    let modernDir = null;

    if (sessionId) {
      modernDir = path.join(os.tmpdir(), 'latentcode', 'sessions', sessionId, 'modern');
    }

    if (!modernDir || !fs.existsSync(modernDir)) {
      modernDir = ensureWorkspaceForSession();
    }

    if (!modernDir || !fs.existsSync(modernDir)) {
      return res.status(404).json({ success: false, message: 'Modernized workspace not found' });
    }

    const zip = new AdmZip();
    zip.addLocalFolder(modernDir);

    const buffer = zip.toBuffer();
    const downloadFilename = 'modernized-project.zip';

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (err) {
    console.error('Download ZIP error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to generate project ZIP' });
  }
};

router.get('/download-zip', handleZipDownload);
router.post('/download-zip', handleZipDownload);

/**
 * GET /api/workspace/status
 * Returns workspace local file changes status.
 */
router.get('/status', (req, res) => {
  const sessionId = req.query.sessionId;
  const result = getWorkspaceStatus(sessionId);
  if (!result.success) {
    return res.status(result.statusCode || 400).json({
      success: false,
      error: result.error,
      message: result.message
    });
  }
  return res.status(200).json({
    success: true,
    changed: result.changed,
    filesChanged: result.filesChanged
  });
});

export default router;
