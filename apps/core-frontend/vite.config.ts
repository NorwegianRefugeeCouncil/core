/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

const extensions = [
  '.web.tsx',
  '.tsx',
  '.web.ts',
  '.ts',
  '.web.jsx',
  '.jsx',
  '.web.js',
  '.js',
  '.css',
  '.json',
  '.mjs',
];

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/core-frontend',

  server: {
    port: 4200,
    host: 'localhost',
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [react(), nxViteTsPaths()],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  build: {
    outDir: './dist',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    // rollupOptions: {
    //   external: [
    //     'react',
    //     'jsx-runtime',
    //     'react-dom',
    //     'react-native',
    //     'react-native-svg',
    //     // "react/jsx-runtime",
    //   ],
    //   output: {
    //     globals: {
    //       react: 'React',
    //       'jsx-runtime': 'jsxRuntime',
    //       'react-native': 'ReactNative',
    //       'react-dom': 'ReactDOM',
    //     },
    //   },
    // },
  },

  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/core-frontend',
      provider: 'v8',
    },
  },

  resolve: {
    extensions: extensions,
    alias: {
      'react-native': 'react-native-web',
    },
  },

  optimizeDeps: {
    esbuildOptions: {
      resolveExtensions: extensions,
      jsx: 'automatic',
      loader: { '.js': 'jsx' },
    },
  },
});
