import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Textarea as TA,
} from '@chakra-ui/react';
import { useController, useFormContext } from 'react-hook-form';

import { FieldConfig } from '../../config';

type Props = {
  config: FieldConfig;
};

export const TextArea: React.FC<Props> = ({ config }) => {
  const { control } = useFormContext();
  const { field, fieldState } = useController({
    name: config.path.join('.'),
    control,
  });

  return (
    <FormControl>
      <FormLabel>{config.label}</FormLabel>
      <TA
        isInvalid={fieldState.invalid}
        isRequired={config.required}
        placeholder={config.placeholder}
        {...field}
      />
      <FormHelperText>{config.description}</FormHelperText>
      {fieldState.error && (
        <FormErrorMessage>{fieldState.error.message}</FormErrorMessage>
      )}
    </FormControl>
  );
};
