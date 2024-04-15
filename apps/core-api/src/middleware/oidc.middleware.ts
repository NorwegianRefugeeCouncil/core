import { Router } from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy } from 'passport-openidconnect';

import { getServerConfig } from '../config';

export const oidc = () => {
  const config = getServerConfig();

  const app = Router();

  app.use(
    session({
      secret: config.session.secret,
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    'oidc',
    new Strategy(
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
        return done(null, profile);
      },
    ),
  );

  passport.serializeUser((user, next) => {
    next(null, user);
  });

  passport.deserializeUser((obj: any, next) => {
    next(null, obj);
  });

  app.use(
    '/authorization-code/callback',
    passport.authenticate('oidc', { failureRedirect: '/authorization-error' }),
    (req, res, next) => {
      res.redirect('/');
    },
  );

  app.use('/login', passport.authenticate('oidc'));

  app.get('/logout', (req: any, res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
  });

  app.get('/authorization-error', (req, res) => {
    res.status(401).send('Authorization error');
  });

  return app;
};
