import { Router, json } from 'express';

import { authorise } from '../middleware/authorisation';

import { meRouter } from './me.controller';

const router = Router();

router.use(json({ type: ['application/json'] }));
router.use(authorise);

router.use('/me', meRouter);

export { router as apiRouter };
