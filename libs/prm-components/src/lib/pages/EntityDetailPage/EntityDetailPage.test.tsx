import { render } from '@testing-library/react';
import { EntityType } from '@nrcno/core-models';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';

import { PrmProvider } from '../../prm.context';

import { EntityDetailPage } from './EntityDetailPage.component';

const axiosInstance = axios.create();

describe('EntityDetailPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <MemoryRouter>
        <PrmProvider
          axiosInstance={axiosInstance}
          entityType={EntityType.Participant}
          entityId={undefined}
        >
          <EntityDetailPage mode="create" />
        </PrmProvider>
      </MemoryRouter>,
    );
    expect(baseElement).toBeTruthy();
    expect(baseElement.getElementsByTagName('h2')[0].textContent).toBe(
      'New participants',
    );
  });
});
