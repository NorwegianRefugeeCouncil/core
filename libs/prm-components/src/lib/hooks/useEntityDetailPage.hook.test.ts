import { renderHook } from '@testing-library/react-hooks';
import { vi, Mock } from 'vitest';
import { EntityType } from '@nrcno/core-models';

import { usePrmContext } from '../prm.context';
import { config } from '../config';

import { SubmitStatus } from './useApiReducer.hook';
import { useEntityDetailPage } from './useEntityDetailPage.hook';

vi.mock('../prm.context', () => ({
  usePrmContext: vi.fn(),
}));

const prmContextData = {
  entityType: EntityType.Participant,
  entityId: undefined,
  create: {
    onCreateEntity: vi.fn(),
    status: SubmitStatus.IDLE,
    data: undefined,
    error: undefined,
  },
};

describe('useEntityDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should call useLoaderData with the correct arguments', () => {
      (usePrmContext as Mock).mockReturnValue(prmContextData);

      renderHook(() => useEntityDetailPage('create'));
    });

    it('should return the correct values', () => {
      (usePrmContext as Mock).mockReturnValue(prmContextData);

      const { result } = renderHook(() => useEntityDetailPage('create'));

      expect(result.current).toEqual({
        mode: 'create',
        onSubmit: expect.any(Function),
        entityType: EntityType.Participant,
        config: config[EntityType.Participant].detail,
        isLoading: false,
        isError: false,
        isSuccess: false,
        error: undefined,
      });
    });

    it('should set isLoading to true when status is SUBMITTING', () => {
      (usePrmContext as Mock).mockReturnValue({
        ...prmContextData,
        create: {
          ...prmContextData.create,
          status: SubmitStatus.SUBMITTING,
        },
      });

      const { result } = renderHook(() => useEntityDetailPage('create'));

      expect(result.current.isLoading).toBe(true);
    });

    it('should set isError to true when status is ERROR', () => {
      (usePrmContext as Mock).mockReturnValue({
        ...prmContextData,
        create: {
          ...prmContextData.create,
          status: SubmitStatus.ERROR,
        },
      });

      const { result } = renderHook(() => useEntityDetailPage('create'));

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

      const { result } = renderHook(() => useEntityDetailPage('create'));

      expect(result.current.isSuccess).toBe(true);
    });

    it('should parse the form data and call onCreateEntity when handleSubmit is called', () => {
      (usePrmContext as Mock).mockReturnValue(prmContextData);

      const { result } = renderHook(() => useEntityDetailPage('create'));

      const form = document.createElement('form');
      const createInputElement = (name: string, value: string) => {
        const input = document.createElement('input');
        input.name = name;
        input.value = value;
        return input;
      };
      form.appendChild(createInputElement('firstName', 'John'));
      form.appendChild(createInputElement('lastName', 'Doe'));
      form.appendChild(
        createInputElement('disabilities.disabilityPwdComment', 'Comment'),
      );
      form.appendChild(
        createInputElement('contactDetails.0.contactDetailType', 'Email'),
      );

      if (!result.current.onSubmit)
        throw new Error('onSubmit is not defined on the hook');

      result.current.onSubmit(form);

      expect(prmContextData.create.onCreateEntity).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        disabilities: {
          disabilityPwdComment: 'Comment',
        },
        contactDetails: [
          {
            contactDetailType: 'Email',
          },
        ],
      });
    });
  });
});
