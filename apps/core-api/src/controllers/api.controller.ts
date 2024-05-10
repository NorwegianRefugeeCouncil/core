import { Router, json } from 'express';

import { userRouter } from './user.controller';
import { prmRouter } from './prm.controller';

const router = Router();
router.use(json({ type: ['application/json'] }));
router.use(userRouter);
router.use(prmRouter);

export { router as apiRouter };
