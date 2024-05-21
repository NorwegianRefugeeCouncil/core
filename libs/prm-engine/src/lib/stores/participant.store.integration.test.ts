import { ulid } from 'ulidx';
import { v4 } from 'uuid';
import { faker } from '@faker-js/faker';

import {
  IdentificationGenerator,
  ParticipantGenerator,
} from '@nrcno/core-test-utils';
import { getDb } from '@nrcno/core-db';
import { ParticipantPartialUpdate } from '@nrcno/core-models';

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

  afterEach(async () => {
    // TODO: implement cleaning up the database after each test in a better way.
    // Either move this to a global jest test setup or use a transaction for each test
    const db = getDb();
    await db.raw('TRUNCATE TABLE participants CASCADE');
  });

  describe('create', () => {
    test('should throw an AlredyExistsError when creating a participant that already exists', async () => {
      const participantDefinition = ParticipantGenerator.generateDefinition();
      const id = generateMockUlid();
      (ulid as jest.Mock).mockReturnValue(id);
      (v4 as jest.Mock).mockReturnValueOnce(faker.string.uuid());
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
      const contactDetailsIdEmail = faker.string.uuid();
      const contactDetailsIdPhone = faker.string.uuid();
      const identificationId = faker.string.uuid();
      const expectedParticipant = ParticipantGenerator.generateEntity({
        ...participantDefinition,
        id: participantId,
        contactDetails: {
          emails: participantDefinition.contactDetails.emails.map((cd) => ({
            ...cd,
            id: contactDetailsIdEmail,
          })),
          phones: participantDefinition.contactDetails.phones.map((cd) => ({
            ...cd,
            id: contactDetailsIdPhone,
          })),
        },
        identification: participantDefinition.identification.map(
          (identification) => ({
            ...identification,
            id: identificationId,
          }),
        ),
        languages: participantDefinition.languages,
        nationalities: participantDefinition.nationalities,
      });

      (ulid as jest.Mock)
        .mockReturnValueOnce(personId)
        .mockReturnValueOnce(entityId)
        .mockReturnValueOnce(participantId);

      (v4 as jest.Mock)
        .mockReturnValueOnce(contactDetailsIdEmail)
        .mockReturnValueOnce(contactDetailsIdPhone)
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

  describe('count', () => {
    beforeAll(() => {
      (ulid as jest.Mock).mockImplementation(() =>
        jest.requireActual('ulidx').ulid(),
      );
      (v4 as jest.Mock).mockImplementation(() =>
        jest.requireActual('uuid').v4(),
      );
    });
    test('should return the number of participants', async () => {
      const participantDefinition = ParticipantGenerator.generateDefinition();

      await ParticipantStore.create(participantDefinition);

      const count = await ParticipantStore.count();

      expect(count).toBe(1);
    });
  });

  describe('list', () => {
    beforeAll(() => {
      (ulid as jest.Mock).mockImplementation(() =>
        jest.requireActual('ulidx').ulid(),
      );
      (v4 as jest.Mock).mockImplementation(() =>
        jest.requireActual('uuid').v4(),
      );
    });

    test('should return a list of participants', async () => {
      const primaryIdentification = IdentificationGenerator.generateDefinition({
        isPrimary: true,
      });
      const participantDefinition = ParticipantGenerator.generateDefinition({
        identification: [primaryIdentification],
      });
      const participant = await ParticipantStore.create(participantDefinition);

      const participants = await ParticipantStore.list({
        startIndex: 0,
        pageSize: 50,
      });

      expect(participants).toBeDefined();
      expect(participants).toHaveLength(1);
      expect(participants[0]).toEqual({
        id: participant.id,
        firstName: participant.firstName,
        lastName: participant.lastName,
        dateOfBirth: participant.dateOfBirth,
        sex: participant.sex,
        displacementStatus: participant.displacementStatus,
        identification: participant.identification,
        nationalities: [participant.nationalities[0]],
        contactDetails: {
          emails: [participant.contactDetails.emails[0]],
          phones: [participant.contactDetails.phones[0]],
        },
      });
    });

    test('should return a paginated list of participants, sorted by lastname', async () => {
      const firstParticipantDefinition =
        ParticipantGenerator.generateDefinition({ lastName: 'Allende' });
      const secondParticipantDefinition =
        ParticipantGenerator.generateDefinition({ lastName: 'Bach' });
      const firstParticipant = await ParticipantStore.create(
        firstParticipantDefinition,
      );
      await ParticipantStore.create(secondParticipantDefinition);

      const participants = await ParticipantStore.list({
        startIndex: 0,
        pageSize: 1,
      });

      expect(participants).toBeDefined();
      expect(participants).toHaveLength(1);
      expect(participants[0].id).toEqual(firstParticipant.id);
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
      const phoneToKeep = faker.phone.number();
      const phoneToUpdate = faker.phone.number();
      const phoneToRemove = faker.phone.number();
      const emailToKeep = faker.internet.email();
      const emailToUpdate = faker.internet.email();
      const emailToRemove = faker.internet.email();
      const participantDefinition = ParticipantGenerator.generateDefinition({
        contactDetails: {
          emails: [
            { value: emailToKeep },
            { value: emailToUpdate },
            { value: emailToRemove },
          ],
          phones: [
            { value: phoneToKeep },
            { value: phoneToUpdate },
            { value: phoneToRemove },
          ],
        },
      });
      const createdParticipant = await ParticipantStore.create(
        participantDefinition,
      );

      const phoneToAdd = faker.phone.number();
      const emailToAdd = faker.internet.email();
      const updatedPhone = faker.phone.number();
      const updatedEmail = faker.internet.email();

      const contactDetails = {
        phones: {
          add: [{ value: phoneToAdd }],
          update: createdParticipant.contactDetails.phones
            .filter((cd) => cd.value === phoneToUpdate)
            .map((cd) => ({
              ...cd,
              value: updatedPhone,
            })),
          remove: createdParticipant.contactDetails.phones
            .filter((cd) => cd.value === phoneToRemove)
            .map((cd) => cd.id),
        },
        emails: {
          add: [{ value: emailToAdd }],
          update: createdParticipant.contactDetails.emails
            .filter((cd) => cd.value === emailToUpdate)
            .map((cd) => ({
              ...cd,
              value: updatedEmail,
            })),
          remove: createdParticipant.contactDetails.emails
            .filter((cd) => cd.value === emailToRemove)
            .map((cd) => cd.id),
        },
      };

      const update: ParticipantPartialUpdate = {
        contactDetails,
      };

      const updatedParticipant = await ParticipantStore.update(
        createdParticipant.id,
        update,
      );

      expect(updatedParticipant.contactDetails).toBeDefined();
      expect(updatedParticipant.contactDetails.emails).toHaveLength(3);
      expect(updatedParticipant.contactDetails.emails).toEqual(
        expect.arrayContaining([
          {
            value: emailToKeep,
            id: expect.any(String),
          },
          {
            value: updatedEmail,
            id: expect.any(String),
          },
          {
            value: emailToAdd,
            id: expect.any(String),
          },
        ]),
      );
      expect(updatedParticipant.contactDetails.phones).toHaveLength(3);
      expect(updatedParticipant.contactDetails.phones).toEqual(
        expect.arrayContaining([
          {
            value: phoneToKeep,
            id: expect.any(String),
          },
          {
            value: updatedPhone,
            id: expect.any(String),
          },
          {
            value: phoneToAdd,
            id: expect.any(String),
          },
        ]),
      );
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
      const languageToKeep = 'en';
      const languageToRemove = 'fr';
      const participantDefinition = ParticipantGenerator.generateDefinition({
        languages: [languageToKeep, languageToRemove],
      });
      const createdParticipant = await ParticipantStore.create(
        participantDefinition,
      );

      const languageToAdd = 'ar';

      const languages = {
        add: [languageToAdd],
        remove: [languageToRemove],
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
      expect(updatedParticipant.languages).toContainEqual(languageToKeep);
      expect(updatedParticipant.languages).toContainEqual(languageToAdd);
    });

    test('should update a participant nationalities', async () => {
      const nationalityToKeep = 'en';
      const nationalityToRemove = 'fr';
      const participantDefinition = ParticipantGenerator.generateDefinition({
        nationalities: [nationalityToKeep, nationalityToRemove],
      });
      const createdParticipant = await ParticipantStore.create(
        participantDefinition,
      );

      const nationalityToAdd = 'ar';
      const nationalities = {
        add: [nationalityToAdd],
        remove: [nationalityToRemove],
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
      expect(updatedParticipant.nationalities).toContainEqual(
        nationalityToKeep,
      );
      expect(updatedParticipant.nationalities).toContainEqual(nationalityToAdd);
    });
  });
});
