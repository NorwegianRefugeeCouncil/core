import { render } from '@testing-library/react';

import PrmComponents from './prm-components';

describe('PrmComponents', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PrmComponents />);
    expect(baseElement).toBeTruthy();
  });
});
