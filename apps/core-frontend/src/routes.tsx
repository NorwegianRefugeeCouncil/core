import { createBrowserRouter } from 'react-router-dom';

import { EntityDetailPage } from '@nrcno/core-prm-components';

import { App } from './app';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
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
        element: <EntityDetailPage />,
      },
      {
        path: '/prm/:entityType/:entityId',
        element: <EntityDetailPage />,
      },
      {
        path: '/prm/:entityType/:entityId/edit',
        element: <EntityDetailPage />,
      },
      {
        path: '/user',
        element: <div>User</div>,
      },
    ],
  },
]);
