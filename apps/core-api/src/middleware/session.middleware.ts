import expressSession from 'express-session';
import KnexSessionStore from 'connect-session-knex';

import { getDb } from '@nrcno/core-db';

import { getServerConfig } from '../config';

export const session = () => {
  const config = getServerConfig();
  const db = getDb();

  const store = new (KnexSessionStore(expressSession))({
    knex: db,
    tablename: 'sessions',
  });

  return expressSession({
    store,
    secret: config.session.secret,
    resave: false,
    proxy: config.isDeployed ? true : false,
    name: `core-session-${config.environment}`,
    saveUninitialized: true,
    cookie: {
      secure: config.isDeployed,
      httpOnly: config.isDeployed,
      sameSite: config.isDeployed ? 'none' : undefined,
    },
  });
};
