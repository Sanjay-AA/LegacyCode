import { Router } from 'express';
import { performMigration } from '../pipeline/migrator.js';
import { activeStore } from '../pipeline/store.js';

const router = Router();

/**
 * GET /api/migrate
 * Returns active migration result if available.
 */
router.get('/', (req, res) => {
  const session = activeStore.getSession();
  if (!session.migratedCode) {
    return res.status(404).json({ error: 'No active migration found. Run Analyze and Plan stages first.' });
  }
  return res.status(200).json({
    success: true,
    migratedCode: session.migratedCode,
    summary: session.migrationSummary,
    updatedAt: session.updatedAt
  });
});

/**
 * POST /api/migrate
 * Transforms raw jQuery code, analysis, and plan into a modern React component.
 */
router.post('/', (req, res) => {
  try {
    const session = activeStore.getSession();

    const rawCode = req.body.rawCode || session.rawCode;
    const analysis = req.body.analysis || session.analysis;
    const plan = req.body.plan || session.plan;

    if (!rawCode || !analysis || !plan) {
      return res.status(400).json({
        error: 'Missing required inputs: Original jQuery code, Analysis, and Plan must be present before migration.'
      });
    }

    const migrationResult = performMigration(rawCode, analysis, plan);

    // Persist in session store
    activeStore.setMigration(migrationResult.migratedCode, migrationResult.summary);

    return res.status(200).json({
      success: true,
      migratedCode: migrationResult.migratedCode,
      summary: migrationResult.summary
    });
  } catch (error) {
    console.error('[Migrate API Error]:', error);
    return res.status(500).json({
      error: 'Migration failed: ' + error.message
    });
  }
});

export default router;
