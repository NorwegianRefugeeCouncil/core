import { render, renderHook } from '@testing-library/react';
import axios, { AxiosInstance } from 'axios';

import { PrmProvider, usePrmContext } from './prm.context';
import { SubmitStatus } from './types';

describe('PrmProvider', () => {
  let axiosInstance: AxiosInstance;

  beforeAll(() => {
    axiosInstance = axios.create();
  });

  test('renders children', () => {
    const { getByText } = render(
      <PrmProvider axiosInstance={axiosInstance}>
        <div>Test Children</div>
      </PrmProvider>,
    );

    expect(getByText('Test Children')).toBeTruthy();
  });
});

describe('usePrmContext', () => {
  let axiosInstance: AxiosInstance;

  beforeAll(() => {
    axiosInstance = axios.create();
  });

  test('returns default create state', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PrmProvider axiosInstance={axiosInstance}>{children}</PrmProvider>
    );

    const { result } = renderHook(() => usePrmContext(), {
      wrapper,
    });

    expect(result.current).toEqual({
      create: {
        onCreateEntity: expect.any(Function),
        status: SubmitStatus.IDLE,
        data: undefined,
        error: undefined,
      },
    });
  });
});
