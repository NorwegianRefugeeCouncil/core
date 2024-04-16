import { Router } from 'express';

import { PrmService } from '@nrcno/core-prm-engine';

const router = Router();

router.post('/prm/:entityType', async (req, res, next) => {
  try {
    throw new Error('Not implemented');
  } catch (error) {
    next(error);
  }
});

export { router as prmRouter };
