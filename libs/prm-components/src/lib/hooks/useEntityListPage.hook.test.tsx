import { EntityType } from '@nrcno/core-models';
import { renderHook } from '@testing-library/react-hooks';
import { MemoryRouter } from 'react-router-dom';
import { Mock, vi } from 'vitest';

import { configLoader } from '../config';
import { PrmContextData, usePrmContext } from '../prm.context';

import { SubmitStatus } from './useApiReducer.hook';
import { useEntityListPage } from './useEntityListPage.hook';

const config = configLoader({ languages: [], nationalities: [] });

const renderHookOptions = {
  wrapper: ({ children }: { children: any }) => (
    <MemoryRouter>{children}</MemoryRouter>
  ),
};

vi.mock('../prm.context', () => ({
  usePrmContext: vi.fn(),
}));

describe('useEntityListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('read', () => {
    const prmContextData: PrmContextData = {
      config,
      entityType: EntityType.Individual,
      entityId: '1234',
      create: {
        onCreateEntity: vi.fn(),
        reset: vi.fn(),
        status: SubmitStatus.IDLE,
        data: undefined,
        error: undefined,
      },
      read: {
        loadEntity: vi.fn(),
        reset: vi.fn(),
        status: SubmitStatus.IDLE,
        data: undefined,
        error: undefined,
      },
      edit: {
        onEditEntity: vi.fn(),
        reset: vi.fn(),
        status: SubmitStatus.IDLE,
        data: undefined,
        error: undefined,
      },
      list: {
        listEntities: vi.fn(),
        reset: vi.fn(),
        status: SubmitStatus.IDLE,
        data: undefined,
        error: undefined,
      },
    };

    it('should return the correct values', () => {
      (usePrmContext as Mock).mockReturnValue(prmContextData);

      const { result } = renderHook(
        () =>
          useEntityListPage(
            { pageSize: 10, startIndex: 0 },
            { firstName: 'John' },
          ),
        renderHookOptions,
      );

      expect(result.current).toEqual({
        entityType: EntityType.Individual,
        listConfig: config[EntityType.Individual].list,
        filterConfig: config[EntityType.Individual].filtering,
        isLoading: false,
        isError: false,
        isSuccess: false,
        error: undefined,
        data: undefined,
      });
    });

    it('should set isLoading to true when status is SUBMITTING', () => {
      (usePrmContext as Mock).mockReturnValue({
        ...prmContextData,
        list: {
          ...prmContextData.list,
          status: SubmitStatus.SUBMITTING,
        },
      });

      const { result } = renderHook(
        () => useEntityListPage({ pageSize: 10, startIndex: 0 }, {}),
        renderHookOptions,
      );

      expect(result.current.isLoading).toBe(true);
    });

    it('should set isError to true when status is ERROR', () => {
      (usePrmContext as Mock).mockReturnValue({
        ...prmContextData,
        list: {
          ...prmContextData.list,
          status: SubmitStatus.ERROR,
        },
      });

      const { result } = renderHook(
        () =>
          useEntityListPage(
            { pageSize: 10, startIndex: 0 },
            { firstName: 'John' },
          ),
        renderHookOptions,
      );

      expect(result.current.isError).toBe(true);
    });

    it('should set isSuccess to true when status is SUCCESS', () => {
      (usePrmContext as Mock).mockReturnValue({
        ...prmContextData,
        list: {
          ...prmContextData.list,
          status: SubmitStatus.SUCCESS,
        },
      });

      const { result } = renderHook(
        () =>
          useEntityListPage(
            { pageSize: 10, startIndex: 0 },
            { firstName: 'John' },
          ),
        renderHookOptions,
      );

      expect(result.current.isSuccess).toBe(true);
    });

    it('should return the list data when list data is defined', () => {
      (usePrmContext as Mock).mockReturnValue({
        ...prmContextData,
        list: {
          ...prmContextData.list,
          data: [
            {
              id: '1234',
              firstName: 'John',
              lastName: 'Doe',
            },
          ],
        },
      });

      const { result } = renderHook(
        () =>
          useEntityListPage(
            { pageSize: 10, startIndex: 0 },
            { firstName: 'John' },
          ),
        renderHookOptions,
      );

      expect(result.current.data).toEqual([
        {
          id: '1234',
          firstName: 'John',
          lastName: 'Doe',
        },
      ]);
    });
  });
});
