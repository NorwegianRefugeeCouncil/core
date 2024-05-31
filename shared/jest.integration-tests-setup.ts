import { config as dotenvConfig } from 'dotenv';
import { DockerComposeEnvironment, Wait } from 'testcontainers';
import { registerTsProject } from '@nx/js/src/internal';
const cleanupRegisteredPaths = registerTsProject('./tsconfig.base.json');

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

  // Pass the environment to global teardown
  (global as any).__ENVIRONMENT__ = environment;

  // Hint: Use `globalThis` to pass variables to global teardown.
  (globalThis as any).__TEARDOWN_MESSAGE__ = '\nTearing down...\n';
}

cleanupRegisteredPaths();
