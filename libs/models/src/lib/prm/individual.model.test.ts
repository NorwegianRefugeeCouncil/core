import { ulid } from 'ulidx';
import { faker } from '@faker-js/faker';

import {
  IndividualSchema,
  IndividualDefinitionSchema,
} from './individual.model';

describe('IndividualSchema', () => {
  it('should validate a valid individual object', () => {
    const individual = {
      id: ulid(),
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1990-01-01'),
      sex: 'male',
      consentGdpr: true,
      consentReferral: true,
      languages: [],
      nationalities: [],
      emails: [
        {
          id: ulid(),
          value: 'john.doe@example.com',
        },
      ],
      phones: [
        {
          id: ulid(),
          value: '1234567890',
        },
      ],
      identification: [
        {
          id: ulid(),
          identificationType: 'unhcr_id',
          identificationNumber: '1234567890',
        },
      ],
    };

    const result = IndividualSchema.parse(individual);

    expect(result).toEqual(individual);
  });

  it('should not validate an invalid individual object', () => {
    const individual = {
      id: '1234567890abcdef',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1990-01-01'),
      sex: 'male',
      consentGdpr: true,
      consentReferral: true,
      languages: [],
      nationalities: [],
      badField: [],
      identification: [],
    };

    const result = IndividualSchema.safeParse(individual);

    expect(result.success).toBe(false);
  });
});

describe('IndividualDefinitionSchema', () => {
  it('should validate a valid individual definition object', () => {
    const individualDefinition = {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1990-01-01'),
      sex: 'male',
      consentGdpr: true,
      consentReferral: true,
      languages: [],
      nationalities: [],
      emails: [
        {
          value: 'john.doe@example.com',
        },
      ],
      phones: [
        {
          value: '1234567890',
        },
      ],
      identification: [
        {
          identificationType: 'unhcr_id',
          identificationNumber: '1234567890',
        },
      ],
    };

    const result = IndividualDefinitionSchema.parse(individualDefinition);

    expect(result).toEqual(individualDefinition);
  });

  it('should not validate an invalid individual definition object', () => {
    const individualDefinition = {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1990-01-01'),
      sex: 'invalid_sex',
      consentGdpr: true,
      consentReferral: true,
      languages: [],
      nationalities: [],
      badField: [],
      identification: [],
    };

    const result = IndividualDefinitionSchema.safeParse(individualDefinition);

    expect(result.success).toBe(false);
  });
});
