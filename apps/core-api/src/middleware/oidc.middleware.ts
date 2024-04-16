import { Router, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as OidcStrategy } from 'passport-openidconnect';

import * as UserService from '../services/user.service';
import { getServerConfig } from '../config';

export const oidc = () => {
  const config = getServerConfig();

  const router = Router();

  router.use(
    session({
      secret: config.session.secret,
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false },
    }),
  );

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
      (issuer: any, profile: any, done: any) => {
        const user = UserService.getByOidcId(profile.id);
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
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/login');
  }
};
