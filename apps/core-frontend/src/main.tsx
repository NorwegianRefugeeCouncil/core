import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';

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
          <App />
        </ConfigProvider>
      </ApiProvider>
    </BrowserRouter>
  </StrictMode>,
);
