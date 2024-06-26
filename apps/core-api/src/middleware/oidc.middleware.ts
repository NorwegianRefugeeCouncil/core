import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as OidcStrategy } from 'passport-openidconnect';

import { getLogger } from '@nrcno/core-logger';

import * as UserService from '../services/user.service';
import { getServerConfig } from '../config';

export const oidc = () => {
  const config = getServerConfig();

  const router = Router();

  router.use(passport.initialize());
  router.use(passport.session());

  passport.use(
    'oidc',
    new OidcStrategy(
      {
        issuer: config.oidc.issuer,
        authorizationURL: config.oidc.authorizationURL,
        tokenURL: config.oidc.tokenURL,
        userInfoURL: config.oidc.userInfoURL,
        callbackURL: config.oidc.callbackURL,
        clientID: config.oidc.clientId,
        clientSecret: config.oidc.clientSecret,
        scope: config.oidc.scope,
      },
      async (issuer: any, profile: any, done: any) => {
        const user = await UserService.getByOidcId(profile.id);
        return done(null, user || profile);
      },
    ),
  );

  passport.serializeUser((user, next) => {
    next(null, user);
  });

  passport.deserializeUser((obj: any, next) => {
    next(null, obj);
  });

  router.use(
    '/authorization-code/callback',
    passport.authenticate('oidc', { failureRedirect: '/authorization-error' }),
    (req, res, next) => {
      res.redirect('/');
    },
  );

  router.use('/login', passport.authenticate('oidc'));

  router.get('/logout', (req: any, res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
  });

  router.get('/authorization-error', (req, res) => {
    res.status(401).send('Authorization error');
  });

  return router;
};

export const requireAuthentication = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const config = getServerConfig();
  const logger = getLogger();
  // DANGER
  // TODO: Figure out authentication for e2e tests and local dev
  if (config.server.bypassAuthentication) {
    logger.error(
      'DANGER: Bypassing authentication. This should only be used in development or test environments.',
    );
    const userList = await UserService.list(0, 1);
    if (userList.length === 0) {
      throw new Error('No users found in the database');
    }
    req.user = userList[0];
    next();
  } else if (req.isAuthenticated()) {
    next();
  } else {
    res.sendStatus(401);
  }
};
