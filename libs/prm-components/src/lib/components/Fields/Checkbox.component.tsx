import {
  Checkbox as CB,
  FormControl,
  FormErrorMessage,
  FormHelperText,
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
    <FormControl isInvalid={fieldState.invalid} isRequired={config.required}>
      <CB
        isInvalid={fieldState.invalid}
        isRequired={config.required}
        type={config.dataType}
        isChecked={field.value}
        {...field}
      >
        {config.label}
      </CB>
      {config.description && (
        <FormHelperText>{config.description}</FormHelperText>
      )}
      {fieldState.error && (
        <FormErrorMessage>{fieldState.error.message}</FormErrorMessage>
      )}
    </FormControl>
  );
};
