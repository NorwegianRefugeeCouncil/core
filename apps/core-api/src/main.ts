/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as fs from 'fs';
import * as path from 'path';

import { config as dotenvConfig } from 'dotenv';
import express from 'express';
import cors from 'cors';
import nocache from 'nocache';
import helmet from 'helmet';
import pinoHttp from 'pino-http';

import { getLogger } from '@nrcno/core-logger';
import { getDb } from '@nrcno/core-db';
import { getAuthorisationClient } from '@nrcno/core-authorisation';

import { scimRouter } from './controllers/scim.controller';
import { NodeEnv, getServerConfig } from './config';
import { apiRouter } from './controllers/api.controller';
import { healthzRouter } from './controllers/healthz.controller';
import { oidc, requireAuthentication } from './middleware/oidc.middleware';
import { errorHandler } from './middleware/error-handler.middleware';
import { limiter } from './middleware/rate-limiter.middleware';
import { session } from './middleware/session.middleware';

const startServer = async () => {
  // Load environment variables from .env file
  if (process.env.NODE_ENV !== NodeEnv.Production) {
    dotenvConfig();
  }
  // Set timezone to UTC
  process.env.TZ = 'UTC';

  // Initialise and get config
  const config = getServerConfig();

  const logger = getLogger(config.server.logLevel);

  if (config.server.bypassAuthentication) {
    logger.error(
      'DANGER: Bypassing authentication. This should only be used in development or test environments.',
    );
  }

  // Initialise and get database connection
  const db = getDb(config.db);

  // Initialise authorisation client
  const authorisationClient = getAuthorisationClient(
    config.authorisation.apiUrl,
  );
  await authorisationClient.init(config.authorisation.modelConfigPath);

  // Create Express server
  const app = express();

  // Configure http logger
  app.use(pinoHttp({ logger, useLevel: config.server.requestLogLevel }));

  // Resolve ip when behind load balancer
  if (config.isRunningInProductionEnvironment) {
    app.set('trust proxy', 3);
  }

  // Configure headers
  app.use(helmet());
  app.disable('x-powered-by');

  // Rate limiter
  // app.use(limiter());

  // CORS
  app.use(cors());

  // Session
  app.use(session());

  // Authentication
  app.use(oidc());

  // Routes
  app.use('/healthz', nocache(), healthzRouter);
  app.use('/scim/v2', nocache(), scimRouter);
  app.use('/api', [nocache(), requireAuthentication], apiRouter);

  // Serve static files
  app.use(express.static(path.join(__dirname, 'static')));

  // Serve index.html for all other routes, to support client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
  });

  // Handle errors after everything else
  app.use(errorHandler);

  // Start server
  const port = config.server.port;
  const server = app.listen(port, async () => {
    logger.info(`Listening at http://localhost:${port}/api`);

    await db.migrate.latest({
      loadExtensions: ['.js'],
      directory: config.db.migrationsDir,
    });

    logger.info('Database migrations have been run');

    const commonSeedPath = path.join(config.db.seedsDir, 'common');
    if (!fs.existsSync(commonSeedPath)) {
      throw new Error('Could not find common seeds');
    }
    await db.seed.run({
      loadExtensions: ['.js'],
      directory: commonSeedPath,
    });

    const envSeedPath = path.join(config.db.seedsDir, config.environment);
    if (fs.existsSync(envSeedPath)) {
      await db.seed.run({
        loadExtensions: ['.js'],
        directory: envSeedPath,
      });
    }

    logger.info('Database seed data has been inserted');
  });

  server.on('error', logger.error);

  async function shutdown() {
    logger.info('Shutting down server...');

    try {
      await db.destroy();
      logger.info('Database connection closed');
    } catch (err) {
      logger.error('Error while closing database connection:', err);
    }

    server.close(() => {
      logger.info('Server stopped');
    });
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

startServer().catch((err) => {
  console.error('Error while starting server:', err);
  process.exit(1);
});
