import { Request, Response, NextFunction } from 'express';

import { getAuthorisationClient } from '@nrcno/core-authorisation';
import { Permissions } from '@nrcno/core-models';

export const checkPermissions =
  (permissions: Permissions[], every = true) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const authorisationClient = getAuthorisationClient();

    const checks = await Promise.all(
      permissions.map((p) =>
        req.user ? authorisationClient.permission.check(req.user.id, p) : false,
      ),
    );

    const success = every
      ? checks.every((check) => check)
      : checks.some((check) => check);

    if (success) {
      return next();
    }

    return res.status(403).send('Forbidden');
  };
