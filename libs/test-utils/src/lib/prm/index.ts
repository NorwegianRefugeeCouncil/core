import { EntityType } from '@nrcno/core-models';

import { ParticipantGenerator } from './participant.generator';
import * as LanguageGenerator from './language.generator';
import * as NationalityGenerator from './nationality.generator';

export * from './identification.generator';
export * from './participant.generator';

export const getListItemGenerator = (entityType: EntityType) => {
  switch (entityType) {
    case EntityType.Participant:
      return ParticipantGenerator.generateListItem;
    case EntityType.Language:
      return LanguageGenerator.generateListItem;
    case EntityType.Nationality:
      return NationalityGenerator.generateListItem;
    default:
      throw new Error(`No generator found for entity type: ${entityType}`);
  }
};
