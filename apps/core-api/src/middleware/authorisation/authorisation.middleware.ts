import { Request, Response, NextFunction } from 'express';
import { expressjwt } from 'express-jwt';
import { expressJwtSecret, GetVerificationKey } from 'jwks-rsa';

import { UserSchema } from '@nrcno/core-models';

import { ServerConfig } from '../../config';
import * as UserService from '../../services/user.service';

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

export const preloadUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.auth) {
    const user = await UserService.get(req.auth.sub);
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

export const authorise = (config: ServerConfig) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    checkJwt(config)(req, res, (err) => {
      if (err) {
        next(err);
      } else {
        preloadUser(req, res, next);
      }
    });
  };
};
