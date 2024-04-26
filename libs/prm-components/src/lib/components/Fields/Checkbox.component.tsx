import {
  Checkbox as CB,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
} from '@chakra-ui/react';
import { ControllerRenderProps, useFormContext } from 'react-hook-form';

import { FieldConfig } from '../../config';

type Props = {
  config: FieldConfig;
} & Omit<ControllerRenderProps, 'ref'>;

export const Checkbox: React.FC<Props> = ({
  config: { dataType, description, label, placeholder, required, path },
  ...props
}) => {
  const { getFieldState, register } = useFormContext();
  const state = getFieldState(path.join('.'));

  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <CB
        isInvalid={state.invalid}
        isRequired={required}
        placeholder={placeholder}
        type={dataType}
        {...props}
        {...register(path.join('.'))}
      />
      <FormHelperText>{description}</FormHelperText>
      {state.error && (
        <FormErrorMessage>{state.error.message}</FormErrorMessage>
      )}
    </FormControl>
  );
};
