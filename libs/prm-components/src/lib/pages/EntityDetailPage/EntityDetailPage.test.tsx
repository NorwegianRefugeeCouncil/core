import { render } from '@testing-library/react';

import { EntityDetailPage } from './EntityDetailPage.component';
import {
  createEntityLoader,
  editEntityLoader,
  readEntityLoader,
} from './EntityDetailPage.loader';

describe('EntityDetailPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<EntityDetailPage />);
    expect(baseElement).toBeTruthy();
  });
});

describe('loaders', () => {
  describe('createEntityLoader', () => {
    it('should be truthy', () => {
      expect(createEntityLoader).toBeTruthy();
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
