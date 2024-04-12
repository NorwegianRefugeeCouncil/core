import { Router, json } from 'express';

import { authorise } from '../middleware/authorisation';

const router = Router();

router.use(json({ type: ['application/json'] }));
router.use(authorise);

export { router as apiRouter };
