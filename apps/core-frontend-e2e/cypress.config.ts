import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';

import { defineConfig } from 'cypress';

export default defineConfig({
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
