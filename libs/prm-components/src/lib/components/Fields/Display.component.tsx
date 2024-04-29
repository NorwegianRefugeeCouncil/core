import { FormControl, FormHelperText, FormLabel, Text } from '@chakra-ui/react';
import { ControllerRenderProps, ControllerFieldState } from 'react-hook-form';

import { FieldConfig } from '../../config';

type Props = {
  config: FieldConfig;
  name: string;
} & ControllerFieldState &
  Omit<ControllerRenderProps, 'ref'>;

export const Display: React.FC<Props> = ({
  config: { description, label },
  value,
}) => (
  <FormControl>
    <FormLabel>{label}</FormLabel>
    <Text>{value}</Text>
    <FormHelperText>{description}</FormHelperText>
  </FormControl>
);
