import { ulid } from 'ulidx';
import { v4 } from 'uuid';
import { faker } from '@faker-js/faker';

import {
  IdentificationGenerator,
  IndividualGenerator,
} from '@nrcno/core-test-utils';
import { getDb } from '@nrcno/core-db';
import {
  IdentificationType,
  IndividualPartialUpdate,
  SortingDirection,
} from '@nrcno/core-models';

import { IndividualStore } from './individual.store';

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

describe('Individual store', () => {
  beforeAll(async () => {
    getDb(undefined, (global as any).db);
  });

  afterEach(async () => {
    // TODO: implement cleaning up the database after each test in a better way.
    // Either move this to a global jest test setup or use a transaction for each test
    const db = getDb();
    await db.raw('TRUNCATE TABLE individuals CASCADE');
  });

  describe('create', () => {
    test('should throw an AlredyExistsError when creating a individual that already exists', async () => {
      const individualDefinition = IndividualGenerator.generateDefinition();
      const id = generateMockUlid();
      (ulid as jest.Mock).mockReturnValue(id);
      (v4 as jest.Mock).mockReturnValueOnce(faker.string.uuid());
      (v4 as jest.Mock).mockReturnValue(faker.string.uuid());

      const individual = await IndividualStore.create(individualDefinition);
      expect(individual).toBeDefined();

      await expect(
        IndividualStore.create(individualDefinition),
      ).rejects.toThrow(); // ulid is mocked to return the same value
    });

    test('should create and get a individual', async () => {
      const individualDefinition = IndividualGenerator.generateDefinition();
      const personId = generateMockUlid();
      const entityId = generateMockUlid();
      const individualId = generateMockUlid();
      const emailId = faker.string.uuid();
      const phoneId = faker.string.uuid();
      const identificationId = faker.string.uuid();
      const expectedIndividual = IndividualGenerator.generateEntity({
        ...individualDefinition,
        id: individualId,
        emails: individualDefinition.emails.map((cd) => ({
          ...cd,
          id: emailId,
        })),
        phones: individualDefinition.phones.map((cd) => ({
          ...cd,
          id: phoneId,
        })),
        identification: individualDefinition.identification.map(
          (identification) => ({
            ...identification,
            id: identificationId,
          }),
        ),
        languages: individualDefinition.languages,
        nationalities: individualDefinition.nationalities,
      });

      (ulid as jest.Mock)
        .mockReturnValueOnce(personId)
        .mockReturnValueOnce(entityId)
        .mockReturnValueOnce(individualId);

      (v4 as jest.Mock)
        .mockReturnValueOnce(emailId)
        .mockReturnValueOnce(phoneId)
        .mockReturnValueOnce(identificationId);

      const createdIndividual =
        await IndividualStore.create(individualDefinition);

      expect(createdIndividual).toEqual(expectedIndividual);

      const individual = await IndividualStore.get(createdIndividual.id);

      expect(individual).toBeDefined();
      expect(individual).toEqual(expectedIndividual);
    });
  });

  describe('get', () => {
    test('should return null if individual id does not exist', async () => {
      const individual = await IndividualStore.get('non-existing-id');

      expect(individual).toBeNull();
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
    test('should return the number of individuals', async () => {
      const individualDefinition = IndividualGenerator.generateDefinition();

      await IndividualStore.create(individualDefinition);

      const count = await IndividualStore.count({});

      expect(count).toBe(1);
    });

    test('should return zero if there are no individuals matching the filter', async () => {
      const count = await IndividualStore.count({ id: 'non-existing-id' });

      expect(count).toBe(0);
    });

    test('should return the number of individuals, filtered by id', async () => {
      const individualDefinition = IndividualGenerator.generateDefinition();
      const individual = await IndividualStore.create(individualDefinition);
      await IndividualStore.create(IndividualGenerator.generateDefinition());

      const count = await IndividualStore.count({
        id: individual.id,
      });

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

    test('should return a list of individuals', async () => {
      const individualDefinition = IndividualGenerator.generateDefinition();
      const individual = await IndividualStore.create(individualDefinition);

      const individuals = await IndividualStore.list({
        startIndex: 0,
        pageSize: 50,
      });

      expect(individuals).toBeDefined();
      expect(individuals).toHaveLength(1);
      expect(individuals[0]).toEqual({
        id: individual.id,
        firstName: individual.firstName,
        lastName: individual.lastName,
        dateOfBirth: individual.dateOfBirth,
        sex: individual.sex,
        displacementStatus: individual.displacementStatus,
        identification: [individual.identification[0]],
        nationalities: [individual.nationalities[0]],
        emails: [individual.emails[0]],
        phones: [individual.phones[0]],
      });
    });

    test('should return a paginated list of individuals, sorted by lastname by default', async () => {
      const firstIndividualDefinition = IndividualGenerator.generateDefinition({
        lastName: 'Allende',
      });
      const secondIndividualDefinition = IndividualGenerator.generateDefinition(
        { lastName: 'Bach' },
      );
      const firstIndividual = await IndividualStore.create(
        firstIndividualDefinition,
      );
      await IndividualStore.create(secondIndividualDefinition);

      const individuals = await IndividualStore.list({
        startIndex: 0,
        pageSize: 1,
      });

      expect(individuals).toBeDefined();
      expect(individuals).toHaveLength(1);
      expect(individuals[0].id).toEqual(firstIndividual.id);
    });

    test('should return a paginated list of individuals, sorted by firstname descending', async () => {
      const firstIndividualDefinition = IndividualGenerator.generateDefinition({
        firstName: 'Isabel',
      });
      const secondIndividualDefinition = IndividualGenerator.generateDefinition(
        { firstName: 'Richard' },
      );
      await IndividualStore.create(firstIndividualDefinition);
      const secondIndividual = await IndividualStore.create(
        secondIndividualDefinition,
      );

      const individuals = await IndividualStore.list(
        {
          startIndex: 0,
          pageSize: 1,
        },
        {
          sort: 'firstName',
          direction: SortingDirection.Desc,
        },
      );

      expect(individuals).toBeDefined();
      expect(individuals).toHaveLength(1);
      expect(individuals[0].id).toEqual(secondIndividual.id);
    });

    test('should return a paginated list of individuals, sorted by nationality descending', async () => {
      const firstIndividualDefinition = IndividualGenerator.generateDefinition({
        nationalities: ['ALA'],
      });
      const secondIndividualDefinition = IndividualGenerator.generateDefinition(
        { nationalities: ['AFG'] },
      );
      const firstIndividual = await IndividualStore.create(
        firstIndividualDefinition,
      );
      await IndividualStore.create(secondIndividualDefinition);

      const individuals = await IndividualStore.list(
        {
          startIndex: 0,
          pageSize: 1,
        },
        {
          sort: 'nationalities',
          direction: SortingDirection.Desc,
        },
      );

      expect(individuals).toBeDefined();
      expect(individuals).toHaveLength(1);
      expect(individuals[0].id).toEqual(firstIndividual.id);
    });

    test('should return a paginated list of individuals, sorted by email ascending', async () => {
      const firstIndividualDefinition = IndividualGenerator.generateDefinition({
        emails: [{ value: 'a@test.com' }],
        phones: [],
      });
      const secondIndividualDefinition = IndividualGenerator.generateDefinition(
        {
          emails: [{ value: 'b@test.com' }],
          phones: [],
        },
      );
      const firstIndividual = await IndividualStore.create(
        firstIndividualDefinition,
      );
      await IndividualStore.create(secondIndividualDefinition);
      const individuals = await IndividualStore.list(
        {
          startIndex: 0,
          pageSize: 1,
        },
        {
          sort: 'emails',
          direction: SortingDirection.Asc,
        },
      );

      expect(individuals).toBeDefined();
      expect(individuals).toHaveLength(1);
      expect(individuals[0].id).toEqual(firstIndividual.id);
    });

    test('should return a paginated list of individuals, sorted by primary identification number descending', async () => {
      const firstIndividualDefinition = IndividualGenerator.generateDefinition({
        identification: [
          {
            identificationNumber: '456',
            identificationType: IdentificationType.NationalId,
          },
        ],
      });
      const secondIndividualDefinition = IndividualGenerator.generateDefinition(
        {
          identification: [
            {
              identificationNumber: '123',
              identificationType: IdentificationType.NationalId,
            },
          ],
        },
      );
      const firstIndividual = await IndividualStore.create(
        firstIndividualDefinition,
      );
      await IndividualStore.create(secondIndividualDefinition);
      const individuals = await IndividualStore.list(
        {
          startIndex: 0,
          pageSize: 1,
        },
        {
          sort: 'identificationNumber',
          direction: SortingDirection.Desc,
        },
      );

      expect(individuals).toBeDefined();
      expect(individuals).toHaveLength(1);
      expect(individuals[0].id).toEqual(firstIndividual.id);
    });

    test('should return a paginated list of individuals, sorted by id ascending', async () => {
      const individualDefinition = IndividualGenerator.generateDefinition();
      const individual1 = await IndividualStore.create(individualDefinition);
      const individual2 = await IndividualStore.create(individualDefinition);
      const expectedFirstIndividualId =
        individual1.id < individual2.id ? individual1.id : individual2.id;

      const individuals = await IndividualStore.list(
        {
          startIndex: 0,
          pageSize: 1,
        },
        {
          sort: 'id',
          direction: SortingDirection.Asc,
        },
      );

      expect(individuals).toBeDefined();
      expect(individuals).toHaveLength(1);
      expect(individuals[0].id).toEqual(expectedFirstIndividualId);
    });

    test('should return an empty list if there are no individuals matching the filters', async () => {
      const individuals = await IndividualStore.list(
        {
          startIndex: 0,
          pageSize: 50,
        },
        {
          sort: 'id',
          direction: SortingDirection.Asc,
        },
        {
          id: 'non-existing-id',
        },
      );

      expect(individuals).toBeDefined();
      expect(individuals).toHaveLength(0);
    });

    test('should return a list of individuals, filtered by id', async () => {
      const individualDefinition = IndividualGenerator.generateDefinition();
      const individual = await IndividualStore.create(individualDefinition);
      await IndividualStore.create(IndividualGenerator.generateDefinition());

      const individuals = await IndividualStore.list(
        {
          startIndex: 0,
          pageSize: 50,
        },
        {
          sort: 'id',
          direction: SortingDirection.Asc,
        },
        {
          id: individual.id,
        },
      );

      expect(individuals).toBeDefined();
      expect(individuals).toHaveLength(1);
      expect(individuals[0].id).toEqual(individual.id);
    });

    test('should return a list of individuals, filtered by combination of names', async () => {
      const individualDefinition = IndividualGenerator.generateDefinition();
      const individual = await IndividualStore.create(individualDefinition);
      await IndividualStore.create(IndividualGenerator.generateDefinition());

      const individuals = await IndividualStore.list(
        {
          startIndex: 0,
          pageSize: 50,
        },
        {
          sort: 'id',
          direction: SortingDirection.Asc,
        },
        {
          firstName: individual.firstName!,
          lastName: individual.lastName!,
          middleName: individual.middleName!,
        },
      );

      expect(individuals).toBeDefined();
      expect(individuals).toHaveLength(1);
      expect(individuals[0].id).toEqual(individual.id);
    });

    test('should return a list of individuals, filtered by date of birth range', async () => {
      const dateOfBirthMin = new Date('2000-01-01');
      const dateOfBirthMax = new Date('2000-12-31');
      const dateOfBirthInRange = new Date('2000-06-15');
      const dateOfBirthOutOfRange = new Date('2001-01-01');
      const individualDefinition = IndividualGenerator.generateDefinition({
        dateOfBirth: dateOfBirthInRange,
      });
      const individual = await IndividualStore.create(individualDefinition);
      await IndividualStore.create(
        IndividualGenerator.generateDefinition({
          dateOfBirth: dateOfBirthOutOfRange,
        }),
      );

      const individuals = await IndividualStore.list(
        {
          startIndex: 0,
          pageSize: 50,
        },
        {
          sort: 'id',
          direction: SortingDirection.Asc,
        },
        {
          dateOfBirthMin,
          dateOfBirthMax,
        },
      );

      expect(individuals).toBeDefined();
      expect(individuals).toHaveLength(1);
      expect(individuals[0].id).toEqual(individual.id);
    });

    test('should return a list of individuals, filtered by nationality', async () => {
      const individualDefinition = IndividualGenerator.generateDefinition({
        nationalities: ['AFG', 'ALA'],
      });
      const individual = await IndividualStore.create(individualDefinition);
      await IndividualStore.create(
        IndividualGenerator.generateDefinition({
          nationalities: ['ALB', 'ALA'],
        }),
      );

      const individuals = await IndividualStore.list(
        {
          startIndex: 0,
          pageSize: 50,
        },
        {
          sort: 'id',
          direction: SortingDirection.Asc,
        },
        {
          nationalities: 'AFG',
        },
      );

      expect(individuals).toBeDefined();
      expect(individuals).toHaveLength(1);
      expect(individuals[0].id).toEqual(individual.id);
    });

    test('should return a list of individuals, filtered by phone', async () => {
      const individualDefinition = IndividualGenerator.generateDefinition({
        phones: [{ value: '123' }, { value: '456' }],
        emails: [],
      });
      const individual = await IndividualStore.create(individualDefinition);
      const anotherIndividualSamePhone = await IndividualStore.create(
        IndividualGenerator.generateDefinition({
          phones: [{ value: '456' }, { value: '789' }],
          emails: [],
        }),
      );

      const individuals = await IndividualStore.list(
        {
          startIndex: 0,
          pageSize: 50,
        },
        {
          sort: 'id',
          direction: SortingDirection.Asc,
        },
        {
          phones: '456',
        },
      );

      expect(individuals).toBeDefined();
      expect(individuals).toHaveLength(2);
      const individualIds = individuals.map((p) => p.id);
      expect(individualIds).toContain(individual.id);
      expect(individualIds).toContain(anotherIndividualSamePhone.id);
    });

    test('should return a list of individuals, filtered by email', async () => {
      const individualDefinition = IndividualGenerator.generateDefinition({
        phones: [],
        emails: [{ value: 'test@nrc.no' }, { value: 'test2@nrc.no' }],
      });
      const individual = await IndividualStore.create(individualDefinition);
      await IndividualStore.create(
        IndividualGenerator.generateDefinition({
          phones: [],
          emails: [{ value: 'test3@nrc.no' }],
        }),
      );
      const individuals = await IndividualStore.list(
        {
          startIndex: 0,
          pageSize: 50,
        },
        {
          sort: 'id',
          direction: SortingDirection.Asc,
        },
        {
          emails: 'test@nrc.no',
        },
      );

      expect(individuals).toBeDefined();
      expect(individuals).toHaveLength(1);
      expect(individuals[0].id).toEqual(individual.id);
    });

    test('should return a list of individuals, filtered by identification number', async () => {
      const individualDefinition = IndividualGenerator.generateDefinition({
        identification: [
          {
            identificationNumber: '123',
            identificationType: IdentificationType.NationalId,
          },
          {
            identificationNumber: '456',
            identificationType: IdentificationType.NationalId,
          },
        ],
      });
      const individual = await IndividualStore.create(individualDefinition);
      await IndividualStore.create(
        IndividualGenerator.generateDefinition({
          identification: [
            {
              identificationNumber: '789',
              identificationType: IdentificationType.NationalId,
            },
            {
              identificationNumber: '012',
              identificationType: IdentificationType.NationalId,
            },
          ],
        }),
      );

      const individuals = await IndividualStore.list(
        {
          startIndex: 0,
          pageSize: 50,
        },
        {
          sort: 'id',
          direction: SortingDirection.Asc,
        },
        {
          identificationNumber: '456',
        },
      );

      expect(individuals).toBeDefined();
      expect(individuals).toHaveLength(1);
      expect(individuals[0].id).toEqual(individual.id);
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
    test('should update a individual basic details', async () => {
      const individualDefinition = IndividualGenerator.generateDefinition();
      const createdIndividual =
        await IndividualStore.create(individualDefinition);

      const individualUpdates = IndividualGenerator.generateDefinition();

      const updatedIndividual = await IndividualStore.update(
        createdIndividual.id,
        {
          firstName: individualUpdates.firstName,
          middleName: individualUpdates.middleName,
          lastName: individualUpdates.lastName,
          nativeName: individualUpdates.nativeName,
          motherName: individualUpdates.motherName,
          preferredName: individualUpdates.preferredName,
          dateOfBirth: individualUpdates.dateOfBirth,
          nrcId: individualUpdates.nrcId,
          address: individualUpdates.address,
          contactMeansComment: individualUpdates.contactMeansComment,
          consentGdpr: individualUpdates.consentGdpr,
          consentReferral: individualUpdates.consentReferral,
          sex: individualUpdates.sex,
          preferredContactMeans: individualUpdates.preferredContactMeans,
          displacementStatus: individualUpdates.displacementStatus,
          engagementContext: individualUpdates.engagementContext,
        },
      );

      expect(updatedIndividual).toBeDefined();
      expect(updatedIndividual).toMatchObject({
        firstName: individualUpdates.firstName,
        middleName: individualUpdates.middleName,
        lastName: individualUpdates.lastName,
        nativeName: individualUpdates.nativeName,
        motherName: individualUpdates.motherName,
        preferredName: individualUpdates.preferredName,
        dateOfBirth: individualUpdates.dateOfBirth,
        nrcId: individualUpdates.nrcId,
        address: individualUpdates.address,
        contactMeansComment: individualUpdates.contactMeansComment,
        consentGdpr: individualUpdates.consentGdpr,
        consentReferral: individualUpdates.consentReferral,
        sex: individualUpdates.sex,
        preferredContactMeans: individualUpdates.preferredContactMeans,
        displacementStatus: individualUpdates.displacementStatus,
        engagementContext: individualUpdates.engagementContext,
      });
    });

    test('should update a individual contact details', async () => {
      const phoneToKeep = faker.phone.number();
      const phoneToUpdate = faker.phone.number();
      const phoneToRemove = faker.phone.number();
      const emailToKeep = faker.internet.email();
      const emailToUpdate = faker.internet.email();
      const emailToRemove = faker.internet.email();
      const individualDefinition = IndividualGenerator.generateDefinition({
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
      });
      const createdIndividual =
        await IndividualStore.create(individualDefinition);

      const phoneToAdd = faker.phone.number();
      const emailToAdd = faker.internet.email();
      const updatedPhone = faker.phone.number();
      const updatedEmail = faker.internet.email();

      const phones = {
        add: [{ value: phoneToAdd }],
        update: createdIndividual.phones
          .filter((cd) => cd.value === phoneToUpdate)
          .map((cd) => ({
            ...cd,
            value: updatedPhone,
          })),
        remove: createdIndividual.phones
          .filter((cd) => cd.value === phoneToRemove)
          .map((cd) => cd.id),
      };
      const emails = {
        add: [{ value: emailToAdd }],
        update: createdIndividual.emails
          .filter((cd) => cd.value === emailToUpdate)
          .map((cd) => ({
            ...cd,
            value: updatedEmail,
          })),
        remove: createdIndividual.emails
          .filter((cd) => cd.value === emailToRemove)
          .map((cd) => cd.id),
      };

      const update: IndividualPartialUpdate = {
        emails,
        phones,
      };

      const updatedIndividual = await IndividualStore.update(
        createdIndividual.id,
        update,
      );

      expect(updatedIndividual.emails).toHaveLength(3);
      expect(updatedIndividual.emails).toEqual(
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
      expect(updatedIndividual.phones).toHaveLength(3);
      expect(updatedIndividual.phones).toEqual(
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

    test('should update a individual identification', async () => {
      const identificationToKeep = IdentificationGenerator.generateDefinition();
      const identificationToUpdate =
        IdentificationGenerator.generateDefinition();
      const identificationToRemove =
        IdentificationGenerator.generateDefinition();
      const individualDefinition = IndividualGenerator.generateDefinition({
        identification: [
          identificationToKeep,
          identificationToUpdate,
          identificationToRemove,
        ],
      });
      const createdIndividual =
        await IndividualStore.create(individualDefinition);

      const identificationToAdd = IdentificationGenerator.generateDefinition();

      const identification = {
        add: [identificationToAdd],
        update: createdIndividual.identification
          .filter(
            (id) =>
              id.identificationNumber ===
              identificationToUpdate.identificationNumber,
          )
          .map((id) => ({
            ...id,
            identificationNumber: '987654321',
          })),
        remove: createdIndividual.identification
          .filter(
            (id) =>
              id.identificationNumber ===
              identificationToRemove.identificationNumber,
          )
          .map((id) => id.id),
      };

      const update: IndividualPartialUpdate = {
        identification,
      };

      const updatedIndividual = await IndividualStore.update(
        createdIndividual.id,
        update,
      );

      expect(updatedIndividual).toBeDefined();
      expect(updatedIndividual.identification).toHaveLength(3);
      expect(updatedIndividual.identification).toContainEqual({
        ...identificationToKeep,
        id: expect.any(String),
      });
      expect(updatedIndividual.identification).toContainEqual({
        ...identificationToUpdate,
        identificationNumber: '987654321',
        id: expect.any(String),
      });
      expect(updatedIndividual.identification).toContainEqual({
        ...identificationToAdd,
        id: expect.any(String),
      });
    });

    test('should update a individual languages', async () => {
      const languageToKeep = 'aaa';
      const languageToRemove = 'aab';
      const individualDefinition = IndividualGenerator.generateDefinition({
        languages: [languageToKeep, languageToRemove],
      });
      const createdIndividual =
        await IndividualStore.create(individualDefinition);

      const languageToAdd = 'aac';

      const languages = {
        add: [languageToAdd],
        remove: [languageToRemove],
      };

      const update: IndividualPartialUpdate = {
        languages,
      };

      const updatedIndividual = await IndividualStore.update(
        createdIndividual.id,
        update,
      );

      expect(updatedIndividual).toBeDefined();
      expect(updatedIndividual.languages).toHaveLength(2);
      expect(updatedIndividual.languages).toContainEqual(languageToKeep);
      expect(updatedIndividual.languages).toContainEqual(languageToAdd);
    });

    test('should update a individual nationalities', async () => {
      const nationalityToKeep = 'AFG';
      const nationalityToRemove = 'ALA';
      const individualDefinition = IndividualGenerator.generateDefinition({
        nationalities: [nationalityToKeep, nationalityToRemove],
      });
      const createdIndividual =
        await IndividualStore.create(individualDefinition);

      const nationalityToAdd = 'ALB';
      const nationalities = {
        add: [nationalityToAdd],
        remove: [nationalityToRemove],
      };

      const update: IndividualPartialUpdate = {
        nationalities,
      };
      const updatedIndividual = await IndividualStore.update(
        createdIndividual.id,
        update,
      );

      expect(updatedIndividual).toBeDefined();
      expect(updatedIndividual.nationalities).toHaveLength(2);
      expect(updatedIndividual.nationalities).toContainEqual(nationalityToKeep);
      expect(updatedIndividual.nationalities).toContainEqual(nationalityToAdd);
    });
  });
});
