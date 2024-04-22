import { Components, Field as FieldType, ListField } from '../../config';

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
    case Components.Hidden:
      return <Hidden field={field} />;
    case Components.ReadOnly:
      return <ReadOnly field={field} />;
    case Components.TextInput:
      return <TextInput field={field} />;
    case Components.TextArea:
      return <TextArea field={field} />;
    case Components.Select:
      return <Select field={field} />;
    case Components.Checkbox:
      return <Checkbox field={field} />;
    case Components.Date:
      return <Date field={field} />;
    case Components.List:
      return <List field={field} />;
    default:
      throw new Error(`Unsupported field component`);
  }
};
