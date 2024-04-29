import { render, renderHook } from '@testing-library/react';
import axios, { AxiosInstance } from 'axios';
import { EntityType } from '@nrcno/core-models';

import { PrmProvider, usePrmContext } from './prm.context';
import { SubmitStatus } from './hooks/useApiReducer.hook';

describe('PrmProvider', () => {
  let axiosInstance: AxiosInstance;

  beforeAll(() => {
    axiosInstance = axios.create();
  });

  test('renders children', () => {
    const { getByText } = render(
      <PrmProvider
        axiosInstance={axiosInstance}
        entityType={EntityType.Participant}
        entityId={undefined}
      >
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
      <PrmProvider
        axiosInstance={axiosInstance}
        entityType={EntityType.Participant}
        entityId={undefined}
      >
        {children}
      </PrmProvider>
    );

    const { result } = renderHook(() => usePrmContext(), {
      wrapper,
    });

    expect(result.current).toEqual({
      entityType: EntityType.Participant,
      entityId: undefined,
      create: {
        onCreateEntity: expect.any(Function),
        status: SubmitStatus.IDLE,
        data: undefined,
        error: undefined,
      },
      read: {
        data: undefined,
        error: undefined,
        status: SubmitStatus.IDLE,
        loadEntity: expect.any(Function),
      },
      edit: {
        onEditEntity: expect.any(Function),
        status: SubmitStatus.IDLE,
        data: undefined,
        error: undefined,
      },
    });
  });
});
