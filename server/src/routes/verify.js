import { Router } from 'express';
import { runBehavioralVerification } from '../pipeline/verifier.js';
import { activeStore } from '../pipeline/store.js';

const router = Router();

/**
 * GET /api/verify
 * Returns active verification results if available.
 */
router.get('/', (req, res) => {
  const session = activeStore.getSession();
  if (!session.verificationResult) {
    return res.status(404).json({ error: 'No active verification result found. Run Analyze, Plan, and Migrate stages first.' });
  }
  return res.status(200).json({
    success: true,
    verification: session.verificationResult,
    updatedAt: session.updatedAt
  });
});

/**
 * POST /api/verify
 * Runs behavioral verification test suite comparing jQuery source & analysis against migrated React code.
 */
router.post('/', (req, res) => {
  try {
    const session = activeStore.getSession();

    const rawCode = req.body.rawCode || session.rawCode;
    const analysis = req.body.analysis || session.analysis;
    const plan = req.body.plan || session.plan;
    const migratedCode = req.body.migratedCode || session.migratedCode;

    if (!rawCode || !analysis || !plan || !migratedCode) {
      return res.status(400).json({
        error: 'Missing required inputs: All prior pipeline stages (Upload, Analyze, Plan, Migrate) must complete before running Verification.'
      });
    }

    const verificationResult = runBehavioralVerification(rawCode, analysis, plan, migratedCode);

    // Persist verification output in activeStore
    activeStore.setVerification(verificationResult);

    return res.status(200).json({
      success: true,
      verification: verificationResult
    });
  } catch (error) {
    console.error('[Verify API Error]:', error);
    return res.status(500).json({
      error: 'Behavioral verification failed: ' + error.message
    });
  }
});

export default router;
