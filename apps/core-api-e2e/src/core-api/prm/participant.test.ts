import axios from 'axios';
import { faker } from '@faker-js/faker';
import { ulid } from 'ulidx';

import {
  IdentificationGenerator,
  IndividualGenerator,
} from '@nrcno/core-test-utils';
import {
  IndividualSchema,
  IndividualDefinition,
  Individual,
} from '@nrcno/core-models';

const axiosInstance = axios.create({
  validateStatus: () => true,
});

const individualDefinitionWithEveryField =
  IndividualGenerator.generateDefinition();

const generateExpectedIndividual = (
  individualDefinition: IndividualDefinition,
): Individual => ({
  ...individualDefinition,
  id: expect.any(String),
  emails: individualDefinition.emails.map((contactDetail) => ({
    ...contactDetail,
    id: expect.any(String),
  })),
  phones: individualDefinition.phones.map((contactDetail) => ({
    ...contactDetail,
    id: expect.any(String),
  })),
  identification: individualDefinition.identification.map((identification) => ({
    ...identification,
    id: expect.any(String),
  })),
});
const individualWithEveryField = generateExpectedIndividual(
  individualDefinitionWithEveryField,
);

const individualDefinitionWithSomeFields: IndividualDefinition = {
  consentGdpr: faker.datatype.boolean(),
  consentReferral: faker.datatype.boolean(),
  languages: [],
  nationalities: [],
  emails: [],
  phones: [],
  identification: [],
};

const individualWithSomeFields: Individual = {
  ...individualDefinitionWithSomeFields,
  id: expect.any(String),
  emails: [],
  phones: [],
  identification: [],
  languages: [],
  nationalities: [],
};

const individualDefinitionWithInvalidFields = {
  sex: 'invalid',
  consentGdpr: faker.datatype.boolean(),
  consentReferral: faker.datatype.boolean(),
  languages: [],
  nationalities: [],
  emails: [],
  phones: [],
  identification: [],
};

const individualDefinitionWithIds = {
  ...individualDefinitionWithEveryField,
  id: ulid(),
  emails: individualDefinitionWithEveryField.emails.map((contactDetail) => ({
    ...contactDetail,
    id: faker.string.uuid(),
  })),
  phones: individualDefinitionWithEveryField.phones.map((contactDetail) => ({
    ...contactDetail,
    id: faker.string.uuid(),
  })),
  identification: individualDefinitionWithEveryField.identification.map(
    (identification) => ({
      ...identification,
      id: faker.string.uuid(),
    }),
  ),
};

// TODO: make tests independent by running them against a clean database
describe('Individuals', () => {
  describe('POST /api/prm/individuals', () => {
    it('should create a individual with every field', async () => {
      const res = await axiosInstance.post(
        `/api/prm/individuals`,
        individualDefinitionWithEveryField,
      );

      expect(res.status).toBe(201);
      expect(IndividualSchema.parse(res.data)).toEqual(
        individualWithEveryField,
      );
    });

    it('should create a individual with some fields', async () => {
      const res = await axiosInstance.post(
        `/api/prm/individuals`,
        individualDefinitionWithSomeFields,
      );

      expect(res.status).toBe(201);
      expect(IndividualSchema.parse(res.data)).toEqual(
        individualWithSomeFields,
      );
    });

    it('should return an error when creating a individual with invalid fields', async () => {
      const res = await axiosInstance.post(
        `/api/prm/individuals`,
        individualDefinitionWithInvalidFields,
      );
      expect(res.status).toBe(400);
    });

    it('should strip unknown fields when creating a individual', async () => {
      const res = await axiosInstance.post(`/api/prm/individuals`, {
        ...individualDefinitionWithEveryField,
        unknownField: faker.word.noun(),
      });

      expect(res.status).toBe(201);
      expect(IndividualSchema.parse(res.data)).toEqual(
        individualWithEveryField,
      );
    });

    it('should strip ids when sent in the request body', async () => {
      const res = await axiosInstance.post(
        `/api/prm/individuals`,
        individualDefinitionWithIds,
      );

      expect(res.status).toBe(201);
      expect(IndividualSchema.parse(res.data)).toEqual(
        individualWithEveryField,
      );
      expect(res.data.id).not.toEqual(individualDefinitionWithIds.id);
      res.data.emails.forEach((contactDetail: any, index: number) => {
        expect(contactDetail.id).not.toEqual(
          individualDefinitionWithIds.emails[index].id,
        );
      });
      res.data.phones.forEach((contactDetail: any, index: number) => {
        expect(contactDetail.id).not.toEqual(
          individualDefinitionWithIds.phones[index].id,
        );
      });
      res.data.identification.forEach((identification: any, index: number) => {
        expect(identification.id).not.toEqual(
          individualDefinitionWithIds.identification[index].id,
        );
      });
    });
  });

  describe('GET /api/prm/individuals/:id', () => {
    let individualId: string;

    beforeAll(async () => {
      const res = await axiosInstance.post(
        `/api/prm/individuals`,
        individualDefinitionWithEveryField,
      );

      individualId = res.data.id;
    });

    it('should return a individual', async () => {
      const res = await axiosInstance.get(
        `/api/prm/individuals/${individualId}`,
      );

      expect(res.status).toBe(200);
      expect(IndividualSchema.parse(res.data)).toEqual(
        individualWithEveryField,
      );
    });

    it('should return an error if the individual does not exist', async () => {
      const response = await axiosInstance.get(
        `/api/prm/individuals/${ulid()}`,
      );

      expect(response.status).toBe(404);
    });

    it('should return 404 if the individual id is invalid', async () => {
      const response = await axiosInstance.get(`/api/prm/individuals/invalid`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/prm/individuals', () => {
    const individualDefinition = IndividualGenerator.generateDefinition();
    let individualId: string;
    beforeAll(async () => {
      const res = await axiosInstance.post(
        `/api/prm/individuals`,
        individualDefinition,
      );
      individualId = res.data.id;
    });

    it('should return a list of individuals', async () => {
      const res = await axiosInstance.get(`/api/prm/individuals`);

      const expectedListItem = {
        id: individualId,
        firstName: individualDefinition.firstName,
        lastName: individualDefinition.lastName,
        dateOfBirth: individualDefinition.dateOfBirth?.toISOString(),
        sex: individualDefinition.sex,
        displacementStatus: individualDefinition.displacementStatus,
        identification: [
          {
            id: expect.any(String),
            identificationType:
              individualDefinition.identification[0].identificationType,
            identificationNumber:
              individualDefinition.identification[0].identificationNumber,
          },
        ],
        nationalities: [individualDefinition.nationalities[0]],
        emails: [
          {
            value: individualDefinition.emails[0].value,
            id: expect.any(String),
          },
        ],
        phones: [
          {
            value: individualDefinition.phones[0].value,
            id: expect.any(String),
          },
        ],
      };

      expect(res.status).toBe(200);
      expect(res.data).toEqual({
        startIndex: 0,
        pageSize: 50,
        totalCount: expect.any(Number), // TODO: once tests are isolated, expect 1
        items: expect.arrayContaining([expectedListItem]),
      });
    });

    it('should return a list of individuals with pagination', async () => {
      const res = await axiosInstance.get(
        `/api/prm/individuals?startIndex=1&pageSize=25`,
      );

      expect(res.status).toBe(200);
      expect(res.data).toEqual({
        startIndex: 1,
        pageSize: 25,
        totalCount: expect.any(Number), // TODO: once tests are isolated, expect 1
        items: expect.arrayContaining([expect.objectContaining({})]),
      });
    });

    it('should return a sorted list of individuals', async () => {
      const res = await axiosInstance.get(
        `/api/prm/individuals?sort=emails&direction=desc`,
      );

      expect(res.status).toBe(200);
      expect(res.data).toEqual({
        startIndex: 0,
        pageSize: 50,
        totalCount: expect.any(Number), // TODO: once tests are isolated, create extra entries and expect that number
        items: expect.arrayContaining([expect.objectContaining({})]),
      });
      const emails = res.data.items.map((item: any) => item.emails?.[0]?.value);

      const isSorted = (array: string[]) => {
        for (let i = 1; i < array.length; i++) {
          if (array[i - 1] < array[i]) {
            return false;
          }
        }
        return true;
      };
      expect(isSorted(emails)).toBe(true);
    });

    it('should return a filtered list of individuals', async () => {
      const res = await axiosInstance.get(
        `/api/prm/individuals?id=${individualId}`,
      );

      expect(res.status).toBe(200);
      expect(res.data).toEqual({
        startIndex: 0,
        pageSize: 50,
        totalCount: 1,
        items: expect.arrayContaining([
          expect.objectContaining({ id: individualId }),
        ]),
      });
      expect(res.data.items.length).toBe(1);
      expect(res.data.items[0].id).toBe(individualId);
    });

    it('should return an error if the startIndex is invalid', async () => {
      const response = await axiosInstance.get(
        `/api/prm/individuals?startIndex=invalid`,
      );

      expect(response.status).toBe(400);
    });

    it('should return an error if the pageSize is invalid', async () => {
      const response = await axiosInstance.get(
        `/api/prm/individuals?pageSize=invalid`,
      );

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/prm/individuals/:id', () => {
    let individualId: string;

    beforeAll(async () => {
      const res = await axiosInstance.post(
        `/api/prm/individuals`,
        individualDefinitionWithEveryField,
      );
      individualId = res.data.id;
    });

    it('should update a individual', async () => {
      const individualUpdate = IndividualGenerator.generateDefinition();
      const res = await axiosInstance.put(
        `/api/prm/individuals/${individualId}`,
        individualUpdate,
      );

      expect(res.status).toBe(200);
      const expectedIndividual = generateExpectedIndividual(individualUpdate);
      expect(IndividualSchema.parse(res.data)).toEqual(expectedIndividual);
    });

    it('should return an error if the individual does not exist', async () => {
      const response = await axiosInstance.put(
        `/api/prm/individuals/${ulid()}`,
        individualDefinitionWithEveryField,
      );

      expect(response.status).toBe(404);
    });

    it('should return 404 if the individual id is invalid', async () => {
      const response = await axiosInstance.put(
        `/api/prm/individuals/invalid`,
        individualDefinitionWithEveryField,
      );

      expect(response.status).toBe(404);
    });
  });
});
