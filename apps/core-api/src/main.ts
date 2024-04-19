/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as path from 'path';

import { config as dotenvConfig } from 'dotenv';
import express from 'express';
import cors from 'cors';
import nocache from 'nocache';

import { getDb } from '@nrcno/core-db';

import { scimRouter } from './controllers/scim.controller';
import { getServerConfig } from './config';
import { apiRouter } from './controllers/api.controller';
import { healthzRouter } from './controllers/healthz.controller';
import { oidc, requireAuthentication } from './middleware/oidc.middleware';
import { errorHandler } from './middleware/error-handler.middleware';
import { limiter } from './middleware/rate-limiter.middleware';

// Load environment variables from .env file
if (process.env.NODE_ENV !== 'production') {
  dotenvConfig();
}

const config = getServerConfig();

if (config.server.bypassAuthentication) {
  console.error(
    'DANGER: Bypassing authentication. This should only be used in development or test environments.',
  );
}

const app = express();

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 3);
}

// app.use(limiter);
app.use(cors());
app.use(oidc());

app.use('/healthz', nocache(), healthzRouter);
app.use('/scim/v2', nocache(), scimRouter);
app.use('/api', [nocache(), requireAuthentication], apiRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

app.use(express.static(path.join(__dirname, 'static')));

app.use(errorHandler);

const db = getDb(config.db);

const port = config.server.port;

const server = app.listen(port, async () => {
  console.log(`Listening at http://localhost:${port}/api`);

  await db.migrate.latest({
    loadExtensions: ['.js'],
    directory: config.db.migrationsDir,
  });

  console.log('Database migrations have been run');

  await db.seed.run({
    loadExtensions: ['.js'],
    directory: path.join(config.db.seedsDir, 'common'),
  });

  await db.seed.run({
    loadExtensions: ['.js'],
    // directory: path.join(config.db.seedsDir, config.environment),
    directory: path.join(config.db.seedsDir, 'local'),
  });

  console.log('Database seeds have been run');
});

server.on('error', console.error);

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

async function shutdown() {
  console.log('Shutting down server...');

  try {
    await db.destroy();
    console.log('Database connection closed');
  } catch (err) {
    console.error('Error while closing database connection:', err);
  }

  server.close(() => {
    console.log('Server stopped');
  });
}
