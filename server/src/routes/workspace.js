import { Router } from 'express';
import { openWorkspaceInVSCode, getWorkspaceStatus } from '../workspace/workspaceService.js';

const router = Router();

/**
 * POST /api/workspace/open-vscode
 * Opens the current migration workspace in local VS Code.
 */
router.post('/open-vscode', async (req, res) => {
  const { sessionId } = req.body || {};
  const result = await openWorkspaceInVSCode(sessionId);
  if (!result.success) {
    return res.status(result.statusCode || 400).json({
      success: false,
      error: result.error,
      message: result.message
    });
  }
  return res.status(200).json({
    success: true,
    message: result.message
  });
});

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
