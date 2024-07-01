import { EntityType } from '@nrcno/core-models';

import { PrmUIConfigLoader } from './config.types';
import { individualConfig } from './individual';
import { householdConfig } from './houseHold';

export * from './config.types';

// TODO: We should support entity types with no/partial configuration
// If we go to a page that the entity doesn't support it should give a 404
const emptyConfig = {
  detail: {
    sections: [],
    fields: [],
  },
  list: {
    fields: [],
  },
  filtering: { fields: [] },
};

export const configLoader: PrmUIConfigLoader = (staticData) => ({
  [EntityType.Individual]: individualConfig(staticData),
  [EntityType.Household]: householdConfig(staticData),
  [EntityType.Language]: emptyConfig,
  [EntityType.Nationality]: emptyConfig,
});
