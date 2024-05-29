import { FormControl, FormHelperText, FormLabel, Text } from '@chakra-ui/react';
import { useFormContext, useController } from 'react-hook-form';

import { FieldConfig } from '../../config';

type Props = {
  config: FieldConfig;
};

export const Display: React.FC<Props> = ({ config }) => {
  const { control } = useFormContext();
  const { field } = useController({
    name: config.path.join('.'),
    control,
  });

  return (
    <FormControl>
      <FormLabel>{config.label}</FormLabel>
      <Text>
        {config.dataType === 'date' && field.value
          ? field.value.toLocaleDateString()
          : field.value || ''}
      </Text>
      {config.description && (
        <FormHelperText>{config.description}</FormHelperText>
      )}
    </FormControl>
  );
};
