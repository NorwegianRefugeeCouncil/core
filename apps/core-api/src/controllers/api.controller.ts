import { Router, json } from 'express';

import { authorise } from '../middleware/authorisation';

const router = Router();

router.use(json({ type: ['application/json'] }));
router.use(authorise);

router.get('/me', async (req, res, next) => {
  try {
    const user = req.user;
    if (user) {
      res.status(200).json(user);
    } else {
      res.sendStatus(401);
    }
  } catch (error) {
    next(error);
  }
});

export { router as apiRouter };
