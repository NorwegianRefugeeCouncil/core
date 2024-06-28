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
        component: Component.NumberInput,
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
    fields: [
      {
        path: ['id'],
        title: 'ID',
        isID: true,
        width: 4,
      },
      {
        path: ['individuals', '0', 'id'],
        title: 'Head of Household ID',
        width: 4,
      },
      {
        path: ['headType'],
        title: 'Type of Heading',
        width: 4,
      },
      {
        path: ['sizeOverride'],
        title: 'Household Size Manual',
        width: 4,
      },
    ],
  },
  filtering: {
    fields: [
      {
        path: ['id'],
        dataType: DataType.String,
        component: Component.TextInput,
        label: 'ID',
      },
      {
        path: ['headType'],
        dataType: DataType.String,
        component: Component.Select,
        options: optionsFromEnum(HeadOfHouseholdType),
        label: 'Type of Heading',
      },
      {
        path: ['sizeOverrideMin'],
        dataType: DataType.Number,
        component: Component.NumberInput,
        label: 'Min Household Size Manual',
      },
      {
        path: ['sizeOverrideMax'],
        dataType: DataType.Number,
        component: Component.NumberInput,
        label: 'Max Household Size Manual',
      },
    ],
  },
});
