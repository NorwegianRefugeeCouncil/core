import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { CookiesProvider } from 'react-cookie';

import { ApiProvider } from './contexts';
import { App } from './app/app';
import { theme } from './assets/styles/theme';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <BrowserRouter>
      <ApiProvider>
        <ConfigProvider theme={{ ...theme, hashed: false }}>
          <CookiesProvider
            defaultSetOptions={{
              path: '/',
              domain: 'localhost',
              secure: false,
            }}
          >
            <App />
          </CookiesProvider>
        </ConfigProvider>
      </ApiProvider>
    </BrowserRouter>
  </StrictMode>,
);
