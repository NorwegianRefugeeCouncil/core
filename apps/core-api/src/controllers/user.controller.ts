import { Router } from 'express';
import { z } from 'zod';

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

// TODO: Move to models lib
const paginationSchema = z.object({
  startIndex: z.number().int().positive().default(0),
  limit: z.number().int().positive().default(100),
});

router.get('/user', async (req, res, next) => {
  try {
    const { startIndex, limit } = paginationSchema.parse(req.query);
    const users = await UserService.list(startIndex, limit);
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
});

export { router as userRouter };
