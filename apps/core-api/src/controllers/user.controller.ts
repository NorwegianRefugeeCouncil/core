import { Router } from 'express';

import { PaginationSchema } from '@nrcno/core-models';

import * as UserService from '../services/user.service';

const router = Router();

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

router.get('/user', async (req, res, next) => {
  try {
    const { startIndex, limit } = PaginationSchema.parse(req.query);
    const users = await UserService.list(startIndex, limit);
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
});

export { router as userRouter };
