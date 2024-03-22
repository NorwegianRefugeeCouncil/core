/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as path from 'path';

import express from 'express';

import { db } from '@nrcno/db';

import { welcomeRouter } from './controllers/welcome.controller';

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use('/api', welcomeRouter);

const port = process.env.PORT || 3333;
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
