/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as path from 'path';

import { config as dotenvConfig } from 'dotenv';
import express from 'express';
import { rateLimit } from 'express-rate-limit';

import { db } from '@nrcno/db';

import { welcomeRouter } from './controllers/welcome.controller';
import { scimRouter } from './controllers/scim.controller';

// Load environment variables from .env file
dotenvConfig();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false,
  message: 'Too many requests',
});

const app = express();
app.use(express.json());

app.use(limiter);

app.use('/api', welcomeRouter);
app.use('/scim/v2', scimRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

app.use(express.static(path.join(__dirname, 'static')));

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
