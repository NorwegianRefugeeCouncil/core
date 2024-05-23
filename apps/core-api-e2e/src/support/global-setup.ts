/* eslint-disable */
import { spawn } from 'child_process';

import { config as dotenvConfig } from 'dotenv';
import waitOn from 'wait-on';
import { DockerComposeEnvironment, Wait } from 'testcontainers';

module.exports = async function () {
  // Start services that the app needs to run (e.g. database, docker-compose, etc.).
  console.log('\nSetting up...\n');

  dotenvConfig();

  // Start the Docker Compose environment with all the server dependencies
  console.log('Starting Docker Compose environment...');
  const composeFilePath = './deploy/local/';
  const composeFile = 'docker-compose.yaml';
  (global as any).__ENVIRONMENT__ = await new DockerComposeEnvironment(
    composeFilePath,
    composeFile,
  )
    .withWaitStrategy(
      'db',
      Wait.forLogMessage('database system is ready to accept connections'),
    )
    .withStartupTimeout(120 * 1000)
    .up();

  console.log('Starting the server...');
  const server = spawn('nx', ['run', 'core-api:serve'], {
    detached: true,
  });
  server.stdout.pipe(process.stdout);
  server.stderr.pipe(process.stderr);

  (global as any).__SERVER__ = server;

  console.log('Waiting for the server to be ready...');
  await waitOn({
    resources: ['http-get://localhost:3333/healthz'],
    timeout: 30000,
  });
  console.log('Server is ready!');

  // Hint: Use `globalThis` to pass variables to global teardown.
  (globalThis as any).__TEARDOWN_MESSAGE__ = '\nTearing down...\n';
};
