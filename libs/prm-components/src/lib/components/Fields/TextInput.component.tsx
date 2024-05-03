import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { useController, useFormContext } from 'react-hook-form';

import { FieldConfig } from '../../config';

type Props = {
  config: FieldConfig;
};

export const TextInput: React.FC<Props> = ({ config }) => {
  const name = config.path.join('.');
  const { register, control, handleSubmit } = useFormContext();
  const { field, fieldState } = useController({
    name: config.path.join('.'),
    control,
  });

  // const { register, handleSubmit } = useForm({
  //   defaultValues: value
  // });

  return (
    <FormControl>
      <FormLabel>{config.label}</FormLabel>
      <Input
        isInvalid={fieldState.invalid}
        isRequired={config.required}
        placeholder={config.placeholder}
        type={config.dataType}
        readOnly={false}
        {...field}
        {...register(name, { required: true })}

      />
      <FormHelperText>{config.description}</FormHelperText>
      {fieldState.error && (
        <FormErrorMessage>{fieldState.error.message}</FormErrorMessage>
      )}
    </FormControl>
  );
};
