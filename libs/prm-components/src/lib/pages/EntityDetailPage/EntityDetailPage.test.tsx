import { render } from '@testing-library/react';
import { EntityType } from '@nrcno/core-models';
import axios from 'axios';
import {
  MemoryRouter,
  RouterProvider,
  createMemoryRouter,
} from 'react-router-dom';

import { PrmProvider } from '../../prm.context';

import { EntityDetailPage } from './EntityDetailPage.component';

const axiosInstance = axios.create();

describe('EntityDetailPage', () => {
  it('should render successfully', () => {
    const router = createMemoryRouter([
      {
        path: '/',
        element: (
          <PrmProvider
            axiosInstance={axiosInstance}
            entityType={EntityType.Participant}
            entityId={undefined}
          >
            <EntityDetailPage mode="create" />
          </PrmProvider>
        ),
      },
    ]);
    const { baseElement } = render(<RouterProvider router={router} />);
    expect(baseElement).toBeTruthy();
    expect(baseElement.getElementsByTagName('h2')[0].textContent).toBe(
      'New participants',
    );
  });
});
