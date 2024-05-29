import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Select as S,
} from '@chakra-ui/react';
import { useController, useFormContext } from 'react-hook-form';

import { FieldConfig } from '../../config';

type Props = {
  config: FieldConfig;
};

export const Select: React.FC<Props> = ({ config }) => {
  const name = config.path.join('.');

  const {
    control,
    formState: { disabled },
  } = useFormContext();
  const { field, fieldState } = useController({
    name,
    control,
  });

  return (
    <FormControl>
      <FormLabel>{config.label}</FormLabel>
      <S
        isInvalid={fieldState.invalid}
        isRequired={config.required}
        placeholder={config.placeholder}
        {...field}
        value={field.value || ''}
      >
        <option value={undefined}>
          {!disabled ? `Select ${config.label ? config.label : 'value'}` : ''}
        </option>
        {config.options &&
          config.options.map((option) => (
            <option value={option.value} key={`${name}_${option.value}`}>
              {option.label}
            </option>
          ))}
      </S>
      {config.description && (
        <FormHelperText>{config.description}</FormHelperText>
      )}
      {fieldState.error && (
        <FormErrorMessage>{fieldState.error.message}</FormErrorMessage>
      )}
    </FormControl>
  );
};
