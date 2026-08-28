import { Router } from 'express';
import { shipMigration } from '../pipeline/shipper.js';
import { activeStore } from '../pipeline/store.js';

const router = Router();

/**
 * GET /api/ship
 * Returns active ship results if available.
 */
router.get('/', (req, res) => {
  const session = activeStore.getSession();
  if (!session.shipResult) {
    return res.status(404).json({ error: 'No active ship result found.' });
  }
  return res.status(200).json({
    success: true,
    shipResult: session.shipResult,
    updatedAt: session.updatedAt
  });
});

/**
 * POST /api/ship
 * Executes Shipping stage: checks verification guard, creates branch, commits code, and creates GitHub PR.
 */
router.post('/', async (req, res) => {
  try {
    const session = activeStore.getSession();

    if (!session.verificationResult) {
      return res.status(400).json({
        blocked: true,
        error: 'Shipping Blocked: All pipeline stages up to Behavioral Verification must run and pass before shipping.'
      });
    }

    // Check verification guard
    if (session.verificationResult.overallStatus !== 'VERIFIED' || session.verificationResult.metrics?.failedTests > 0) {
      return res.status(400).json({
        blocked: true,
        error: `Shipping Blocked: Behavioral verification failed (${session.verificationResult.metrics?.failedTests || 1} failing test(s)). Shipping is disabled until all tests pass.`
      });
    }

    const shipResult = await shipMigration(session);

    // Save in session store
    activeStore.setShip(shipResult);

    return res.status(200).json({
      success: true,
      shipResult
    });
  } catch (error) {
    console.error('[Ship API Error]:', error);
    if (error.isBlocked) {
      return res.status(400).json({
        blocked: true,
        error: error.message
      });
    }
    return res.status(500).json({
      error: 'Shipping failed: ' + error.message
    });
  }
});

export default router;
