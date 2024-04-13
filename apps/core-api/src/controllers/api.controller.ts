import { Router, json } from 'express';

import { userRouter } from './user.controller';

import { meRouter } from './me.controller';

const router = Router();
router.use(json({ type: ['application/json'] }));
router.use(userRouter);

router.use('/me', meRouter);

export { router as apiRouter };
