/* eslint-disable */

module.exports = async function () {
  // Put clean up logic here (e.g. stopping services, docker-compose, etc.).
  // Hint: `globalThis` is shared between setup and teardown.
  console.log((globalThis as any).__TEARDOWN_MESSAGE__);

  // Stop the server
  if ((global as any).__SERVER__) {
    console.log('Stopping the server...');
    process.kill(-(global as any).__SERVER__.pid);
  }

  // Stop and remove the Docker Compose containers
  if ((global as any).__ENVIRONMENT__) {
    console.log('Stopping Docker Compose environment...');
    await (global as any).__ENVIRONMENT__.down();
  }
};
