import { Router } from 'express';

const router = Router();

/**
 * GET /api/health
 * Health check endpoint for monitoring backend status.
 */
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Legacy Rescue Backend API',
    version: '0.1.0',
    timestamp: new Date().toISOString()
  });
});

export default router;
