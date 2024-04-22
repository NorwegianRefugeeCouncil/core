import axios from 'axios';
import { faker } from '@faker-js/faker';
import { ulid } from 'ulidx';

import {
  ParticipantSchema,
  ParticipantDefinition,
  Participant,
  Sex,
  ContactMeans,
  DisplacementStatus,
  EngagementContext,
  DisabilityLevel,
  YesNoUnknown,
  ContactDetailType,
  IdentificationType,
} from '@nrcno/core-models';

const axiosInstance = axios.create({
  validateStatus: () => true,
});

describe('POST /api/prm/:entityType', () => {
  it('should return 400 if the entity type is invalid', async () => {
    const { status } = await axiosInstance.post('/api/prm/invalid', {});
    expect(status).toBe(400);
  });
});
