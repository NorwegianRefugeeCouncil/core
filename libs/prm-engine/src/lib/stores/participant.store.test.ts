import * as mockDb from 'mock-knex';

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
  contactDetails: [
    ...(overrides.contactDetails || [
      {
        contactDetailType: 'email',
        value: 'Doe',
      },
    ]),
  ],
  identification: [
    ...(overrides.identification || [
      {
        identificationType: 'national_id',
        identificationNumber: 'Doe',
        isPrimary: false,
      },
    ]),
  ],
});

const ulidID = '01HVNAT9GVADE1K8CS7S6Y7J2F';
const uuidID = '29d1a13a-7c46-4bc8-956e-ca1c4b55b74e';

const buildQueries =
  (error = false) =>
  (query: mockDb.QueryDetails, step: number) => {
    const queries = [
      // Begin transaction
      () => {
        expect(query.sql).toEqual('BEGIN;');
        query.response([]);
      },
      // person
      () => {
        expect(query.sql).toEqual(`insert into "person" ("id") values ($1)`);
        query.response([]);
      },
      // entity
      () => {
        expect(query.sql).toEqual(`insert into "entity" ("id") values ($1)`);
        query.response([]);
      },
      // participant
      () => {
        expect(query.sql).toEqual(
          `insert into "participant" ("consent_gdpr", "consent_referral", "contact_means_comment", "date_of_birth", "displacement_status", "engagement_context", "entity_id", "first_name", "id", "last_name", "middle_name", "mother_name", "native_name", "nrc_id", "person_id", "preferred_contact_means", "preferred_name", "residence", "sex") values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
        );
        query.response([]);
      },
      // participant_disability
      () => {
        expect(query.sql).toEqual(
          `insert into "participant_disability" ("disability_cognition_level", "disability_communication_level", "disability_hearing_level", "disability_mobility_level", "disability_pwd_comment", "disability_selfcare_level", "disability_vision_level", "has_disability_cognition", "has_disability_communication", "has_disability_hearing", "has_disability_mobility", "has_disability_pwd", "has_disability_selfcare", "has_disability_vision", "has_medical_condition", "is_child_at_risk", "is_elder_at_risk", "is_lactating", "is_pregnant", "is_separated_child", "is_single_parent", "is_woman_at_risk", "needs_legal_physical_protection", "participant_id", "vulnerability_comments") values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)`,
        );
        query.response([]);
      },
      // languages
      () => {
        expect(query.sql).toEqual(
          `insert into "participant_languages" ("language_iso_code", "participant_id") values ($1, $2)`,
        );
        query.response([]);
      },
      // languages retrieval
      () => {
        expect(query.sql).toEqual(
          `select * from "language" where "iso_code" in ($1)`,
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
          `insert into "participant_nationalities" ("nationality_iso_code", "participant_id") values ($1, $2)`,
        );
        query.response([]);
      },
      // nationalities retrieval
      () => {
        expect(query.sql).toEqual(
          `select * from "nationality" where "iso_code" in ($1)`,
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
          `insert into "participant_contact_detail" ("clean_value", "contact_detail_type", "id", "participant_id", "raw_value") values ($1, $2, $3, $4, $5)`,
        );
        query.response([]);
      },
      // identification
      () => {
        expect(query.sql).toEqual(
          `insert into "participant_identification" ("id", "identification_number", "identification_type", "is_primary", "participant_id") values ($1, $2, $3, $4, $5)`,
        );
        query.response([]);
      },
      // Commit transaction
      () => {
        expect(query.sql).toEqual(error ? 'ROLLBACK;' : 'COMMIT;');
        query.response([]);
      },
    ];

    queries[step - 1]();
  };

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

  describe('create', () => {
    it('should create a participant', async () => {
      const tracker = mockDb.getTracker();
      tracker.install();

      const participantDefinition: ParticipantDefinition =
        makeParticipantDefinition();

      tracker.on('query', buildQueries());

      const createdParticipant = await ParticipantStore.create(
        participantDefinition,
      );

      expect(createdParticipant).toBeDefined();
      expect(createdParticipant).toEqual({
        id: ulidID,
        ...participantDefinition,
        disabilities: {
          ...participantDefinition.disabilities,
        },
        contactDetails: participantDefinition.contactDetails.map((cd) => ({
          ...cd,
          id: uuidID,
        })),
        identification: participantDefinition.identification.map((id) => ({
          ...id,
          id: uuidID,
        })),
        languages: [
          {
            isoCode: 'en',
            translationKey: 'en',
          },
        ],
        nationalities: [
          {
            isoCode: 'en',
            translationKey: 'en',
          },
        ],
      });
    });

    // This test isn't great because in reality this should fail during the query execution but it actually fails during the parsing
    it('should throw an error when creating a participant with invalid data', async () => {
      const tracker = mockDb.getTracker();
      tracker.install();

      const participantDefinition = makeParticipantDefinition({
        sex: 'invalid',
      });

      tracker.on('query', buildQueries());

      try {
        await ParticipantStore.create(participantDefinition);
      } catch (error) {
        console.log(error);
        expect(error).toBeDefined();
      }
    });

    it('should throw an AlredyExistsError when creating a participant that already exists', async () => {
      const tracker = mockDb.getTracker();
      tracker.install();

      const participantDefinition = makeParticipantDefinition();

      tracker.on('query', buildQueries(true));

      const participant = await ParticipantStore.create(participantDefinition);
      expect(participant).toBeDefined();

      await expect(
        ParticipantStore.create(participantDefinition),
      ).rejects.toThrow(); // ulid is mocked to return the same value
    });
  });
});
