import { Controller, useFormContext } from 'react-hook-form';

import { Component, FieldConfig, ListFieldConfig } from '../../config';

import { Checkbox } from './Checkbox.component';
import { Display } from './Display.component';
import { List } from './List.component';
import { Select } from './Select.component';
import { TextArea } from './TextArea.component';
import { TextInput } from './TextInput.component';

type FieldProps = {
  config: FieldConfig | ListFieldConfig;
};

export const Field: React.FC<FieldProps> = ({ config }) => {
  const { control } = useFormContext();
  const name = config.path.join('.');

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { ref, ...fieldProps }, fieldState, formState }) => {
        const props = { ...fieldProps, ...fieldState, ...formState };

        switch (config.component) {
          case Component.Display:
            return <Display config={config} {...props} />;
          case Component.TextInput:
            return <TextInput config={config} {...props} />;
          case Component.TextArea:
            return <TextArea config={config} {...props} />;
          case Component.Select:
            return <Select config={config} {...props} />;
          case Component.Checkbox:
            return <Checkbox config={config} {...props} />;
          case Component.List:
            return <List config={config} {...props} />;
          default:
            // eslint-disable-next-line react/jsx-no-useless-fragment
            return <></>;
        }
      }}
    />
  );
};
