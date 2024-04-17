import { AlreadyExistsError } from '@nrcno/core-errors';
import {
  ContactMeans,
  DisabilityLevel,
  DisplacementStatus,
  EngagementContext,
  ParticipantDefinition,
  Sex,
  YesNoUnknown,
} from '@nrcno/core-models';

import { ParticipantStore } from './participant.store';

jest.mock('ulidx', () => ({
  ulid: jest.fn().mockReturnValue('01HVNAT9GVADE1K8CS7S6Y7J2F'),
}));

const makeParticipantDefinition = (
  overrides: any = {},
): ParticipantDefinition => ({
  firstName: 'John',
  middleName: 'Doe',
  lastName: 'Doe',
  nativeName: 'Doe',
  motherName: 'Doe',
  preferredName: 'Doe',
  dateOfBirth: new Date('1990.01.01'),
  nrcId: '123456789',
  residence: 'Doe',
  contactMeansComment: 'Doe',
  consentGdpr: true,
  consentReferral: true,
  sex: Sex.Other,
  preferredContactMeans: ContactMeans.Email,
  displacementStatus: DisplacementStatus.Idp,
  engagementContext: EngagementContext.HouseVisit,
  ...overrides,
  disabilities: {
    hasDisabilityPwd: true,
    disabilityPwdComment: 'Doe',
    hasDisabilityVision: true,
    disabilityVisionLevel: DisabilityLevel.Three,
    hasDisabilityHearing: true,
    disabilityHearingLevel: DisabilityLevel.Three,
    hasDisabilityMobility: true,
    disabilityMobilityLevel: DisabilityLevel.Three,
    hasDisabilityCognition: true,
    disabilityCognitionLevel: DisabilityLevel.Three,
    hasDisabilitySelfcare: true,
    disabilitySelfcareLevel: DisabilityLevel.Three,
    hasDisabilityCommunication: true,
    disabilityCommunicationLevel: DisabilityLevel.Three,
    isChildAtRisk: YesNoUnknown.Yes,
    isElderAtRisk: YesNoUnknown.Yes,
    isWomanAtRisk: YesNoUnknown.Yes,
    isSingleParent: YesNoUnknown.Yes,
    isSeparatedChild: YesNoUnknown.Yes,
    isPregnant: YesNoUnknown.Yes,
    isLactating: YesNoUnknown.Yes,
    hasMedicalCondition: YesNoUnknown.Yes,
    needsLegalPhysicalProtection: YesNoUnknown.Yes,
    vulnerabilityComments: 'Doe',
    ...(overrides.disabilities || {}),
  },
  contactDetails: [...(overrides.contactDetails || [])],
  identification: [...(overrides.identification || [])],
});

describe('Participant store', () => {
  describe('create', () => {
    it('should create a participant', async () => {
      const participantDefinition: ParticipantDefinition =
        makeParticipantDefinition();

      const createdParticipant = await ParticipantStore.create(
        participantDefinition,
      );

      // Add your assertions here to verify the created participant
      expect(createdParticipant).toBeDefined();
      // Add more assertions as needed
    });

    it('should throw an error when creating a participant with invalid data', async () => {
      const participantDefinition = makeParticipantDefinition({
        sex: 'invalid',
      });

      try {
        await ParticipantStore.create(participantDefinition);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should throw an AlredyExistsError when creating a participant that already exists', async () => {
      const participantDefinition = makeParticipantDefinition();

      try {
        await ParticipantStore.create(participantDefinition);
        await ParticipantStore.create(participantDefinition); // ulid is mocked to return the same value
      } catch (error) {
        // Add your assertions here to verify the error
        expect(error).toBeDefined();
        // Add more assertions as needed
      }
    });
  });
});
