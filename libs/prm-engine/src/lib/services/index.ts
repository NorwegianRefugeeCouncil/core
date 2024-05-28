import { EntityType } from '@nrcno/core-models';

import { ParticipantService } from './participant.service';

export {
  hasListMixin,
  hasCreateMixin,
  hasUpdateMixin,
  hasGetMixin,
} from './base.service';

const prmServiceMap = {
  [EntityType.Participant]: new ParticipantService(),
};

export const getPrmService = (entityType: EntityType) =>
  prmServiceMap[entityType];
