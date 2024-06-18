import { EntityType } from '@nrcno/core-models';

import { IndividualGenerator } from './individual.generator';
import * as LanguageGenerator from './language.generator';
import * as NationalityGenerator from './nationality.generator';

export * from './identification.generator';
export * from './individual.generator';

export const getListItemGenerator = (entityType: EntityType) => {
  switch (entityType) {
    case EntityType.Individual:
      return IndividualGenerator.generateListItem;
    case EntityType.Language:
      return LanguageGenerator.generateListItem;
    case EntityType.Nationality:
      return NationalityGenerator.generateListItem;
    default:
      throw new Error(`No generator found for entity type: ${entityType}`);
  }
};
