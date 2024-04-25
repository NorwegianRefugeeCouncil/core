import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import {
  UseControllerProps,
  useFormContext,
  ControllerFieldState,
} from 'react-hook-form';

import { FieldConfig } from '../../config';

type Props = {
  config: FieldConfig;
  name: string;
};

export const TextInput: React.FC<
  Props & UseControllerProps & ControllerFieldState
> = ({
  config: { dataType, description, label, placeholder, required },
  name,
  invalid,
  error,
}) => {
  const { register } = useFormContext();

  const registerProps = register(name);

  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <Input
        isInvalid={invalid}
        isRequired={required}
        placeholder={placeholder}
        type={dataType}
        readOnly={false}
        {...registerProps}
      />
      <FormHelperText>{description}</FormHelperText>
      {error && <FormErrorMessage>{error.message}</FormErrorMessage>}
    </FormControl>
  );
};
