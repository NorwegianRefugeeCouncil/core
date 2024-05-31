import { EntityType } from '@nrcno/core-models';

import { ParticipantService } from './participant.service';
import { LanguageService } from './language.service';

export {
  hasListMixin,
  hasCreateMixin,
  hasUpdateMixin,
  hasGetMixin,
} from './base.service';

const prmServiceMap = {
  [EntityType.Participant]: new ParticipantService(),
  [EntityType.Language]: new LanguageService(),
};

export const getPrmService = (entityType: EntityType) =>
  prmServiceMap[entityType];
