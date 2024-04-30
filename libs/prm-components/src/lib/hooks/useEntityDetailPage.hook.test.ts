import { renderHook } from '@testing-library/react-hooks';
import { vi, Mock } from 'vitest';
import {
  ContactDetailType,
  DisabilityLevel,
  EntityType,
  YesNoUnknown,
} from '@nrcno/core-models';

import { PrmContextData, usePrmContext } from '../prm.context';
import { config } from '../config';

import { SubmitStatus } from './useApiReducer.hook';
import { useEntityDetailPage } from './useEntityDetailPage.hook';

vi.mock('../prm.context', () => ({
  usePrmContext: vi.fn(),
}));

describe('useEntityDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    const prmContextData: PrmContextData = {
      entityType: EntityType.Participant,
      entityId: undefined,
      create: {
        onCreateEntity: vi.fn(),
        status: SubmitStatus.IDLE,
        data: undefined,
        error: undefined,
      },
      read: {
        loadEntity: vi.fn(),
        status: SubmitStatus.IDLE,
        data: undefined,
        error: undefined,
      },
      edit: {
        onEditEntity: vi.fn(),
        status: SubmitStatus.IDLE,
        data: undefined,
        error: undefined,
      },
    };

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

      if (!result.current.onSubmit)
        throw new Error('onSubmit is not defined on the hook');

      result.current.onSubmit({
        firstName: 'John',
        lastName: 'Doe',
        disabilities: {
          hasDisabilityPwd: false,
          disabilityPwdComment: 'Comment',
          hasDisabilityVision: false,
          disabilityVisionLevel: DisabilityLevel.Four,
          hasDisabilityHearing: false,
          disabilityHearingLevel: DisabilityLevel.Four,
          hasDisabilityMobility: false,
          disabilityMobilityLevel: DisabilityLevel.Four,
          hasDisabilityCognition: false,
          disabilityCognitionLevel: DisabilityLevel.Four,
          hasDisabilitySelfcare: false,
          disabilitySelfcareLevel: DisabilityLevel.Four,
          hasDisabilityCommunication: false,
          disabilityCommunicationLevel: DisabilityLevel.Four,
          isChildAtRisk: YesNoUnknown.No,
          isElderAtRisk: YesNoUnknown.No,
          isWomanAtRisk: YesNoUnknown.No,
          isSingleParent: YesNoUnknown.No,
          isSeparatedChild: YesNoUnknown.No,
          isPregnant: YesNoUnknown.No,
          isLactating: YesNoUnknown.No,
          hasMedicalCondition: YesNoUnknown.No,
          needsLegalPhysicalProtection: YesNoUnknown.No,
          vulnerabilityComments: 'Comments',
        },
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

      expect(prmContextData.create.onCreateEntity).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        disabilities: {
          hasDisabilityPwd: false,
          disabilityPwdComment: 'Comment',
          hasDisabilityVision: false,
          disabilityVisionLevel: DisabilityLevel.Four,
          hasDisabilityHearing: false,
          disabilityHearingLevel: DisabilityLevel.Four,
          hasDisabilityMobility: false,
          disabilityMobilityLevel: DisabilityLevel.Four,
          hasDisabilityCognition: false,
          disabilityCognitionLevel: DisabilityLevel.Four,
          hasDisabilitySelfcare: false,
          disabilitySelfcareLevel: DisabilityLevel.Four,
          hasDisabilityCommunication: false,
          disabilityCommunicationLevel: DisabilityLevel.Four,
          isChildAtRisk: YesNoUnknown.No,
          isElderAtRisk: YesNoUnknown.No,
          isWomanAtRisk: YesNoUnknown.No,
          isSingleParent: YesNoUnknown.No,
          isSeparatedChild: YesNoUnknown.No,
          isPregnant: YesNoUnknown.No,
          isLactating: YesNoUnknown.No,
          hasMedicalCondition: YesNoUnknown.No,
          needsLegalPhysicalProtection: YesNoUnknown.No,
          vulnerabilityComments: 'Comments',
        },
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

  describe('read', () => {
    const prmContextData: PrmContextData = {
      entityType: EntityType.Participant,
      entityId: '1234',
      create: {
        onCreateEntity: vi.fn(),
        status: SubmitStatus.IDLE,
        data: undefined,
        error: undefined,
      },
      read: {
        loadEntity: vi.fn(),
        status: SubmitStatus.IDLE,
        data: undefined,
        error: undefined,
      },
      edit: {
        onEditEntity: vi.fn(),
        status: SubmitStatus.IDLE,
        data: undefined,
        error: undefined,
      },
    };

    it('should return the correct values', () => {
      (usePrmContext as Mock).mockReturnValue(prmContextData);

      const { result } = renderHook(() => useEntityDetailPage('read'));

      expect(result.current).toEqual({
        mode: 'read',
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
        read: {
          ...prmContextData.read,
          status: SubmitStatus.SUBMITTING,
        },
      });

      const { result } = renderHook(() => useEntityDetailPage('read'));

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

      const { result } = renderHook(() => useEntityDetailPage('read'));

      expect(result.current.isError).toBe(true);
    });

    it('should set isSuccess to true when status is SUCCESS', () => {
      (usePrmContext as Mock).mockReturnValue({
        ...prmContextData,
        read: {
          ...prmContextData.read,
          status: SubmitStatus.SUCCESS,
        },
      });

      const { result } = renderHook(() => useEntityDetailPage('read'));

      expect(result.current.isSuccess).toBe(true);
    });

    it('should call loadEntity when entityId is defined', () => {
      (usePrmContext as Mock).mockReturnValue(prmContextData);

      renderHook(() => useEntityDetailPage('read'));

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

      const { result } = renderHook(() => useEntityDetailPage('read'));

      expect(result.current.data).toEqual({
        id: '1234',
        firstName: 'John',
        lastName: 'Doe',
      });
    });
  });

  describe('edit', () => {
    const prmContextData: PrmContextData = {
      entityType: EntityType.Participant,
      entityId: '1234',
      create: {
        onCreateEntity: vi.fn(),
        status: SubmitStatus.IDLE,
        data: undefined,
        error: undefined,
      },
      read: {
        loadEntity: vi.fn(),
        status: SubmitStatus.IDLE,
        data: undefined,
        error: undefined,
      },
      edit: {
        onEditEntity: vi.fn(),
        status: SubmitStatus.IDLE,
        data: undefined,
        error: undefined,
      },
    };

    it('should return the correct values', () => {
      (usePrmContext as Mock).mockReturnValue(prmContextData);

      const { result } = renderHook(() => useEntityDetailPage('edit'));

      expect(result.current).toEqual({
        mode: 'edit',
        onSubmit: expect.any(Function),
        entityType: EntityType.Participant,
        config: config[EntityType.Participant].detail,
        isLoading: false,
        isError: false,
        isSuccess: false,
        error: undefined,
      });
    });

    it('should set isLoading to true when edit status is SUBMITTING', () => {
      (usePrmContext as Mock).mockReturnValue({
        ...prmContextData,
        edit: {
          ...prmContextData.edit,
          status: SubmitStatus.SUBMITTING,
        },
      });

      const { result } = renderHook(() => useEntityDetailPage('edit'));

      expect(result.current.isLoading).toBe(true);
    });

    it('should set isLoading to true when read status is SUBMITTING', () => {
      (usePrmContext as Mock).mockReturnValue({
        ...prmContextData,
        read: {
          ...prmContextData.read,
          status: SubmitStatus.SUBMITTING,
        },
      });

      const { result } = renderHook(() => useEntityDetailPage('edit'));

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

      const { result } = renderHook(() => useEntityDetailPage('edit'));

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

      const { result } = renderHook(() => useEntityDetailPage('edit'));

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

      const { result } = renderHook(() => useEntityDetailPage('edit'));

      expect(result.current.isSuccess).toBe(true);
    });

    it('should set isSuccess to true when read status is SUCCESS', () => {
      (usePrmContext as Mock).mockReturnValue({
        ...prmContextData,
        read: {
          ...prmContextData.read,
          status: SubmitStatus.SUCCESS,
        },
      });

      const { result } = renderHook(() => useEntityDetailPage('edit'));

      expect(result.current.isSuccess).toBe(true);
    });

    it('should call loadEntity when entityId is defined', () => {
      (usePrmContext as Mock).mockReturnValue(prmContextData);

      renderHook(() => useEntityDetailPage('read'));

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

      const { result } = renderHook(() => useEntityDetailPage('edit'));

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

      const { result } = renderHook(() => useEntityDetailPage('edit'));

      expect(result.current.data).toEqual({
        id: '1234',
        firstName: 'John',
        lastName: 'Doe',
      });
    });

    it('should parse the form data and call onEditEntity when handleSubmit is called', () => {
      (usePrmContext as Mock).mockReturnValue(prmContextData);

      const { result } = renderHook(() => useEntityDetailPage('edit'));

      if (!result.current.onSubmit)
        throw new Error('onSubmit is not defined on the hook');

      result.current.onSubmit({
        firstName: 'John',
        lastName: 'Doe',
        disabilities: {
          hasDisabilityPwd: false,
          disabilityPwdComment: 'Comment',
          hasDisabilityVision: false,
          disabilityVisionLevel: DisabilityLevel.Four,
          hasDisabilityHearing: false,
          disabilityHearingLevel: DisabilityLevel.Four,
          hasDisabilityMobility: false,
          disabilityMobilityLevel: DisabilityLevel.Four,
          hasDisabilityCognition: false,
          disabilityCognitionLevel: DisabilityLevel.Four,
          hasDisabilitySelfcare: false,
          disabilitySelfcareLevel: DisabilityLevel.Four,
          hasDisabilityCommunication: false,
          disabilityCommunicationLevel: DisabilityLevel.Four,
          isChildAtRisk: YesNoUnknown.No,
          isElderAtRisk: YesNoUnknown.No,
          isWomanAtRisk: YesNoUnknown.No,
          isSingleParent: YesNoUnknown.No,
          isSeparatedChild: YesNoUnknown.No,
          isPregnant: YesNoUnknown.No,
          isLactating: YesNoUnknown.No,
          hasMedicalCondition: YesNoUnknown.No,
          needsLegalPhysicalProtection: YesNoUnknown.No,
          vulnerabilityComments: 'Comments',
        },
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
        disabilities: {
          hasDisabilityPwd: false,
          disabilityPwdComment: 'Comment',
          hasDisabilityVision: false,
          disabilityVisionLevel: DisabilityLevel.Four,
          hasDisabilityHearing: false,
          disabilityHearingLevel: DisabilityLevel.Four,
          hasDisabilityMobility: false,
          disabilityMobilityLevel: DisabilityLevel.Four,
          hasDisabilityCognition: false,
          disabilityCognitionLevel: DisabilityLevel.Four,
          hasDisabilitySelfcare: false,
          disabilitySelfcareLevel: DisabilityLevel.Four,
          hasDisabilityCommunication: false,
          disabilityCommunicationLevel: DisabilityLevel.Four,
          isChildAtRisk: YesNoUnknown.No,
          isElderAtRisk: YesNoUnknown.No,
          isWomanAtRisk: YesNoUnknown.No,
          isSingleParent: YesNoUnknown.No,
          isSeparatedChild: YesNoUnknown.No,
          isPregnant: YesNoUnknown.No,
          isLactating: YesNoUnknown.No,
          hasMedicalCondition: YesNoUnknown.No,
          needsLegalPhysicalProtection: YesNoUnknown.No,
          vulnerabilityComments: 'Comments',
        },
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
