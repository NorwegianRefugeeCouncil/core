import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput as ChakraNumberInput,
  NumberInputField,
  NumberInputStepper,
} from '@chakra-ui/react';
import { useController, useFormContext } from 'react-hook-form';

import { DataType, FieldConfig } from '../../config';

type Props = {
  config: FieldConfig;
};

export const NumberInput: React.FC<Props> = ({ config }) => {
  const { control } = useFormContext();
  const { field, fieldState } = useController({
    name: config.path.join('.'),
    control,
  });

  const value = field.value || '';

  return (
    <FormControl isInvalid={fieldState.invalid} isRequired={config.required}>
      <FormLabel>{config.label}</FormLabel>
      <ChakraNumberInput
        isInvalid={fieldState.invalid}
        isRequired={config.required}
        placeholder={config.placeholder}
        {...field}
        value={value}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </ChakraNumberInput>
      {config.description && (
        <FormHelperText>{config.description}</FormHelperText>
      )}
      {fieldState.error && (
        <FormErrorMessage>{fieldState.error.message}</FormErrorMessage>
      )}
    </FormControl>
  );
};
