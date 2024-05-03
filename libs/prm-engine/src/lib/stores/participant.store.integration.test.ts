import { ulid } from 'ulidx';
import { v4 } from 'uuid';
import { faker } from '@faker-js/faker';

import {
  ContactDetailsGenerator,
  IdentificationGenerator,
  ParticipantGenerator,
} from '@nrcno/core-test-utils';
import { getDb } from '@nrcno/core-db';
import {
  ParticipantPartialUpdate,
  ParticipantUpdate,
} from '@nrcno/core-models';

import { ParticipantStore } from './participant.store';

jest.mock('ulidx', () => {
  const realUlid = jest.requireActual('ulidx').ulid;
  return {
    ulid: jest.fn().mockImplementation(() => realUlid()),
  };
});

jest.mock('uuid', () => {
  const realUuid = jest.requireActual('uuid').v4;
  return {
    v4: jest.fn().mockImplementation(() => realUuid()),
  };
});

function generateMockUlid() {
  const chars = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  let mockUlid = '';
  for (let i = 0; i < 26; i++) {
    mockUlid += chars[Math.floor(Math.random() * chars.length)];
  }
  return mockUlid;
}

describe('Participant store', () => {
  beforeAll(async () => {
    getDb(undefined, (global as any).db);
  });

  describe('create', () => {
    test('should throw an AlredyExistsError when creating a participant that already exists', async () => {
      const participantDefinition = ParticipantGenerator.generateDefinition();
      const id = generateMockUlid();
      (ulid as jest.Mock).mockReturnValue(id);
      (v4 as jest.Mock).mockReturnValue(faker.string.uuid());

      const participant = await ParticipantStore.create(participantDefinition);
      expect(participant).toBeDefined();

      await expect(
        ParticipantStore.create(participantDefinition),
      ).rejects.toThrow(); // ulid is mocked to return the same value
    });

    test('should create and get a participant', async () => {
      const participantDefinition = ParticipantGenerator.generateDefinition();
      const personId = generateMockUlid();
      const entityId = generateMockUlid();
      const participantId = generateMockUlid();
      const contactDetailsId = faker.string.uuid();
      const identificationId = faker.string.uuid();
      const expectedParticipant = ParticipantGenerator.generateEntity({
        ...participantDefinition,
        id: participantId,
        contactDetails: participantDefinition.contactDetails.map((cd) => ({
          ...cd,
          id: contactDetailsId,
        })),
        identification: participantDefinition.identification.map(
          (identification) => ({
            ...identification,
            id: identificationId,
          }),
        ),
        languages: participantDefinition.languages.map((lang) => ({
          ...lang,
          translationKey: `language__${lang.isoCode}`,
        })),
        nationalities: participantDefinition.nationalities.map((nat) => ({
          ...nat,
          translationKey: `nationality__${nat.isoCode}`,
        })),
      });

      (ulid as jest.Mock)
        .mockReturnValueOnce(personId)
        .mockReturnValueOnce(entityId)
        .mockReturnValueOnce(participantId);

      (v4 as jest.Mock)
        .mockReturnValueOnce(contactDetailsId)
        .mockReturnValueOnce(identificationId);

      const createdParticipant = await ParticipantStore.create(
        participantDefinition,
      );

      expect(createdParticipant).toEqual(expectedParticipant);

      const participant = await ParticipantStore.get(createdParticipant.id);

      expect(participant).toBeDefined();
      expect(participant).toEqual(expectedParticipant);
    });
  });

  describe('get', () => {
    test('should return null if participant id does not exist', async () => {
      const participant = await ParticipantStore.get('non-existing-id');

      expect(participant).toBeNull();
    });
  });

  describe('update', () => {
    beforeAll(() => {
      (ulid as jest.Mock).mockImplementation(() =>
        jest.requireActual('ulidx').ulid(),
      );
      (v4 as jest.Mock).mockImplementation(() =>
        jest.requireActual('uuid').v4(),
      );
    });
    test('should update a participant basic details', async () => {
      const participantDefinition = ParticipantGenerator.generateDefinition();
      const createdParticipant = await ParticipantStore.create(
        participantDefinition,
      );

      const participantUpdates = ParticipantGenerator.generateDefinition();

      const updatedParticipant = await ParticipantStore.update(
        createdParticipant.id,
        {
          firstName: participantUpdates.firstName,
          middleName: participantUpdates.middleName,
          lastName: participantUpdates.lastName,
          nativeName: participantUpdates.nativeName,
          motherName: participantUpdates.motherName,
          preferredName: participantUpdates.preferredName,
          dateOfBirth: participantUpdates.dateOfBirth,
          nrcId: participantUpdates.nrcId,
          residence: participantUpdates.residence,
          contactMeansComment: participantUpdates.contactMeansComment,
          consentGdpr: participantUpdates.consentGdpr,
          consentReferral: participantUpdates.consentReferral,
          sex: participantUpdates.sex,
          preferredContactMeans: participantUpdates.preferredContactMeans,
          displacementStatus: participantUpdates.displacementStatus,
          engagementContext: participantUpdates.engagementContext,
        },
      );

      expect(updatedParticipant).toBeDefined();
      expect(updatedParticipant).toMatchObject({
        firstName: participantUpdates.firstName,
        middleName: participantUpdates.middleName,
        lastName: participantUpdates.lastName,
        nativeName: participantUpdates.nativeName,
        motherName: participantUpdates.motherName,
        preferredName: participantUpdates.preferredName,
        dateOfBirth: participantUpdates.dateOfBirth,
        nrcId: participantUpdates.nrcId,
        residence: participantUpdates.residence,
        contactMeansComment: participantUpdates.contactMeansComment,
        consentGdpr: participantUpdates.consentGdpr,
        consentReferral: participantUpdates.consentReferral,
        sex: participantUpdates.sex,
        preferredContactMeans: participantUpdates.preferredContactMeans,
        displacementStatus: participantUpdates.displacementStatus,
        engagementContext: participantUpdates.engagementContext,
      });
    });

    test('should update a participant disabilities', async () => {
      const participantDefinition = ParticipantGenerator.generateDefinition();
      const createdParticipant = await ParticipantStore.create(
        participantDefinition,
      );

      const participantUpdateDisabilities =
        ParticipantGenerator.generateDefinition().disabilities;

      const updatedParticipant = await ParticipantStore.update(
        createdParticipant.id,
        {
          disabilities: participantUpdateDisabilities,
        },
      );

      expect(updatedParticipant).toBeDefined();
      expect(updatedParticipant.disabilities).toEqual(
        participantUpdateDisabilities,
      );
    });

    test('should update a participant contact details', async () => {
      const contactDetailsToKeep = ContactDetailsGenerator.generateDefinition();
      const contactDetailsToUpdate =
        ContactDetailsGenerator.generateDefinition();
      const contactDetailsToRemove =
        ContactDetailsGenerator.generateDefinition();
      const participantDefinition = ParticipantGenerator.generateDefinition({
        contactDetails: [
          contactDetailsToKeep,
          contactDetailsToUpdate,
          contactDetailsToRemove,
        ],
      });
      const createdParticipant = await ParticipantStore.create(
        participantDefinition,
      );

      const contactDetailsToAdd = ContactDetailsGenerator.generateDefinition();

      const contactDetails = {
        add: [contactDetailsToAdd],
        update: createdParticipant.contactDetails
          .filter((cd) => cd.value === contactDetailsToUpdate.value)
          .map((cd) => ({
            ...cd,
            value: '123456789',
          })),
        remove: createdParticipant.contactDetails
          .filter((cd) => cd.value === contactDetailsToRemove.value)
          .map((cd) => cd.id),
      };

      const update: ParticipantPartialUpdate = {
        contactDetails,
      };

      const updatedParticipant = await ParticipantStore.update(
        createdParticipant.id,
        update,
      );

      expect(updatedParticipant).toBeDefined();
      expect(updatedParticipant.contactDetails).toHaveLength(3);
      expect(updatedParticipant.contactDetails).toContainEqual({
        ...contactDetailsToKeep,
        id: expect.any(String),
      });
      expect(updatedParticipant.contactDetails).toContainEqual({
        ...contactDetailsToUpdate,
        value: '123456789',
        id: expect.any(String),
      });
      expect(updatedParticipant.contactDetails).toContainEqual({
        ...contactDetailsToAdd,
        id: expect.any(String),
      });
    });

    test('should update a participant identification', async () => {
      const identificationToKeep = IdentificationGenerator.generateDefinition();
      const identificationToUpdate =
        IdentificationGenerator.generateDefinition();
      const identificationToRemove =
        IdentificationGenerator.generateDefinition();
      const participantDefinition = ParticipantGenerator.generateDefinition({
        identification: [
          identificationToKeep,
          identificationToUpdate,
          identificationToRemove,
        ],
      });
      const createdParticipant = await ParticipantStore.create(
        participantDefinition,
      );

      const identificationToAdd = IdentificationGenerator.generateDefinition();

      const identification = {
        add: [identificationToAdd],
        update: createdParticipant.identification
          .filter(
            (id) =>
              id.identificationNumber ===
              identificationToUpdate.identificationNumber,
          )
          .map((id) => ({
            ...id,
            identificationNumber: '987654321',
          })),
        remove: createdParticipant.identification
          .filter(
            (id) =>
              id.identificationNumber ===
              identificationToRemove.identificationNumber,
          )
          .map((id) => id.id),
      };

      const update: ParticipantPartialUpdate = {
        identification,
      };

      const updatedParticipant = await ParticipantStore.update(
        createdParticipant.id,
        update,
      );

      expect(updatedParticipant).toBeDefined();
      expect(updatedParticipant.identification).toHaveLength(3);
      expect(updatedParticipant.identification).toContainEqual({
        ...identificationToKeep,
        id: expect.any(String),
      });
      expect(updatedParticipant.identification).toContainEqual({
        ...identificationToUpdate,
        identificationNumber: '987654321',
        id: expect.any(String),
      });
      expect(updatedParticipant.identification).toContainEqual({
        ...identificationToAdd,
        id: expect.any(String),
      });
    });

    test('should update a participant languages', async () => {
      const languageToKeep = {
        isoCode: 'en',
      };
      const languageToRemove = {
        isoCode: 'fr',
      };
      const participantDefinition = ParticipantGenerator.generateDefinition({
        languages: [languageToKeep, languageToRemove],
      });
      const createdParticipant = await ParticipantStore.create(
        participantDefinition,
      );

      const languageToAdd = {
        isoCode: 'ar',
      };

      const languages = {
        add: [languageToAdd],
        remove: [languageToRemove.isoCode],
      };

      const update: ParticipantPartialUpdate = {
        languages,
      };

      const updatedParticipant = await ParticipantStore.update(
        createdParticipant.id,
        update,
      );

      expect(updatedParticipant).toBeDefined();
      expect(updatedParticipant.languages).toHaveLength(2);
      expect(updatedParticipant.languages).toContainEqual({
        ...languageToKeep,
        translationKey: `language__${languageToKeep.isoCode}`,
      });
      expect(updatedParticipant.languages).toContainEqual({
        ...languageToAdd,
        translationKey: `language__${languageToAdd.isoCode}`,
      });
    });

    test('should update a participant nationalities', async () => {
      const nationalityToKeep = {
        isoCode: 'en',
      };
      const nationalityToRemove = {
        isoCode: 'fr',
      };
      const participantDefinition = ParticipantGenerator.generateDefinition({
        nationalities: [nationalityToKeep, nationalityToRemove],
      });
      const createdParticipant = await ParticipantStore.create(
        participantDefinition,
      );

      const nationalityToAdd = {
        isoCode: 'ar',
      };
      const nationalities = {
        add: [nationalityToAdd],
        remove: [nationalityToRemove.isoCode],
      };

      const update: ParticipantPartialUpdate = {
        nationalities,
      };
      const updatedParticipant = await ParticipantStore.update(
        createdParticipant.id,
        update,
      );

      expect(updatedParticipant).toBeDefined();
      expect(updatedParticipant.nationalities).toHaveLength(2);
      expect(updatedParticipant.nationalities).toContainEqual({
        ...nationalityToKeep,
        translationKey: `nationality__${nationalityToKeep.isoCode}`,
      });
      expect(updatedParticipant.nationalities).toContainEqual({
        ...nationalityToAdd,
        translationKey: `nationality__${nationalityToAdd.isoCode}`,
      });
    });
  });
});
