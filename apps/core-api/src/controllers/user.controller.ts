import { Router } from 'express';

import { UserService } from '@nrcno/core-user-engine';
import {
  PaginatedResponse,
  PaginationSchema,
  UserListItem,
  UserSchema,
} from '@nrcno/core-models';

const router = Router();

router.get('/users/me', async (req, res, next) => {
  try {
    if (req.user) {
      const user = UserSchema.parse(req.user);
      res.status(200).json(user);
    } else {
      res.sendStatus(401);
    }
  } catch (error) {
    next(error);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const { startIndex, pageSize } = PaginationSchema.parse(req.query);

    const [users, totalCount] = await Promise.all([
      UserService.list(startIndex, pageSize),
      UserService.getCount(),
    ]);
    const response: PaginatedResponse<UserListItem> = {
      startIndex,
      pageSize,
      totalCount,
      items: users,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

export { router as userRouter };
