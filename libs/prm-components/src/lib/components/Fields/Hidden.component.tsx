import { Input } from '@chakra-ui/react';
import { useController, useFormContext } from 'react-hook-form';

import { FieldConfig } from '../../config';

type Props = {
  config: FieldConfig;
};

export const Hidden: React.FC<Props> = ({ config }) => {
  const { control } = useFormContext();
  const { field } = useController({
    name: config.path.join('.'),
    control,
  });

  return (
    <Input
      isRequired={config.required}
      placeholder={config.placeholder}
      type={'hidden'}
      readOnly={false}
      {...field}
    />
  );
};
