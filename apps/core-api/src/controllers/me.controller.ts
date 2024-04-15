import { Router } from 'express';

import * as UserService from '../services/user.service';

const router = Router();

router.get('/', async (req, res, next) => {
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

router.get('/allusers', async (req, res, next) => {
  try {
    const users = await UserService.list(0, 100);
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
});

export { router as meRouter };
