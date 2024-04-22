import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';

import { ApiProvider } from './contexts';
import { theme } from './assets/styles/theme';
import { router } from './routes';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <ApiProvider>
      <ConfigProvider theme={{ ...theme, hashed: false }}>
        <RouterProvider router={router} />
      </ConfigProvider>
    </ApiProvider>
  </StrictMode>,
);
