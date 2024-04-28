import { Router, json } from 'express';

import { userRouter } from './user.controller';
import { prmRouter } from './prm.controller';
import { deduplicationRouter } from './deduplication.controller';

const router = Router();
router.use(json({ type: ['application/json'] }));
router.use(userRouter);
router.use(prmRouter);
router.use(deduplicationRouter);

export { router as apiRouter };
