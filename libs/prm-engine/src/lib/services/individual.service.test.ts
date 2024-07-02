import { faker } from '@faker-js/faker';

import {
  HouseholdGenerator,
  IndividualGenerator,
} from '@nrcno/core-test-utils';
import { EntityType, HeadOfHouseholdType } from '@nrcno/core-models';

import { IndividualStore } from '../stores/individual.store';
import { HouseholdStore } from '../stores/household.store';

import { IndividualService } from './individual.service';
import { buildCountTests, buildListTests } from './test-utils';
import { LanguageService } from './language.service';
import { NationalityService } from './nationality.service';
import { createTrx } from './utils';

jest.mock('../stores/individual.store', () => ({
  IndividualStore: {
    create: jest.fn(),
    get: jest.fn(),
    update: jest.fn(),
    list: jest.fn(),
    count: jest.fn(),
  },
}));

jest.mock('../stores/household.store', () => ({
  HouseholdStore: {
    create: jest.fn(),
    get: jest.fn(),
    update: jest.fn(),
    list: jest.fn(),
    count: jest.fn(),
  },
}));

jest.mock('./utils', () => ({
  createTrx: jest.fn().mockResolvedValue({
    rollback: jest.fn(),
    commit: jest.fn(),
  }),
}));

jest.mock('./language.service', () => ({
  LanguageService: jest.fn().mockImplementation(() => ({
    validateIsoCode: jest.fn(),
  })),
}));

jest.mock('./nationality.service', () => ({
  NationalityService: jest.fn().mockImplementation(() => ({
    validateIsoCode: jest.fn(),
  })),
}));

describe('Individual service', () => {
  let individualService: IndividualService;

  beforeEach(() => {
    individualService = new IndividualService();
  });

  buildListTests(EntityType.Individual, IndividualService, IndividualStore);
  buildCountTests(EntityType.Individual, IndividualService, IndividualStore);

  describe('create', () => {
    it('should call the individual store create method, when given a household id', async () => {
      const individualDefinition = IndividualGenerator.generateDefinition({
        householdId: faker.string.uuid(),
      });
      const individual = IndividualGenerator.generateEntity();
      IndividualStore.create = jest.fn().mockResolvedValueOnce(individual);

      const trx = await createTrx();
      const result = await individualService.create(individualDefinition, trx);

      expect(IndividualStore.create).toHaveBeenCalledWith(
        individualDefinition,
        trx,
      );
      expect(result).toEqual(individual);
    });

    it('should call the household store create method, when not given a household id', async () => {
      const individualDefinition = IndividualGenerator.generateDefinition();
      const householdDef = HouseholdGenerator.generateDefinition({
        individuals: [
          {
            ...individualDefinition,
            isHeadOfHousehold: true,
          },
        ],
        headType: null,
        sizeOverride: 1,
      });
      const household =
        HouseholdGenerator.generateEntityFromDefinition(householdDef);
      IndividualStore.create = jest.fn();
      HouseholdStore.create = jest.fn().mockResolvedValueOnce(household);

      const trx = await createTrx();
      const result = await individualService.create(individualDefinition);

      expect(HouseholdStore.create).toHaveBeenCalledWith(householdDef, trx);
      expect(IndividualStore.create).not.toHaveBeenCalled();
      expect(result).toEqual({
        ...household.individuals[0],
        householdId: household.id,
        isHeadOfHousehold: true,
      });
    });

    it('should throw an error if the store create method fails, when given a household id', async () => {
      const individualDefinition = IndividualGenerator.generateDefinition({
        householdId: faker.string.uuid(),
      });
      IndividualStore.create = jest
        .fn()
        .mockRejectedValueOnce(new Error('Failed to create individual'));

      const trx = await createTrx();
      await expect(
        individualService.create(individualDefinition, trx),
      ).rejects.toThrow('Failed to create individual');

      expect(IndividualStore.create).toHaveBeenCalledWith(
        individualDefinition,
        trx,
      );
    });

    it('should throw an error if the store create method fails, when not given a household id', async () => {
      const individualDefinition = IndividualGenerator.generateDefinition();
      const householdDef = HouseholdGenerator.generateDefinition({
        individuals: [
          {
            ...individualDefinition,
            isHeadOfHousehold: true,
          },
        ],
        sizeOverride: 1,
        headType: null,
      });
      HouseholdStore.create = jest
        .fn()
        .mockRejectedValueOnce(new Error('Failed to create household'));

      const trx = await createTrx();
      await expect(
        individualService.create(individualDefinition, trx),
      ).rejects.toThrow('Failed to create household');

      expect(HouseholdStore.create).toHaveBeenCalledWith(householdDef, trx);
    });

    it('should throw an error if language validation fails', async () => {
      const individualDefinition = IndividualGenerator.generateDefinition();

      (LanguageService as jest.Mock).mockImplementationOnce(() => ({
        validateIsoCode: jest.fn().mockImplementation(() => {
          throw new Error('Invalid language');
        }),
      }));

      await expect(
        individualService.create(individualDefinition),
      ).rejects.toThrow('Invalid language');
    });

    it('should throw an error if nationality validation fails', async () => {
      const individualDefinition = IndividualGenerator.generateDefinition();

      (NationalityService as jest.Mock).mockImplementationOnce(() => ({
        validateIsoCode: jest.fn().mockImplementation(() => {
          throw new Error('Invalid nationality');
        }),
      }));

      await expect(
        individualService.create(individualDefinition),
      ).rejects.toThrow('Invalid nationality');
    });
  });

  describe('get', () => {
    it('should call the store get method', async () => {
      const individual = IndividualGenerator.generateEntity();
      IndividualStore.get = jest.fn().mockResolvedValueOnce(individual);

      const result = await individualService.get(individual.id);

      expect(IndividualStore.get).toHaveBeenCalledWith(individual.id);
      expect(result).toEqual(individual);
    });

    it('should return null if the store get method returns null', async () => {
      IndividualStore.get = jest.fn().mockResolvedValueOnce(null);

      const result = await individualService.get('id');

      expect(IndividualStore.get).toHaveBeenCalledWith('id');
      expect(result).toBeNull();
    });

    it('should throw an error if the store get method fails', async () => {
      IndividualStore.get = jest
        .fn()
        .mockRejectedValueOnce(new Error('Failed to get individual'));

      await expect(individualService.get('id')).rejects.toThrow(
        'Failed to get individual',
      );

      expect(IndividualStore.get).toHaveBeenCalledWith('id');
    });
  });

  describe('update', () => {
    it('should generate the partial update and call the store update method with no updates', async () => {
      const individual = IndividualGenerator.generateEntity();
      const individualUpdate = {
        ...individual,
        emails: {
          add: [],
          update: individual.emails,
          remove: [],
        },
        phones: {
          add: [],
          update: individual.phones,
          remove: [],
        },
        identification: {
          add: [],
          update: individual.identification,
          remove: [],
        },
        languages: {
          add: [],
          remove: [],
        },
        nationalities: {
          add: [],
          remove: [],
        },
      };
      IndividualStore.get = jest.fn().mockResolvedValueOnce(individual);
      IndividualStore.update = jest.fn().mockResolvedValueOnce(individual);

      const result = await individualService.update(individual.id, individual);

      expect(IndividualStore.get).toHaveBeenCalledWith(individual.id);
      expect(IndividualStore.update).toHaveBeenCalledWith(
        individual.id,
        individualUpdate,
      );
      expect(result).toEqual(individual);
    });

    it('should generate the partial update changing all fields', async () => {
      const originalIndividual = IndividualGenerator.generateEntity({
        languages: ['es'],
        nationalities: ['es'],
      });
      const updatedIndividual = IndividualGenerator.generateDefinition({
        languages: ['en'],
        nationalities: ['en'],
      });
      const individualUpdate = {
        ...updatedIndividual,
        emails: {
          add: updatedIndividual.emails,
          update: [],
          remove: originalIndividual.emails.map((cd) => cd.id),
        },
        phones: {
          add: updatedIndividual.phones,
          update: [],
          remove: originalIndividual.phones.map((cd) => cd.id),
        },
        identification: {
          add: updatedIndividual.identification,
          update: [],
          remove: originalIndividual.identification.map((id) => id.id),
        },
        languages: {
          add: ['en'],
          remove: ['es'],
        },
        nationalities: {
          add: ['en'],
          remove: ['es'],
        },
      };
      IndividualStore.get = jest.fn().mockResolvedValueOnce(originalIndividual);
      IndividualStore.update = jest
        .fn()
        .mockResolvedValueOnce(updatedIndividual);

      const result = await individualService.update(
        originalIndividual.id,
        updatedIndividual,
      );

      expect(IndividualStore.get).toHaveBeenCalledWith(originalIndividual.id);
      expect(IndividualStore.update).toHaveBeenCalledWith(
        originalIndividual.id,
        individualUpdate,
      );
      expect(result).toEqual(updatedIndividual);
    });

    it('should throw an error if the individual does not exist', async () => {
      IndividualStore.get = jest.fn().mockResolvedValueOnce(null);

      await expect(
        individualService.update('12345', IndividualGenerator.generateEntity()),
      ).rejects.toThrow('Individual with id 12345 not found');

      expect(IndividualStore.get).toHaveBeenCalledWith('12345');
    });

    it('should throw an error if the store update method fails', async () => {
      const individual = IndividualGenerator.generateEntity();
      IndividualStore.get = jest.fn().mockResolvedValueOnce(individual);
      IndividualStore.update = jest
        .fn()
        .mockRejectedValueOnce(new Error('Failed to update individual'));

      await expect(
        individualService.update(individual.id, individual),
      ).rejects.toThrow('Failed to update individual');
    });

    it('should throw an error if language validation fails', async () => {
      const individual = IndividualGenerator.generateEntity();

      (LanguageService as jest.Mock).mockImplementationOnce(() => ({
        validateIsoCode: jest.fn().mockImplementation(() => {
          throw new Error('Invalid language');
        }),
      }));

      await expect(
        individualService.update(individual.id, individual),
      ).rejects.toThrow('Invalid language');
    });

    it('should throw an error if nationality validation fails', async () => {
      const individual = IndividualGenerator.generateEntity();

      (NationalityService as jest.Mock).mockImplementationOnce(() => ({
        validateIsoCode: jest.fn().mockImplementation(() => {
          throw new Error('Invalid nationality');
        }),
      }));

      await expect(
        individualService.update(individual.id, individual),
      ).rejects.toThrow('Invalid nationality');
    });
  });
});
