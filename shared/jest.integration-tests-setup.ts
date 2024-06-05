import { config as dotenvConfig } from 'dotenv';
import * as path from 'path';
import { DockerComposeEnvironment, Wait } from 'testcontainers';
import { registerTsProject } from '@nx/js/src/internal';
const cleanupRegisteredPaths = registerTsProject('./tsconfig.base.json');

import { getDb } from '@nrcno/core-db';

export default async function () {
  // Start services that the app needs to run (e.g. database, docker-compose, etc.).
  console.log('\nSetting up...\n');

  dotenvConfig();

  // Start the Docker Compose environment with all the server dependencies
  console.log('Starting Docker Compose environment...');
  const composeFilePath = './deploy/local/';
  const composeFile = 'docker-compose.yaml';
  const environment = await new DockerComposeEnvironment(
    composeFilePath,
    composeFile,
  )
    .withWaitStrategy('db', Wait.forHealthCheck())
    .withStartupTimeout(120 * 1000)
    .up();

  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };
  const db = getDb(config);
  await db.migrate.latest({
    loadExtensions: ['.js'],
  });
  await db.seed.run({
    loadExtensions: ['.js'],
    directory: path.join(db.client.config.seeds.directory, 'common'),
  });

  // Pass the environment to global teardown
  (global as any).__ENVIRONMENT__ = environment;

  // Hint: Use `globalThis` to pass variables to global teardown.
  (globalThis as any).__TEARDOWN_MESSAGE__ = '\nTearing down...\n';
}

cleanupRegisteredPaths();
