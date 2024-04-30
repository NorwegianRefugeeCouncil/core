import path from 'path';

import { config as dotenvConfig } from 'dotenv';

import { DeduplicationService } from '@nrcno/core-deduplication-engine';
import { getLogger } from '@nrcno/core-logger';
import { getDb } from '@nrcno/core-db';

import { NodeEnv, getServerConfig } from './config';

const run = async () => {
  // Load environment variables from .env file
  if (process.env.NODE_ENV !== NodeEnv.Production) {
    dotenvConfig();
  }
  // Set timezone to UTC
  process.env.TZ = 'UTC';

  // Initialise and get config
  const config = getServerConfig();

  const logger = getLogger(config.logLevel);

  // Initialise and get database connection
  const db = getDb(config.db);

  await db.seed.run({
    loadExtensions: ['.js'],
    directory: path.join(config.db.seedsDir, 'deduplication'),
  });

  logger.info('Database seed data has been inserted');

  logger.info('Starting duplicate calculation...');

  await DeduplicationService.compareAllParticipants();

  logger.info('Duplicate calculation complete');
  logger.info('Exiting...');

  process.exit(0);
};

run();
