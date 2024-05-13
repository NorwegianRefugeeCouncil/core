import { EntityType } from '@nrcno/core-models';
import { render } from '@testing-library/react';
import axios from 'axios';

import { PrmProvider } from '../../prm.context';

import { EntityListPage } from './EntityListPage.component';

const axiosInstance = axios.create();

describe('EntityListPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <PrmProvider
        axiosInstance={axiosInstance}
        entityType={EntityType.Participant}
        entityId={undefined}
      >
        <EntityListPage />
      </PrmProvider>,
    );
    expect(baseElement).toBeTruthy();
    expect(baseElement.getElementsByTagName('h2')[0].textContent).toBe(
      'participants',
    );
  });
});
