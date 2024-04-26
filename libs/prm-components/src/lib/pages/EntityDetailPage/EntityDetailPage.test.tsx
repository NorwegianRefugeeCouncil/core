import { vi, Mock } from 'vitest';
import { render } from '@testing-library/react';
import { useLoaderData } from 'react-router-dom';
import { EntityType } from '@nrcno/core-models';

import { EntityDetailPage } from './EntityDetailPage.component';
import {
  createEntityLoader,
  editEntityLoader,
  readEntityLoader,
} from './EntityDetailPage.loader';

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useLoaderData: vi.fn(),
}));

describe('EntityDetailPage', () => {
  it('should render successfully', () => {
    (useLoaderData as Mock).mockReturnValueOnce({
      entityType: EntityType.Participant,
      mode: 'create',
    });
    const { baseElement } = render(<EntityDetailPage />);
    expect(baseElement).toBeTruthy();
    expect(baseElement.getElementsByTagName('h2')[0].textContent).toBe(
      'New participants',
    );
  });
});

describe('loaders', () => {
  describe('createEntityLoader', () => {
    beforeAll(() => {
      (useLoaderData as Mock).mockReturnValue({
        entityType: EntityType.Participant,
        mode: 'create',
      });
    });

    afterAll(() => {
      (useLoaderData as Mock).mockReset();
    });

    it('should parse the entity type', () => {
      const result = createEntityLoader({
        request: new Request('http://localhost:3333/prm/participants/new'),
        params: { entityType: EntityType.Participant },
      });

      expect(result).toEqual({
        entityType: EntityType.Participant,
        mode: 'create',
      });
    });

    it('should throw a 404 error if the entity type is invalid', () => {
      try {
        createEntityLoader({
          request: new Request('http://localhost:3333/prm/participants/new'),
          params: { entityType: 'invalid' },
        });
      } catch (error) {
        if (!(error instanceof Response)) {
          throw error;
        }
        expect(error.status).toBe(404);
        expect(error.statusText).toBe('Not Found');
      }
    });
  });

  describe('editEntityLoader', () => {
    it('should be truthy', () => {
      expect(editEntityLoader).toBeTruthy();
    });
  });

  describe('readEntityLoader', () => {
    it('should be truthy', () => {
      expect(readEntityLoader).toBeTruthy();
    });
  });
});
