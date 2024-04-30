import { createBrowserRouter } from 'react-router-dom';
import { ExistingDuplicates } from '@nrcno/core-deduplication-components';

import { EntityDetailPage, EntityListPage } from '@nrcno/core-prm-components';

import { App } from './app';
import { ApiProvider } from './components/ApiProvider.component';

export const router = createBrowserRouter([
  {
    element: <ApiProvider />,
    errorElement: <div>Placeholder error page</div>,
    children: [
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
            element: <EntityListPage />,
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
          {
            path: '/deduplication',
            element: <ExistingDuplicates />,
          },
        ],
      },
    ],
  },
]);
