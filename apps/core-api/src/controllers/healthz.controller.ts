import { Router } from 'express';

import { getDb } from '@nrcno/core-db';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const db = getDb();

    const result = await db.raw('SELECT 1');
    if (result.rows.length !== 1) {
      throw new Error('Health check failed');
    }

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

export { router as healthzRouter };
