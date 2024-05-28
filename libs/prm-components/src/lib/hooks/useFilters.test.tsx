import { renderHook } from '@testing-library/react-hooks';
import { MemoryRouter } from 'react-router-dom';

import { useFilters } from './useFilters';

const renderHookOptions = {
  wrapper: ({ children }: { children: any }) => (
    <MemoryRouter>{children}</MemoryRouter>
  ),
};
describe('useFilters', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useFilters(), renderHookOptions);

    expect(result.current.filters).toEqual({});
  });
});
