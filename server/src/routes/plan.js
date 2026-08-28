import { Router } from 'express';
import { generateMigrationPlan } from '../pipeline/planner.js';
import { activeStore } from '../pipeline/store.js';

const router = Router();

/**
 * GET /api/plan
 * Returns active migration plan if generated.
 */
router.get('/', (req, res) => {
  const session = activeStore.getSession();
  if (!session.plan) {
    return res.status(404).json({ error: 'No active migration plan found. Run Analyze first.' });
  }
  return res.status(200).json({
    success: true,
    plan: session.plan
  });
});

/**
 * POST /api/plan
 * Accepts analysis object (or uses activeStore analysis) and returns a detailed Migration Plan.
 */
router.post('/', (req, res) => {
  try {
    let analysisToUse = req.body.analysis;

    // If not provided in body, fallback to stored analysis from session
    if (!analysisToUse) {
      const session = activeStore.getSession();
      analysisToUse = session.analysis;
    }

    if (!analysisToUse || typeof analysisToUse !== 'object') {
      return res.status(400).json({
        error: 'Invalid request: No analysis data available. Run Analyze stage first.'
      });
    }

    const plan = generateMigrationPlan(analysisToUse);

    // Save plan in session store
    activeStore.setPlan(plan);

    return res.status(200).json({
      success: true,
      plan
    });
  } catch (error) {
    console.error('[Plan API Error]:', error);
    return res.status(500).json({
      error: 'Failed to generate migration plan: ' + error.message
    });
  }
});

export default router;
