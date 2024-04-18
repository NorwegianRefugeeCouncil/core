import { EntityType } from '@nrcno/core-models';

import { ParticipantService } from './participant.service';

export const PrmService = {
  [EntityType.Participant]: ParticipantService,
};
