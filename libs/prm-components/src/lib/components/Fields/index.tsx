import { Component, Field as FieldType, ListField } from '../../config';

import { Checkbox } from './Checkbox.component';
import { Date } from './Date.component';
import { Hidden } from './Hidden.component';
import { List } from './List.component';
import { ReadOnly } from './ReadOnly.component';
import { Select } from './Select.component';
import { TextArea } from './TextArea.component';
import { TextInput } from './TextInput.component';

type FieldProps = {
  field: FieldType | ListField;
};

export const Field: React.FC<FieldProps> = ({ field }) => {
  switch (field.component) {
    case Component.Hidden:
      return <Hidden field={field} />;
    case Component.ReadOnly:
      return <ReadOnly field={field} />;
    case Component.TextInput:
      return <TextInput field={field} />;
    case Component.TextArea:
      return <TextArea field={field} />;
    case Component.Select:
      return <Select field={field} />;
    case Component.Checkbox:
      return <Checkbox field={field} />;
    case Component.Date:
      return <Date field={field} />;
    case Component.List:
      return <List field={field} />;
    default:
      throw new Error(`Unsupported field component`);
  }
};
