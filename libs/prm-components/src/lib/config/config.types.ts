import { EntityType } from '@nrcno/core-models';

export enum Component {
  List = 'list',
  Hidden = 'hidden',
  ReadOnly = 'read-only',
  TextInput = 'text-input',
  TextArea = 'text-area',
  // NumberInput = 'number-input',
  // Range = 'range',
  Select = 'select',
  Checkbox = 'checkbox',
  // Radio = 'radio',
  Date = 'date',
  // Time = 'time',
  // DateTime = 'datetime',
  // File = 'file',
}

export enum DataType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Date = 'date',
  Time = 'time',
  DateTime = 'datetime',
  File = 'file',
  Hidden = 'hidden',
}

export type ListFieldConfig = {
  path: string[];
  component: Component.List;
  label: string;
  children: FieldConfig[];
  filter?: (value: any) => boolean;
};

type Option = {
  value: string;
  label: string;
};

export type FieldConfig = {
  component: Exclude<Component, Component.List>;
  dataType: DataType;
  description?: string;
  label?: string;
  options?: Option[];
  path: string[];
  placeholder?: string;
  required?: boolean;
};

export type Section = {
  title: string;
  fields: (FieldConfig | ListFieldConfig)[];
};

export type EntityUIConfig = {
  detail: {
    sections: Section[];
  };
  list: unknown;
  search: unknown;
};

export type PrmUIConfig = Record<EntityType, EntityUIConfig>;
