import { HeadOfHouseholdType } from '@nrcno/core-models';

import { Component, DataType, EntityUIConfigLoader } from './config.types';
import { optionsFromEnum } from './utils';

export const householdConfig: EntityUIConfigLoader = (staticData) => ({
  detail: {
    sections: [],
    fields: [
      {
        path: ['sizeOverride'],
        dataType: DataType.Number,
        component: Component.TextInput,
        label: 'Household Size Manual',
      },
      {
        path: ['headType'],
        dataType: DataType.String,
        component: Component.Select,
        label: 'Type of Heading',
        options: optionsFromEnum(HeadOfHouseholdType),
      },
    ],
  },
  list: {
    fields: [],
  },
  filtering: {
    fields: [],
  },
});
