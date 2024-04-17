import {
  ParticipantSchema,
  ParticipantDefinitionSchema,
} from './participant.model';

describe('ParticipantSchema', () => {
  it('should validate a valid participant object', () => {
    const participant = {
      id: '1234567890abcdef',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1990-01-01'),
      sex: 'male',
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

    expect(result.success).toBe(true);
  });

  it('should not validate an invalid participant object', () => {
    const participant = {
      id: '1234567890abcdef',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1990-01-01'),
      sex: 'invalid_sex',
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

    expect(result.success).toBe(true);
  });

  it('should not validate an invalid participant definition object', () => {
    const participantDefinition = {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1990-01-01'),
      sex: 'invalid_sex',
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
