import { renderHook } from '@testing-library/react-hooks';
import { vi, Mock } from 'vitest';
import { EntityType } from '@nrcno/core-models';
import { MemoryRouter } from 'react-router-dom';

import { PrmContextData, usePrmContext } from '../prm.context';
import { configLoader } from '../config';

import { SubmitStatus } from './useApiReducer.hook';
import { useEntityDetailPage } from './useEntityDetailPage.hook';

const config = configLoader({ languages: [], nationalities: [] });

const renderHookOptions = {
  wrapper: ({ children }: { children: any }) => (
    <MemoryRouter>{children}</MemoryRouter>
  ),
};

vi.mock('../prm.context', () => ({
  usePrmContext: vi.fn(),
}));

describe('useEntityDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    const prmContextData: PrmContextData = {
      config,
      entityType: EntityType.Participant,
      entityId: undefined,
      create: {
        onCreateEntity: vi.fn(),
        status: SubmitStatus.IDLE,
        data: undefined,
        error: undefined,
        reset: vi.fn(),
      },
      read: {
        loadEntity: vi.fn(),
        status: SubmitStatus.IDLE,
        data: undefined,
        error: undefined,
        reset: vi.fn(),
      },
      edit: {
        onEditEntity: vi.fn(),
        status: SubmitStatus.IDLE,
        data: undefined,
        error: undefined,
        reset: vi.fn(),
      },
      list: {
        listEntities: vi.fn(),
        status: SubmitStatus.IDLE,
        data: undefined,
        error: undefined,
        reset: vi.fn(),
      },
    };

    it('should return the correct values', () => {
      (usePrmContext as Mock).mockReturnValue(prmContextData);

      const { result } = renderHook(
        () => useEntityDetailPage('create'),
        renderHookOptions,
      );

      expect(result.current).toEqual({
        mode: 'create',
        onSubmit: expect.any(Function),
        entityType: EntityType.Participant,
        config: config[EntityType.Participant].detail,
        isLoading: false,
        isError: false,
        isSuccess: false,
        error: undefined,
        isSubmitting: false,
        data: undefined,
      });
    });

    it('should set isSubmitting to true when status is SUBMITTING', () => {
      (usePrmContext as Mock).mockReturnValue({
        ...prmContextData,
        create: {
          ...prmContextData.create,
          status: SubmitStatus.SUBMITTING,
        },
      });

      const { result } = renderHook(
        () => useEntityDetailPage('create'),
        renderHookOptions,
      );

      expect(result.current.isSubmitting).toBe(true);
    });

    it('should set isError to true when status is ERROR', () => {
      (usePrmContext as Mock).mockReturnValue({
        ...prmContextData,
        create: {
          ...prmContextData.create,
          status: SubmitStatus.ERROR,
        },
      });

      const { result } = renderHook(
        () => useEntityDetailPage('create'),
        renderHookOptions,
      );

      expect(result.current.isError).toBe(true);
    });

    it('should set isSuccess to true when status is SUCCESS', () => {
      (usePrmContext as Mock).mockReturnValue({
        ...prmContextData,
        create: {
          ...prmContextData.create,
          status: SubmitStatus.SUCCESS,
        },
      });

      const { result } = renderHook(
        () => useEntityDetailPage('create'),
        renderHookOptions,
      );

      expect(result.current.isSuccess).toBe(true);
    });

    it('should parse the form data and call onCreateEntity when handleSubmit is called', () => {
      (usePrmContext as Mock).mockReturnValue(prmContextData);

      const { result } = renderHook(
        () => useEntityDetailPage('create'),
        renderHookOptions,
      );

      if (!result.current.onSubmit)
        throw new Error('onSubmit is not defined on the hook');

      result.current.onSubmit({
        firstName: 'John',
        lastName: 'Doe',
        contactDetails: {
          emails: [
            {
              value: 'test@test.com',
              id: '',
            },
          ],
          phones: [],
        },
        consentGdpr: false,
        consentReferral: false,
        languages: [],
        nationalities: [],
        identification: [],
        id: '',
      });

      expect(prmContextData.create.onCreateEntity).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        contactDetails: {
          emails: [
            {
              value: 'test@test.com',
            },
          ],
          phones: [],
        },
        consentGdpr: false,
        consentReferral: false,
        languages: [],
        nationalities: [],
        identification: [],
      });
    });
  });

  describe('read', () => {
    const prmContextData: PrmContextData = {
      config,
      entityType: EntityType.Participant,
      entityId: '1234',
      create: {
        onCreateEntity: vi.fn(),
        status: SubmitStatus.IDLE,
        data: undefined,
        error: undefined,
        reset: vi.fn(),
      },
      read: {
        loadEntity: vi.fn(),
        status: SubmitStatus.IDLE,
        data: undefined,
        error: undefined,
        reset: vi.fn(),
      },
      edit: {
        onEditEntity: vi.fn(),
        status: SubmitStatus.IDLE,
        data: undefined,
        error: undefined,
        reset: vi.fn(),
      },
      list: {
        listEntities: vi.fn(),
        status: SubmitStatus.IDLE,
        data: undefined,
        error: undefined,
        reset: vi.fn(),
      },
    };

    it('should return the correct values', () => {
      (usePrmContext as Mock).mockReturnValue(prmContextData);

      const { result } = renderHook(
        () => useEntityDetailPage('read'),
        renderHookOptions,
      );

      expect(result.current).toEqual({
        mode: 'read',
        entityType: EntityType.Participant,
        config: config[EntityType.Participant].detail,
        isLoading: false,
        isError: false,
        isSuccess: false,
        error: undefined,
        isSubmitting: false,
        data: undefined,
        entityId: '1234',
      });
    });

    it('should set isLoading to true when status is SUBMITTING', () => {
      (usePrmContext as Mock).mockReturnValue({
        ...prmContextData,
        read: {
          ...prmContextData.read,
          status: SubmitStatus.SUBMITTING,
        },
      });

      const { result } = renderHook(
        () => useEntityDetailPage('read'),
        renderHookOptions,
      );

      expect(result.current.isLoading).toBe(true);
    });

    it('should set isError to true when status is ERROR', () => {
      (usePrmContext as Mock).mockReturnValue({
        ...prmContextData,
        read: {
          ...prmContextData.read,
          status: SubmitStatus.ERROR,
        },
      });

      const { result } = renderHook(
        () => useEntityDetailPage('read'),
        renderHookOptions,
      );

      expect(result.current.isError).toBe(true);
    });

    it('should not set isSuccess to true when status is SUCCESS', () => {
      (usePrmContext as Mock).mockReturnValue({
        ...prmContextData,
        read: {
          ...prmContextData.read,
          status: SubmitStatus.SUCCESS,
        },
      });

      const { result } = renderHook(
        () => useEntityDetailPage('read'),
        renderHookOptions,
      );

      expect(result.current.isSuccess).toBe(false);
    });

    it('should call loadEntity when entityId is defined', () => {
      (usePrmContext as Mock).mockReturnValue(prmContextData);

      renderHook(() => useEntityDetailPage('read'), renderHookOptions);

      expect(prmContextData.read.loadEntity).toHaveBeenCalledWith('1234');
    });

    it('should return the read data when read data is defined', () => {
      (usePrmContext as Mock).mockReturnValue({
        ...prmContextData,
        read: {
          ...prmContextData.read,
          data: {
            id: '1234',
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      });

      const { result } = renderHook(
        () => useEntityDetailPage('read'),
        renderHookOptions,
      );

      expect(result.current.data).toEqual({
        id: '1234',
        firstName: 'John',
        lastName: 'Doe',
      });
    });
  });

  describe('edit', () => {
    const prmContextData: PrmContextData = {
      config,
      entityType: EntityType.Participant,
      entityId: '1234',
      create: {
        onCreateEntity: vi.fn(),
        status: SubmitStatus.IDLE,
        data: undefined,
        error: undefined,
        reset: vi.fn(),
      },
      read: {
        loadEntity: vi.fn(),
        status: SubmitStatus.IDLE,
        data: undefined,
        error: undefined,
        reset: vi.fn(),
      },
      edit: {
        onEditEntity: vi.fn(),
        status: SubmitStatus.IDLE,
        data: undefined,
        error: undefined,
        reset: vi.fn(),
      },
      list: {
        listEntities: vi.fn(),
        status: SubmitStatus.IDLE,
        data: undefined,
        error: undefined,
        reset: vi.fn(),
      },
    };

    it('should return the correct values', () => {
      (usePrmContext as Mock).mockReturnValue(prmContextData);

      const { result } = renderHook(
        () => useEntityDetailPage('edit'),
        renderHookOptions,
      );

      expect(result.current).toEqual({
        mode: 'edit',
        onSubmit: expect.any(Function),
        entityType: EntityType.Participant,
        config: config[EntityType.Participant].detail,
        isLoading: false,
        isError: false,
        isSuccess: false,
        error: undefined,
        isSubmitting: false,
        data: undefined,
        entityId: '1234',
      });
    });

    it('should set isSubmitting to true when edit status is SUBMITTING', () => {
      (usePrmContext as Mock).mockReturnValue({
        ...prmContextData,
        edit: {
          ...prmContextData.edit,
          status: SubmitStatus.SUBMITTING,
        },
      });

      const { result } = renderHook(
        () => useEntityDetailPage('edit'),
        renderHookOptions,
      );

      expect(result.current.isSubmitting).toBe(true);
    });

    it('should set isLoading to true when read status is SUBMITTING', () => {
      (usePrmContext as Mock).mockReturnValue({
        ...prmContextData,
        read: {
          ...prmContextData.read,
          status: SubmitStatus.SUBMITTING,
        },
      });

      const { result } = renderHook(
        () => useEntityDetailPage('edit'),
        renderHookOptions,
      );

      expect(result.current.isLoading).toBe(true);
    });

    it('should set isError to true when edit status is ERROR', () => {
      (usePrmContext as Mock).mockReturnValue({
        ...prmContextData,
        edit: {
          ...prmContextData.edit,
          status: SubmitStatus.ERROR,
        },
      });

      const { result } = renderHook(
        () => useEntityDetailPage('edit'),
        renderHookOptions,
      );

      expect(result.current.isError).toBe(true);
    });

    it('should set isError to true when read status is ERROR', () => {
      (usePrmContext as Mock).mockReturnValue({
        ...prmContextData,
        read: {
          ...prmContextData.read,
          status: SubmitStatus.ERROR,
        },
      });

      const { result } = renderHook(
        () => useEntityDetailPage('edit'),
        renderHookOptions,
      );

      expect(result.current.isError).toBe(true);
    });

    it('should set isSuccess to true when edit status is SUCCESS', () => {
      (usePrmContext as Mock).mockReturnValue({
        ...prmContextData,
        edit: {
          ...prmContextData.edit,
          status: SubmitStatus.SUCCESS,
        },
      });

      const { result } = renderHook(
        () => useEntityDetailPage('edit'),
        renderHookOptions,
      );

      expect(result.current.isSuccess).toBe(true);
    });

    it('should call loadEntity when entityId is defined', () => {
      (usePrmContext as Mock).mockReturnValue(prmContextData);

      renderHook(() => useEntityDetailPage('read'), renderHookOptions);

      expect(prmContextData.read.loadEntity).toHaveBeenCalledWith('1234');
    });

    it('should return the read data when read data is defined', () => {
      (usePrmContext as Mock).mockReturnValue({
        ...prmContextData,
        read: {
          ...prmContextData.read,
          data: {
            id: '1234',
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      });

      const { result } = renderHook(
        () => useEntityDetailPage('edit'),
        renderHookOptions,
      );

      expect(result.current.data).toEqual({
        id: '1234',
        firstName: 'John',
        lastName: 'Doe',
      });
    });

    it('should return the edit data when edit data is defined', () => {
      (usePrmContext as Mock).mockReturnValue({
        ...prmContextData,
        edit: {
          ...prmContextData.edit,
          data: {
            id: '1234',
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      });

      const { result } = renderHook(
        () => useEntityDetailPage('edit'),
        renderHookOptions,
      );

      expect(result.current.data).toEqual({
        id: '1234',
        firstName: 'John',
        lastName: 'Doe',
      });
    });

    it('should parse the form data and call onEditEntity when handleSubmit is called', () => {
      (usePrmContext as Mock).mockReturnValue(prmContextData);

      const { result } = renderHook(
        () => useEntityDetailPage('edit'),
        renderHookOptions,
      );

      if (!result.current.onSubmit)
        throw new Error('onSubmit is not defined on the hook');

      result.current.onSubmit({
        firstName: 'John',
        lastName: 'Doe',
        contactDetails: {
          emails: [
            {
              value: '',
              id: '',
            },
          ],
          phones: [],
        },
        consentGdpr: false,
        consentReferral: false,
        languages: [],
        nationalities: [],
        identification: [],
        id: '',
      });

      expect(prmContextData.edit.onEditEntity).toHaveBeenCalledWith('1234', {
        firstName: 'John',
        lastName: 'Doe',
        contactDetails: {
          emails: [
            {
              value: '',
              id: '',
            },
          ],
          phones: [],
        },
        consentGdpr: false,
        consentReferral: false,
        languages: [],
        nationalities: [],
        identification: [],
        id: '',
      });
    });
  });
});
