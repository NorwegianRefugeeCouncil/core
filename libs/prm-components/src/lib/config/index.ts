import { EntityType } from '@nrcno/core-models';

import { PrmUIConfigLoader } from './config.types';
import { participantConfig } from './participant';

export * from './config.types';

export const configLoader: PrmUIConfigLoader = (staticData) => ({
  [EntityType.Participant]: participantConfig(staticData),
  [EntityType.Language]: {
    detail: {
      sections: [],
    },
    list: {
      fields: [],
    },
    search: [],
  },
});
