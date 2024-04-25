import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Select as S,
} from '@chakra-ui/react';
import { UseControllerProps, useFormContext } from 'react-hook-form';

import { FieldConfig } from '../../config';

type Props = {
  config: FieldConfig;
  name: string;
};

export const Select: React.FC<Props & UseControllerProps> = ({
  config: { description, label, placeholder, required, options },
  name,
  ...props
}) => {
  const { getFieldState, register } = useFormContext();
  const state = getFieldState(name);

  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <S
        isInvalid={state.invalid}
        isRequired={required}
        placeholder={placeholder}
        {...props}
        {...register(name)}
      >
        {options &&
          options.map((option) => (
            <option value={option.value} key={`${name}_${option.value}`}>
              {option.label}
            </option>
          ))}
      </S>
      <FormHelperText>{description}</FormHelperText>
      {state.error && (
        <FormErrorMessage>{state.error.message}</FormErrorMessage>
      )}
    </FormControl>
  );
};
