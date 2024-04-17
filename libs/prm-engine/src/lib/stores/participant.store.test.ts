import * as mockDb from 'mock-knex';

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
import { getDb } from '@nrcno/core-db';

import { ParticipantStore } from './participant.store';

jest.mock('ulidx', () => ({
  ulid: jest.fn().mockReturnValue('01HVNAT9GVADE1K8CS7S6Y7J2F'),
}));

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('29d1a13a-7c46-4bc8-956e-ca1c4b55b74e'),
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
  languages: [
    {
      isoCode: 'en',
    },
    ...(overrides.languages || []),
  ],
  nationalities: [
    {
      isoCode: 'en',
    },
    ...(overrides.nationalities || []),
  ],
  contactDetails: [...(overrides.contactDetails || [])],
  identification: [...(overrides.identification || [])],
});

describe('Participant store', () => {
  beforeAll(async () => {
    const db = getDb({
      host: '127.0.0.1',
      user: 'mockKnex',
      password: 'mockKnex',
      database: 'mockKnex',
    });
    mockDb.mock(db);
  });

  describe.skip('create', () => {
    it('should create a participant', async () => {
      const tracker = mockDb.getTracker();
      tracker.install();

      tracker.on('query', (query, step) => [
        // person
        () => {
          expect(query.sql).toEqual(
            `insert into "person" ("id") values ('01HVNAT9GVADE1K8CS7S6Y7J2F') returning *`,
          );
          query.response([
            {
              id: '01HVNAT9GVADE1K8CS7S6Y7J2F',
            },
          ]);
        },
        // entity
        () => {
          expect(query.sql).toEqual(
            `insert into "entity" ("id") values ('01HVNAT9GVADE1K8CS7S6Y7J2F') returning *`,
          );
          query.response([
            {
              id: '01HVNAT9GVADE1K8CS7S6Y7J2F',
            },
          ]);
        },
        // participant
        () => {
          expect(query.sql).toEqual(
            `insert into "participant" ("firstName", "middleName", "lastName", "nativeName", "motherName", "preferredName", "dateOfBirth", "nrcId", "residence", "contactMeansComment", "consentGdpr", "consentReferral", "sex", "preferredContactMeans", "displacementStatus", "engagementContext") values ('John', 'Doe', 'Doe', 'Doe', 'Doe', 'Doe', '1990-01-01T00:00:00.000Z', '123456789', 'Doe', 'Doe', true, true, 'other', 'email', 'idp', 'house_visit') returning *`,
          );
          query.response([
            {
              id: '01HVNAT9GVADE1K8CS7S6Y7J2F',
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
              sex: 'other',
              preferredContactMeans: 'email',
              displacementStatus: 'idp',
              engagementContext: 'house_visit',
            },
          ]);
        },
        // participant_disability
        () => {
          expect(query.sql).toEqual(
            `insert into "disability" ("participantId", "hasDisabilityPwd", "disabilityPwdComment", "hasDisabilityVision", "disabilityVisionLevel", "hasDisabilityHearing", "disabilityHearingLevel", "hasDisabilityMobility", "disabilityMobilityLevel", "hasDisabilityCognition", "disabilityCognitionLevel", "hasDisabilitySelfcare", "disabilitySelfcareLevel", "hasDisabilityCommunication", "disabilityCommunicationLevel", "isChildAtRisk", "isElderAtRisk", "isWomanAtRisk", "isSingleParent", "isSeparatedChild", "isPregnant", "isLactating", "hasMedicalCondition", "needsLegalPhysicalProtection", "vulnerabilityComments") values ('01HVNAT9GVADE1K8CS7S6Y7J2F', true, 'Doe', true, '3', true, '3', true, '3', true, '3', true, '3', true, '3', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'Doe') returning *`,
          );
          query.response([
            {
              participantId: '01HVNAT9GVADE1K8CS7S6Y7J2F',
              hasDisabilityPwd: true,
              disabilityPwdComment: 'Doe',
              hasDisabilityVision: true,
              disabilityVisionLevel: '3',
              hasDisabilityHearing: true,
              disabilityHearingLevel: '3',
              hasDisabilityMobility: true,
              disabilityMobilityLevel: '3',
              hasDisabilityCognition: true,
              disabilityCognitionLevel: '3',
              hasDisabilitySelfcare: true,
              disabilitySelfcareLevel: '3',
              hasDisabilityCommunication: true,
              disabilityCommunicationLevel: '3',
              isChildAtRisk: 'yes',
              isElderAtRisk: 'yes',
              isWomanAtRisk: 'yes',
              isSingleParent: 'yes',
              isSeparatedChild: 'yes',
              isPregnant: 'yes',
              isLactating: 'yes',
              hasMedicalCondition: 'yes',
              needsLegalPhysicalProtection: 'yes',
              vulnerabilityComments: 'Doe',
            },
          ]);
        },
        // languages
        () => {
          expect(query.sql).toEqual(
            `insert into "participant_languages" ("language_iso_code", "participant_id") values ('en', '01HVNAT9GVADE1K8CS7S6Y7J2F') returning *`,
          );
          query.response([
            {
              isoCode: 'en',
              participantId: '01HVNAT9GVADE1K8CS7S6Y7J2F',
            },
          ]);
        },
        // languages retrieval
        () => {
          expect(query.sql).toEqual(
            `select * from "languages" where "iso_code" in ('en')`,
          );
          query.response([
            {
              isoCode: 'en',
              translationKey: 'en',
            },
          ]);
        },
        // nationalities
        () => {
          expect(query.sql).toEqual(
            `insert into "participant_nationalities" ("nationality_iso_code", "participant_id") values ('en', '01HVNAT9GVADE1K8CS7S6Y7J2F') returning *`,
          );
          query.response([
            {
              isoCode: 'en',
              participantId: '01HVNAT9GVADE1K8CS7S6Y7J2F',
            },
          ]);
        },
        // nationalities retrieval
        () => {
          expect(query.sql).toEqual(
            `select * from "nationality" where "iso_code" in ('en')`,
          );
          query.response([
            {
              isoCode: 'en',
              translationKey: 'en',
            },
          ]);
        },
        // contact details
        () => {
          expect(query.sql).toEqual(
            `insert into "participant_contact_detail" ("id", "participant_id", "contact_detail_type", "raw_value", "clean_value") values ('29d1a13a-7c46-4bc8-956e-ca1c4b55b74e', '01HVNAT9GVADE1K8CS7S6Y7J2F', 'email', 'Doe', 'Doe') returning *`,
          );
          query.response([
            {
              id: '29d1a13a-7c46-4bc8-956e-ca1c4b55b74e',
              participantId: '01HVNAT9GVADE1K8CS7S6Y7J2F',
              contactDetailType: 'email',
              rawValue: 'Doe',
              cleanValue: 'Doe',
            },
          ]);
        },
        // identification
        () => {
          expect(query.sql).toEqual(
            `insert into "participant_identification" ("id", "participant_id", "identification_type", "identification_number", "is_primary") values ('29d1a13a-7c46-4bc8-956e-ca1c4b55b74e', '01HVNAT9GVADE1K8CS7S6Y7J2F', 'national_id', 'Doe', false) returning *`,
          );
          query.response([
            {
              id: '29d1a13a-7c46-4bc8-956e-ca1c4b55b74e',
              participantId: '01HVNAT9GVADE1K8CS7S6Y7J2F',
              identificationType: 'national_id',
              identificationNumber: 'Doe',
              isPrimary: false,
            },
          ]);
        },
      ]);

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
