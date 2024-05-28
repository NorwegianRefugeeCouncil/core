import { Component, FieldConfig, ListFieldConfig } from '../../config';

import { Checkbox } from './Checkbox.component';
import { Radio } from './Radio.component';
import { Display } from './Display.component';
import { List } from './List.component';
import { Select } from './Select.component';
import { TextArea } from './TextArea.component';
import { TextInput } from './TextInput.component';
import { Hidden } from './Hidden.component';

type FieldProps = {
  config: FieldConfig | ListFieldConfig;
};

export const Field: React.FC<FieldProps> = ({ config }) => {
  switch (config.component) {
    case Component.Display:
      return <Display config={config} />;
    case Component.Hidden:
      return <Hidden config={config} />;
    case Component.TextInput:
      return <TextInput config={config} />;
    case Component.TextArea:
      return <TextArea config={config} />;
    case Component.Select:
      return <Select config={config} />;
    case Component.Checkbox:
      return <Checkbox config={config} />;
    case Component.Radio:
      return <Radio config={config} />;
    case Component.List:
      return <List config={config} />;
    default:
      // eslint-disable-next-line react/jsx-no-useless-fragment
      return <></>;
  }
};
