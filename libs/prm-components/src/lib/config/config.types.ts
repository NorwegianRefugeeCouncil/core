import { EntityType } from '@nrcno/core-models';

export enum Components {
  Hidden = 'hidden',
  ReadOnly = 'read-only',
  TextInput = 'text-input',
  TextArea = 'text-area',
  NumberInput = 'number-input',
  Range = 'range',
  Select = 'select',
  Checkbox = 'checkbox',
  Radio = 'radio',
  Button = 'button',
  Date = 'date',
  Time = 'time',
  DateTime = 'datetime',
  File = 'file',
}

export enum DataTypes {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Date = 'date',
  Time = 'time',
  DateTime = 'datetime',
  File = 'file',
}

export type ListField = {
  path: string[];
  label: string;
  children: Field[];
  filter?: (value: any) => boolean;
};

export type Field = {
  path: string[];
  dataType: DataTypes;
  component: Components;
  label?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: Record<string, any>;
};

export type Section = {
  title: string;
  fields: (Field | ListField)[];
};

export type EntityUIConfig = {
  detail: {
    sections: Section[];
  };
  list: unknown;
  search: unknown;
};

export type PrmUIConfig = Record<EntityType, EntityUIConfig>;
