import { createBrowserRouter } from 'react-router-dom';

import { EntityDetailPage } from '@nrcno/core-prm-components';

import { App } from './app';
import { ApiProvider } from './components/ApiProvider.component';

export const router = createBrowserRouter([
  {
    element: <ApiProvider />,
    children: [
      {
        path: '/',
        element: <App />,
        errorElement: <div>Placeholder error page</div>,
        children: [
          {
            path: '/',
            element: <div>Home</div>,
          },
          {
            path: '/prm',
            element: <div>PRM</div>,
          },
          {
            path: '/prm/:entityType',
            element: <div>Entity list</div>,
          },
          {
            path: '/prm/:entityType/new',
            element: <EntityDetailPage mode="create" />,
          },
          {
            path: '/prm/:entityType/:entityId',
            element: <EntityDetailPage mode="read" />,
          },
          {
            path: '/prm/:entityType/:entityId/edit',
            element: <EntityDetailPage mode="edit" />,
          },
          {
            path: '/users',
            element: <div>User</div>,
          },
        ],
      },
    ],
  },
]);
