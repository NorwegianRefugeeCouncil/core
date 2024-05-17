import { EntityListItemField, EntityType } from '@nrcno/core-models';

export enum Component {
  List = 'list',
  Hidden = 'hidden',
  Display = 'display',
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

export type ListFieldConfig = {
  path: string[];
  component: Component.List;
  label: string;
  children: FieldConfig[];
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
  defaultValue?: any;
};

export type Section = {
  title: string;
  fields: (FieldConfig | ListFieldConfig)[];
};

export type TableColumn = {
  path: (string | number)[];
  title: string;
  width?: number;
  isID?: boolean;
  format?: (input: any) => string;
};

export type EntityUIConfig = {
  detail: {
    sections: Section[];
  };
  list: {
    fields: TableColumn[];
  };
  search: unknown;
};

export type PrmUIConfig = Record<EntityType, EntityUIConfig>;
