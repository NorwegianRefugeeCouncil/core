import { EntityType } from '@nrcno/core-models';

import { IndividualService } from './individual.service';
import { LanguageService } from './language.service';
import { NationalityService } from './nationality.service';
import { HouseholdService } from './household.service';

export {
  hasListMixin,
  hasCreateMixin,
  hasUpdateMixin,
  hasGetMixin,
} from './base.service';

export const prmServiceMap = {
  [EntityType.Household]: HouseholdService,
  [EntityType.Individual]: IndividualService,
  [EntityType.Language]: LanguageService,
  [EntityType.Nationality]: NationalityService,
};

export const getPrmService = (entityType: EntityType) =>
  new prmServiceMap[entityType]();
