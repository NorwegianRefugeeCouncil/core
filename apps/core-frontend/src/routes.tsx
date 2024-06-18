import { createBrowserRouter } from 'react-router-dom';
import {
  PositionDetailPage,
  PositionListPage,
  TeamDetailPage,
  TeamListPage,
  UserListPage,
} from '@nrcno/core-user-components';

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
            path: '/admin/users',
            element: <UserListPage />,
          },
          {
            path: '/admin/positions',
            element: <PositionListPage />,
          },
          {
            path: '/admin/positions/new',
            element: <PositionDetailPage mode="create" />,
          },
          {
            path: '/admin/positions/:positionId',
            element: <PositionDetailPage mode="read" />,
          },
          {
            path: '/admin/positions/:positionId/edit',
            element: <PositionDetailPage mode="edit" />,
          },
          {
            path: '/admin/teams',
            element: <TeamListPage />,
          },
          {
            path: '/admin/teams/new',
            element: <TeamDetailPage mode="create" />,
          },
          {
            path: '/admin/teams/:teamId',
            element: <TeamDetailPage mode="read" />,
          },
          {
            path: '/admin/teams/:teamId/edit',
            element: <TeamDetailPage mode="edit" />,
          },
        ],
      },
    ],
  },
]);
