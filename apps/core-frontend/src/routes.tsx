import { createBrowserRouter } from 'react-router-dom';

import {
  PermissionGate,
  PositionDetailPage,
  PositionListPage,
  TeamDetailPage,
  TeamListPage,
  UserListPage,
  withPermissionGate,
} from '@nrcno/core-user-components';
import { EntityDetailPage, EntityListPage } from '@nrcno/core-prm-components';
import { Permissions } from '@nrcno/core-models';

import { App } from './app';
import { ApiProvider } from './components/ApiProvider.component';
import { DeveloperTools } from './components/DeveloperTools.component';

const AuthorisedPositionDetailPage = withPermissionGate([
  Permissions.ManageUsers,
])(PositionDetailPage);
const AuthorisedPositionListPage = withPermissionGate([
  Permissions.ManageUsers,
])(PositionListPage);
const AuthorisedTeamDetailPage = withPermissionGate([Permissions.ManageUsers])(
  TeamDetailPage,
);
const AuthorisedTeamListPage = withPermissionGate([Permissions.ManageUsers])(
  TeamListPage,
);
const AuthorisedUserListPage = withPermissionGate([Permissions.ManageUsers])(
  UserListPage,
);

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
            path: '/developer-tools',
            element: <DeveloperTools />,
          },
          {
            path: '/prm',
            element: <div>PRM</div>,
          },
          {
            path: '/prm/:entityType',
            element: (
              <PermissionGate
                permissions={[Permissions.ViewProgrammeData]}
                every={false}
              >
                <EntityListPage />
              </PermissionGate>
            ),
          },
          {
            path: '/prm/:entityType/new',
            element: (
              <PermissionGate
                permissions={[Permissions.EditProgrammeData]}
                every={false}
              >
                <EntityDetailPage mode="create" />
              </PermissionGate>
            ),
          },
          {
            path: '/prm/:entityType/:entityId',
            element: (
              <PermissionGate
                permissions={[Permissions.ViewProgrammeData]}
                every={false}
              >
                <EntityDetailPage mode="read" />
              </PermissionGate>
            ),
          },
          {
            path: '/prm/:entityType/:entityId/edit',
            element: (
              <PermissionGate
                permissions={[
                  Permissions.EditProgrammeData,
                  Permissions.DeleteProgrammeData,
                ]}
                every={false}
              >
                <EntityDetailPage mode="edit" />
              </PermissionGate>
            ),
          },
          {
            path: '/admin/users',
            element: <AuthorisedUserListPage />,
          },
          {
            path: '/admin/positions',
            element: <AuthorisedPositionListPage />,
          },
          {
            path: '/admin/positions/new',
            element: <AuthorisedPositionDetailPage mode="create" />,
          },
          {
            path: '/admin/positions/:positionId',
            element: <AuthorisedPositionDetailPage mode="read" />,
          },
          {
            path: '/admin/positions/:positionId/edit',
            element: <AuthorisedPositionDetailPage mode="edit" />,
          },
          {
            path: '/admin/teams',
            element: <AuthorisedTeamListPage />,
          },
          {
            path: '/admin/teams/new',
            element: <AuthorisedTeamDetailPage mode="create" />,
          },
          {
            path: '/admin/teams/:teamId',
            element: <AuthorisedTeamDetailPage mode="read" />,
          },
          {
            path: '/admin/teams/:teamId/edit',
            element: <AuthorisedTeamDetailPage mode="edit" />,
          },
        ],
      },
    ],
  },
]);
