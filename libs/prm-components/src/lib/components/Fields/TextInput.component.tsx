import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { useController, useFormContext } from 'react-hook-form';

import { DataType, FieldConfig } from '../../config';

type Props = {
  config: FieldConfig;
};

export const TextInput: React.FC<Props> = ({ config }) => {
  const { control } = useFormContext();
  const { field, fieldState } = useController({
    name: config.path.join('.'),
    control,
  });

  const value = (() => {
    switch (config.dataType) {
      case DataType.Date:
      case DataType.DateTime: {
        if (!field.value) return undefined;
        if (typeof field.value === 'string') return field.value;
        return field.value?.toISOString().split('T')[0];
      }
      default:
        return field.value || '';
    }
  })();

  return (
    <FormControl>
      <FormLabel>{config.label}</FormLabel>
      <Input
        isInvalid={fieldState.invalid}
        isRequired={config.required}
        placeholder={config.placeholder}
        type={config.dataType}
        {...field}
        value={value}
      />
      {config.description && (
        <FormHelperText>{config.description}</FormHelperText>
      )}
      {fieldState.error && (
        <FormErrorMessage>{fieldState.error.message}</FormErrorMessage>
      )}
    </FormControl>
  );
};
