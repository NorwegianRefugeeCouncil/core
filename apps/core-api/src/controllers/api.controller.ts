import { Router, json } from 'express';

import { userRouter } from './user.controller';
import { prmRouter } from './prm.controller';

const router = Router();
router.use(json({ type: ['application/json'] }));
router.use(userRouter);
router.use(prmRouter);

router.get('/auth', (req, res) => {
  res.sendStatus(200);
});

export { router as apiRouter };
