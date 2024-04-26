import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Textarea as TA,
} from '@chakra-ui/react';
import {
  ControllerFieldState,
  ControllerRenderProps,
  useFormContext,
} from 'react-hook-form';

import { FieldConfig } from '../../config';

type Props = {
  config: FieldConfig;
  name: string;
} & ControllerFieldState &
  Omit<ControllerRenderProps, 'ref'>;

export const TextArea: React.FC<Props> = ({
  config: { description, label, placeholder, required, path },
  name,
  ...props
}) => {
  const { getFieldState, register } = useFormContext();
  const state = getFieldState(name);

  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <TA
        isInvalid={state.invalid}
        isRequired={required}
        placeholder={placeholder}
        {...props}
        {...register(name)}
      />
      <FormHelperText>{description}</FormHelperText>
      {state.error && (
        <FormErrorMessage>{state.error.message}</FormErrorMessage>
      )}
    </FormControl>
  );
};
