import { ulid } from 'ulidx';
import { faker } from '@faker-js/faker';

import {
  ParticipantSchema,
  ParticipantDefinitionSchema,
} from './participant.model';

describe('ParticipantSchema', () => {
  it('should validate a valid participant object', () => {
    const participant = {
      id: ulid(),
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1990-01-01'),
      sex: 'male',
      consentGdpr: true,
      consentReferral: true,
      languages: [],
      nationalities: [],
      contactDetails: {
        emails: [
          {
            id: faker.string.uuid(),
            value: 'john.doe@example.com',
          },
        ],
        phones: [
          {
            id: faker.string.uuid(),
            value: '1234567890',
          },
        ],
      },
      identification: [
        {
          id: faker.string.uuid(),
          identificationType: 'unhcr_id',
          identificationNumber: '1234567890',
          isPrimary: true,
        },
      ],
    };

    const result = ParticipantSchema.parse(participant);

    expect(result).toEqual(participant);
  });

  it('should not validate an invalid participant object', () => {
    const participant = {
      id: '1234567890abcdef',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1990-01-01'),
      sex: 'male',
      consentGdpr: true,
      consentReferral: true,
      languages: [],
      nationalities: [],
      contactDetails: [
        {
          contactDetailType: 'email',
          value: 'john.doe@example.com',
        },
        {
          contactDetailType: 'phone_number',
          value: '1234567890',
        },
      ],
      identification: [
        {
          identificationType: 'unhcr_id',
          identificationNumber: '1234567890',
          isPrimary: true,
        },
      ],
    };

    const result = ParticipantSchema.safeParse(participant);

    expect(result.success).toBe(false);
  });
});

describe('ParticipantDefinitionSchema', () => {
  it('should validate a valid participant definition object', () => {
    const participantDefinition = {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1990-01-01'),
      sex: 'male',
      consentGdpr: true,
      consentReferral: true,
      languages: [],
      nationalities: [],
      contactDetails: {
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
      },
      identification: [
        {
          identificationType: 'unhcr_id',
          identificationNumber: '1234567890',
          isPrimary: true,
        },
      ],
    };

    const result = ParticipantDefinitionSchema.parse(participantDefinition);

    expect(result).toEqual(participantDefinition);
  });

  it('should not validate an invalid participant definition object', () => {
    const participantDefinition = {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1990-01-01'),
      sex: 'invalid_sex',
      consentGdpr: true,
      consentReferral: true,
      languages: [],
      nationalities: [],
      contactDetails: [
        {
          contactDetailType: 'email',
          value: 'john.doe@example.com',
        },
        {
          contactDetailType: 'phone_number',
          value: '1234567890',
        },
      ],
      identification: [
        {
          identificationType: 'unhcr_id',
          identificationNumber: '1234567890',
          isPrimary: true,
        },
      ],
    };

    const result = ParticipantDefinitionSchema.safeParse(participantDefinition);

    expect(result.success).toBe(false);
  });
});
