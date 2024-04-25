import { UseControllerProps } from 'react-hook-form';

import { FieldConfig } from '../../config';

import { TextInput } from './TextInput.component';

type Props = {
  config: FieldConfig;
  name: string;
};

export const Hidden: React.FC<Props & UseControllerProps> = (props) => (
  <TextInput {...props} />
);
