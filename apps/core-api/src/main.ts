/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as path from 'path';

import { config as dotenvConfig } from 'dotenv';
import express from 'express';

import { getDb } from '@nrcno/db';

import { scimRouter } from './controllers/scim.controller';
import { getServerConfig } from './config';
import { limiter } from './middleware/rate-limiter.middleware';
import { authorise } from './middleware/authorisation';

// Load environment variables from .env file
if (process.env.NODE_ENV !== 'production') {
  dotenvConfig();
}

const app = express();

app.use(limiter);

const config = getServerConfig();

app.use('/scim/v2', scimRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

app.use(express.static(path.join(__dirname, 'static')));

const db = getDb(config.db);

const port = config.server.port;

const server = app.listen(port, async () => {
  console.log(`Listening at http://localhost:${port}/api`);

  if (
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'test'
  ) {
    // For other environments migrations are run as part of the deployment process
    await db.migrate.latest({ loadExtensions: ['.js'] });
    console.log('Database migrations have been run');
  }
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
