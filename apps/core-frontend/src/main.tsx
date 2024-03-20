import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { NativeBaseProvider, theme } from '@nrcno/nrc-design-system';

import App from './app/app';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <NativeBaseProvider theme={theme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </NativeBaseProvider>
  </StrictMode>,
);
