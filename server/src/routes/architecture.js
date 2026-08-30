import { Router } from 'express';
import { getLegacyArchitecture, getModernArchitecture, getArchitectureComparison } from '../architecture/architectureService.js';

const router = Router();

/**
 * POST /api/architecture/analyze
 * Analyzes the legacy architecture of the active project session
 */
router.post('/analyze', (req, res) => {
  const { sessionId } = req.body || {};
  const result = getLegacyArchitecture(sessionId);
  if (!result.success) {
    return res.status(result.statusCode || 400).json(result);
  }
  res.json(result);
});

/**
 * POST /api/architecture/analyze-modern
 * Analyzes the modernized architecture of the active project session
 */
router.post('/analyze-modern', (req, res) => {
  const { sessionId } = req.body || {};
  const result = getModernArchitecture(sessionId);
  if (!result.success) {
    return res.status(result.statusCode || 400).json(result);
  }
  res.json(result);
});

/**
 * POST /api/architecture/compare
 * Generates side-by-side legacy vs modern architecture comparison
 */
router.post('/compare', (req, res) => {
  const { sessionId } = req.body || {};
  const result = getArchitectureComparison(sessionId);
  if (!result.success) {
    return res.status(result.statusCode || 400).json(result);
  }
  res.json(result);
});

export default router;
