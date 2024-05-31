import { EntityType } from '@nrcno/core-models';

import { PrmUIConfig } from './config.types';
import { participantConfig } from './participant';

export * from './config.types';

export const config: PrmUIConfig = {
  [EntityType.Participant]: participantConfig,
  [EntityType.Language]: {
    detail: {
      sections: [],
    },
    list: {
      fields: [],
    },
    search: [],
  },
};
