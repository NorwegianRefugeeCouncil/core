import { Router, json } from 'express';

import { Permissions } from '@nrcno/core-models';

import { checkPermissions } from '../middleware/authorisation.middleware';

import { userRouter } from './user.controller';
import { prmRouter } from './prm.controller';
import { positionRouter } from './position.controller';
import { teamRouter } from './team.controller';

const router = Router();
router.use(json({ type: ['application/json'] }));
router.use(userRouter);
router.use(prmRouter);
router.use(checkPermissions(Permissions.ManageUsers), positionRouter);
router.use(checkPermissions(Permissions.ManageUsers), teamRouter);

export { router as apiRouter };
