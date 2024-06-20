import { render } from '@testing-library/react';
import { EntityType } from '@nrcno/core-models';
import { theme } from '@nrcno/core-theme';
import axios from 'axios';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';

import { PrmProvider } from '../../prm.context';

import { EntityDetailPage } from './EntityDetailPage.component';

const axiosInstance = axios.create();

describe('EntityDetailPage', () => {
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
              <EntityDetailPage mode="create" />
            </PrmProvider>
          </ChakraProvider>
        ),
      },
    ]);
    const { baseElement } = render(<RouterProvider router={router} />);
    expect(baseElement).toBeTruthy();
    expect(baseElement.getElementsByTagName('h2')[0].textContent).toBe(
      'New individuals',
    );
  });
});
