import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { useController, useFormContext } from 'react-hook-form';

import { FieldConfig } from '../../config';

type Props = {
  config: FieldConfig;
};

export const TextInput: React.FC<Props> = ({ config }) => {
  const { control } = useFormContext();
  const { field, fieldState } = useController({
    name: config.path.join('.'),
    control,
  });

  return (
    <FormControl>
      <FormLabel>{config.label}</FormLabel>
      <Input
        isInvalid={fieldState.invalid}
        isRequired={config.required}
        placeholder={config.placeholder}
        type={config.dataType}
        readOnly={false}
        {...field}
      />
      <FormHelperText>{config.description}</FormHelperText>
      {fieldState.error && (
        <FormErrorMessage>{fieldState.error.message}</FormErrorMessage>
      )}
    </FormControl>
  );
};
