import { EntityType } from '@nrcno/core-models';
import { render } from '@testing-library/react';
import axios from 'axios';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '@nrcno/core-theme';

import { PrmProvider } from '../../prm.context';

import { EntityListPage } from './EntityListPage.component';

const axiosInstance = axios.create();

describe('EntityListPage', () => {
  it('should render successfully', () => {
    const router = createMemoryRouter([
      {
        path: '/',
        element: (
          <ChakraProvider theme={theme}>
            <PrmProvider
              axiosInstance={axiosInstance}
              entityType={EntityType.Individual}
              entityId={undefined}
            >
              <EntityListPage />
            </PrmProvider>
          </ChakraProvider>
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
