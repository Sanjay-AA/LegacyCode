import { Router } from 'express';
import healthRouter from './health.js';
import analyzeRouter from './analyze.js';
import planRouter from './plan.js';
import migrateRouter from './migrate.js';
import verifyRouter from './verify.js';
import shipRouter from './ship.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/analyze', analyzeRouter);
router.use('/plan', planRouter);
router.use('/migrate', migrateRouter);
router.use('/verify', verifyRouter);
router.use('/ship', shipRouter);

export default router;
