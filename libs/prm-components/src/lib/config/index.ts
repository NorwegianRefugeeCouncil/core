import { EntityType } from '@nrcno/core-models';

import { PrmUIConfigLoader } from './config.types';
import { participantConfig } from './participant';

export * from './config.types';

// TODO: We should support entity types with no/partial configuration
// If we go to a page that the entity doesn't support it should give a 404
const emptyConfig = {
  detail: {
    sections: [],
  },
  list: {
    fields: [],
  },
  search: [],
};

export const configLoader: PrmUIConfigLoader = (staticData) => ({
  [EntityType.Participant]: participantConfig(staticData),
  [EntityType.Language]: emptyConfig,
  [EntityType.Nationality]: emptyConfig,
});
