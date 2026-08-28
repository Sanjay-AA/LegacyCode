import { Router } from 'express';
import healthRouter from './health.js';
import analyzeRouter from './analyze.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/analyze', analyzeRouter);

export default router;
