import { Router } from 'express';
import { analyzeJQueryCode } from '../pipeline/analyzer.js';

const router = Router();

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

    const analysis = analyzeJQueryCode(code, filename || 'legacy-component.js');

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
