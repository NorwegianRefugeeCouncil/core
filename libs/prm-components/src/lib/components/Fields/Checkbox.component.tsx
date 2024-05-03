import {
  Checkbox as CB,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
} from '@chakra-ui/react';
import { useController, useFormContext } from 'react-hook-form';

import { FieldConfig } from '../../config';

type Props = {
  config: FieldConfig;
};

export const Checkbox: React.FC<Props> = ({ config }) => {
  const { control } = useFormContext();
  const { field, fieldState } = useController({
    name: config.path.join('.'),
    control,
  });

  return (
    <FormControl>
      <FormLabel>{config.label}</FormLabel>
      <CB
        isInvalid={fieldState.invalid}
        isRequired={config.required}
        placeholder={config.placeholder}
        type={config.dataType}
        {...field}
      />
      <FormHelperText>{config.description}</FormHelperText>
      {fieldState.error && (
        <FormErrorMessage>{fieldState.error.message}</FormErrorMessage>
      )}
    </FormControl>
  );
};
