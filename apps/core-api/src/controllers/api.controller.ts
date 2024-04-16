import { Router, json } from 'express';

import { userRouter } from './user.controller';

const router = Router();
router.use(json({ type: ['application/json'] }));
router.use(userRouter);

export { router as apiRouter };
