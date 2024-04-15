import { Router, json } from 'express';

import { meRouter } from './me.controller';

const router = Router();

router.use(json({ type: ['application/json'] }));

router.use('/me', meRouter);

export { router as apiRouter };
