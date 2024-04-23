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
}

export type ListField = {
  path: string[];
  component: Component.List;
  label: string;
  children: Field[];
  filter?: (value: any) => boolean;
};

export type Field = {
  path: string[];
  dataType: DataType;
  component: Exclude<Component, Component.List>;
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
