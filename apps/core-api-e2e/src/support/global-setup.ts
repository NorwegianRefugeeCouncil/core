/* eslint-disable */
import { spawn } from 'child_process';

import { config as dotenvConfig } from 'dotenv';
import waitOn from 'wait-on';
import { DockerComposeEnvironment } from 'testcontainers';

var __TEARDOWN_MESSAGE__: string;

module.exports = async function () {
  // Start services that the app needs to run (e.g. database, docker-compose, etc.).
  console.log('\nSetting up...\n');

  dotenvConfig();

  // Start the Docker Compose environment with all the server dependencies
  console.log('Starting Docker Compose environment...');
  const composeFilePath = '../../deploy/local/';
  const composeFile = 'docker-compose.yaml';
  (global as any).__ENVIRONMENT__ = await new DockerComposeEnvironment(
    composeFilePath,
    composeFile,
  ).up();

  // Start the server
  console.log('Starting the server...');
  (global as any).__SERVER__ = spawn('nx', ['run', 'core-api:serve'], {
    detached: true,
  });
  // Wait for the server to be ready
  console.log('Waiting for the server to be ready...');
  await waitOn({
    resources: ['http-get://localhost:3333/healthz'],
    timeout: 30000,
  });

  // Hint: Use `globalThis` to pass variables to global teardown.
  (globalThis as any).__TEARDOWN_MESSAGE__ = '\nTearing down...\n';
};
