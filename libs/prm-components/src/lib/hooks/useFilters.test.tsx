import { renderHook, act } from '@testing-library/react-hooks';
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

  it('should apply defined filter values', () => {
    const { result } = renderHook(() => useFilters(), renderHookOptions);

    act(() => {
      result.current.applyFilters({ firstName: 'John', middleName: undefined });
    });

    expect(result.current.filters).toEqual({ firstName: 'John' });
  });

  it('should delete individual filters', () => {
    const { result } = renderHook(() => useFilters(), renderHookOptions);

    act(() => {
      result.current.applyFilters({ firstName: 'John', middleName: 'Bob' });
    });

    expect(result.current.filters).toEqual({
      firstName: 'John',
      middleName: 'Bob',
    });
    act(() => {
      result.current.deleteFilter('firstName');
    });

    expect(result.current.filters).toEqual({ middleName: 'Bob' });
  });

  it('should clear all filters', () => {
    const { result } = renderHook(() => useFilters(), renderHookOptions);

    act(() => {
      result.current.applyFilters({ firstName: 'John', middleName: 'Bob' });
    });

    expect(result.current.filters).toEqual({
      firstName: 'John',
      middleName: 'Bob',
    });
    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filters).toEqual({});
  });
});
