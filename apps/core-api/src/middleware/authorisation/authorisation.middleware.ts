import { Request, Response, NextFunction } from 'express';
import { expressjwt } from 'express-jwt';
import { expressJwtSecret, GetVerificationKey } from 'jwks-rsa';

import { ServerConfig } from '../../config';
import { UserSchema } from '../../models/user.model';

export const checkJwt = (config: ServerConfig) =>
  expressjwt({
    secret: expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: config.oidc.jwksUri,
    }) as GetVerificationKey,
    audience: config.oidc.audience,
    issuer: config.oidc.issuer,
    algorithms: ['RS256'],
  });

// TODO: Load user from database once User store is implemented
export const preloadUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.auth) {
    req.user = req.auth.sub;
    const user = UserSchema.parse({
      id: req.auth.sub,
      oktaId: 'test',
      userName: 'test',
      firstName: 'test',
      lastName: 'test',
      displayName: 'test',
      emails: [],
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    if (user) {
      req.user = user;
    } else {
      res.sendStatus(401);
    }
  } else {
    res.sendStatus(401);
  }
  next();
};

export const authorise = (config: ServerConfig) =>
  [checkJwt(config), preloadUser].reduce((previous, current) => {
    return (req: Request, res: Response, next: NextFunction) => {
      previous(req, res, (err: any) => {
        if (err) {
          return next(err);
        }
        current(req, res, next);
      });
    };
  });
