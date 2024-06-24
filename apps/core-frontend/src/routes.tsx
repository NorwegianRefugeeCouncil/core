import { createBrowserRouter, useParams } from 'react-router-dom';

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
            Component: () => {
              const { entityType } = useParams();
              return <EntityListPage key={`entity-list-${entityType}`} />;
            },
          },
          {
            path: '/prm/:entityType/new',
            Component: () => {
              const { entityType } = useParams();
              return (
                <EntityDetailPage
                  key={`entity-detail-${entityType}`}
                  mode="create"
                />
              );
            },
          },
          {
            path: '/prm/:entityType/:entityId',
            Component: () => {
              const { entityType, entityId } = useParams();
              return (
                <EntityDetailPage
                  key={`entity-detail-${entityType}-${entityId}`}
                  mode="read"
                />
              );
            },
          },
          {
            path: '/prm/:entityType/:entityId/edit',
            Component: () => {
              const { entityType, entityId } = useParams();
              return (
                <EntityDetailPage
                  key={`entity-detail-${entityType}-${entityId}`}
                  mode="edit"
                />
              );
            },
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
