const { nxE2EPreset } = require('@nx/cypress/plugins/cypress-preset');

const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'src',
      bundler: 'vite',
      webServerCommands: {
        default: 'nx run core-frontend:serve',
        production: 'nx run core-frontend:preview',
      },
      ciWebServerCommand: 'nx run core-frontend:serve-static',
    }),
    baseUrl: 'http://localhost:4200',
  },
});