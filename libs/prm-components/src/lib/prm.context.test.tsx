import { render, renderHook } from '@testing-library/react';
import axios, { AxiosInstance } from 'axios';
import { EntityType } from '@nrcno/core-models';

import { PrmProvider, usePrmContext } from './prm.context';
import { SubmitStatus } from './hooks/useApiReducer.hook';
import { configLoader } from './config';

vi.mock('./hooks/useLoadStaticData.hook', () => ({
  useLoadStaticData: vi.fn().mockReturnValue({
    loading: false,
    error: undefined,
    data: undefined,
  }),
}));

describe('PrmProvider', () => {
  let axiosInstance: AxiosInstance;

  beforeAll(() => {
    axiosInstance = axios.create();
  });

  test('renders children', () => {
    const { getByText } = render(
      <PrmProvider
        axiosInstance={axiosInstance}
        entityType={EntityType.Individual}
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
        entityType={EntityType.Individual}
        entityId={undefined}
      >
        {children}
      </PrmProvider>
    );

    const { result } = renderHook(() => usePrmContext(), {
      wrapper,
    });

    expect(JSON.stringify(result.current.config)).toEqual(
      JSON.stringify(configLoader({ languages: [], nationalities: [] })),
    );

    expect(result.current).toEqual({
      config: expect.any(Object),
      entityType: EntityType.Individual,
      entityId: undefined,
      create: {
        onCreateEntity: expect.any(Function),
        status: SubmitStatus.IDLE,
        data: undefined,
        error: undefined,
        reset: expect.any(Function),
      },
      read: {
        data: undefined,
        error: undefined,
        status: SubmitStatus.IDLE,
        loadEntity: expect.any(Function),
        reset: expect.any(Function),
      },
      edit: {
        onEditEntity: expect.any(Function),
        status: SubmitStatus.IDLE,
        data: undefined,
        error: undefined,
        reset: expect.any(Function),
      },
      list: {
        data: undefined,
        error: undefined,
        status: SubmitStatus.IDLE,
        listEntities: expect.any(Function),
        reset: expect.any(Function),
      },
    });
  });
});
