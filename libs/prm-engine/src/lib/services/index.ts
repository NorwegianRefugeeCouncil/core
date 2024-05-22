import { EntityType } from '@nrcno/core-models';

import { ParticipantService } from './participant.service';

const prmServiceMap = {
  [EntityType.Participant]: new ParticipantService(),
};

export const getPrmService = (entityType: EntityType) =>
  prmServiceMap[entityType];
