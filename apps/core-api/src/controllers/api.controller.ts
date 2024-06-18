import { Router, json } from 'express';

import { userRouter } from './user.controller';
import { prmRouter } from './prm.controller';
import { positionRouter } from './position.controller';

const router = Router();
router.use(json({ type: ['application/json'] }));
router.use(userRouter);
router.use(prmRouter);
router.use(positionRouter);

export { router as apiRouter };
