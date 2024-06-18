import { EntityType } from '@nrcno/core-models';
import { render } from '@testing-library/react';
import axios from 'axios';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { PrmProvider } from '../../prm.context';

import { EntityListPage } from './EntityListPage.component';

const axiosInstance = axios.create();

describe('EntityListPage', () => {
  it('should render successfully', () => {
    const router = createMemoryRouter([
      {
        path: '/',
        element: (
          <PrmProvider
            axiosInstance={axiosInstance}
            entityType={EntityType.Individual}
            entityId={undefined}
          >
            <EntityListPage />
          </PrmProvider>
        ),
      },
    ]);
    const { baseElement } = render(<RouterProvider router={router} />);

    expect(baseElement).toBeTruthy();
    expect(baseElement.getElementsByTagName('h2')[0].textContent).toBe(
      'individuals',
    );
  });
});
