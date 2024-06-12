import { EntityType } from '@nrcno/core-models';

import { ParticipantService } from './participant.service';
import { LanguageService } from './language.service';
import { NationalityService } from './nationality.service';

export {
  hasListMixin,
  hasCreateMixin,
  hasUpdateMixin,
  hasGetMixin,
} from './base.service';

export const prmServiceMap = {
  [EntityType.Participant]: ParticipantService,
  [EntityType.Language]: LanguageService,
  [EntityType.Nationality]: NationalityService,
};

export const getPrmService = (entityType: EntityType) =>
  new prmServiceMap[entityType]();
