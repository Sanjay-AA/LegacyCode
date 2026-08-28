import { Router } from 'express';
import healthRouter from './health.js';
import analyzeRouter from './analyze.js';
import planRouter from './plan.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/analyze', analyzeRouter);
router.use('/plan', planRouter);

export default router;
