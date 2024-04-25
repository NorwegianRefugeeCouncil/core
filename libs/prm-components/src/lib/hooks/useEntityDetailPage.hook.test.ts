import { renderHook } from '@testing-library/react-hooks';
import { useLoaderData } from 'react-router-dom';
import { vi, Mock } from 'vitest';
import { EntityType } from '@nrcno/core-models';

import { SubmitStatus } from '../types';
import { usePrmContext } from '../prm.context';
import { config } from '../config';

import { useEntityDetailPage } from './useEntityDetailPage.hook';

vi.mock('react-router-dom', () => ({
  useLoaderData: vi.fn(),
}));

vi.mock('../prm.context', () => ({
  usePrmContext: vi.fn(),
}));

const prmContextData = {
  create: {
    onCreateEntity: vi.fn(),
    status: SubmitStatus.IDLE,
    data: undefined,
    error: undefined,
  },
};

describe('useEntityDetailPage', () => {
  const loaderData = {
    mode: 'create',
    entityType: EntityType.Participant,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should call useLoaderData with the correct arguments', () => {
      (useLoaderData as Mock).mockReturnValue(loaderData);
      (usePrmContext as Mock).mockReturnValue(prmContextData);

      renderHook(() => useEntityDetailPage());

      expect(useLoaderData).toHaveBeenCalledWith();
    });

    it('should return the correct values', () => {
      (useLoaderData as Mock).mockReturnValue(loaderData);
      (usePrmContext as Mock).mockReturnValue(prmContextData);

      const { result } = renderHook(() => useEntityDetailPage());

      expect(result.current).toEqual({
        handleSubmit: expect.any(Function),
        entityType: EntityType.Participant,
        config: config[EntityType.Participant].detail,
        isLoading: false,
        isError: false,
        isSuccess: false,
        error: undefined,
      });
    });

    it('should set isLoading to true when status is SUBMITTING', () => {
      (useLoaderData as Mock).mockReturnValue(loaderData);
      (usePrmContext as Mock).mockReturnValue({
        create: {
          ...prmContextData.create,
          status: SubmitStatus.SUBMITTING,
        },
      });

      const { result } = renderHook(() => useEntityDetailPage());

      expect(result.current.isLoading).toBe(true);
    });

    it('should set isError to true when status is ERROR', () => {
      (useLoaderData as Mock).mockReturnValue(loaderData);
      (usePrmContext as Mock).mockReturnValue({
        create: {
          ...prmContextData.create,
          status: SubmitStatus.ERROR,
        },
      });

      const { result } = renderHook(() => useEntityDetailPage());

      expect(result.current.isError).toBe(true);
    });

    it('should set isSuccess to true when status is SUCCESS', () => {
      (useLoaderData as Mock).mockReturnValue(loaderData);
      (usePrmContext as Mock).mockReturnValue({
        create: {
          ...prmContextData.create,
          status: SubmitStatus.SUCCESS,
        },
      });

      const { result } = renderHook(() => useEntityDetailPage());

      expect(result.current.isSuccess).toBe(true);
    });

    it('should parse the form data and call onCreateEntity when handleSubmit is called', () => {
      (useLoaderData as Mock).mockReturnValue(loaderData);
      (usePrmContext as Mock).mockReturnValue(prmContextData);

      const { result } = renderHook(() => useEntityDetailPage());

      const event = {
        preventDefault: vi.fn(),
        target: {
          firstName: { value: 'John' },
          lastName: { value: 'Doe' },
          'disability.disabilityPwdComment': { value: 'Comment' },
          'contactDetails.0.contactDetailType': { value: 'Email' },
        },
      } as any;

      result.current.handleSubmit(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(prmContextData.create.onCreateEntity).toHaveBeenCalledWith({
        participant: {
          firstName: 'John',
          lastName: 'Doe',
          disability: {
            disabilityPwdComment: 'Comment',
          },
          contactDetails: [
            {
              contactDetailType: 'Email',
            },
          ],
        },
      });
    });
  });
});
