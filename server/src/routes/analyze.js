import { Router } from 'express';
import { analyzeJQueryCode } from '../pipeline/analyzer.js';
import { activeStore } from '../pipeline/store.js';

const router = Router();

/**
 * GET /api/analyze
 * Returns current active session analysis if available.
 */
router.get('/', (req, res) => {
  const session = activeStore.getSession();
  if (!session.analysis) {
    return res.status(404).json({ error: 'No active analysis found' });
  }
  return res.status(200).json({
    success: true,
    analysis: session.analysis,
    updatedAt: session.updatedAt
  });
});

/**
 * POST /api/analyze
 * Accepts legacy jQuery source code (and optional filename) and returns structured analysis JSON.
 */
router.post('/', (req, res) => {
  try {
    const { code, filename } = req.body;

    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({
        error: 'Invalid request: "code" string is required'
      });
    }

    const safeFilename = filename || 'legacy-component.js';
    const analysis = analyzeJQueryCode(code, safeFilename);

    // Persist in memory for pipeline stages
    activeStore.setAnalysis(safeFilename, code, analysis);

    return res.status(200).json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('[Analyze API Error]:', error);
    return res.status(500).json({
      error: 'Failed to analyze code: ' + error.message
    });
  }
});

export default router;
