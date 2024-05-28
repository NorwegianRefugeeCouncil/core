import {
  Radio as R,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  RadioGroup,
  Stack,
  FormLabel,
} from '@chakra-ui/react';
import { useController, useFormContext } from 'react-hook-form';

import { FieldConfig } from '../../config';

type Props = {
  config: FieldConfig;
};

export const Radio: React.FC<Props> = ({ config }) => {
  const { control } = useFormContext();
  const { field, fieldState } = useController({
    name: config.path.join('.'),
    control,
  });

  return (
    <FormControl>
      <FormLabel>{config.label}</FormLabel>
      <RadioGroup onChange={field.onChange} value={field.value}>
        <Stack direction="row">
          {config?.options?.map((option) => (
            <R
              key={option.label}
              {...field}
              value={option.value}
              isInvalid={fieldState.invalid}
              isRequired={config.required}
              isChecked={field.value === option.value}
            >
              {option.label}
            </R>
          ))}
        </Stack>
      </RadioGroup>

      {config.description && (
        <FormHelperText>{config.description}</FormHelperText>
      )}
      {fieldState.error && (
        <FormErrorMessage>{fieldState.error.message}</FormErrorMessage>
      )}
    </FormControl>
  );
};
