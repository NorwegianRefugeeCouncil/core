import { Router } from 'express';

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
