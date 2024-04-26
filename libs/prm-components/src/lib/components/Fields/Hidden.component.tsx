import { ControllerRenderProps, ControllerFieldState } from 'react-hook-form';

import { FieldConfig } from '../../config';

import { TextInput } from './TextInput.component';

type Props = {
  config: FieldConfig;
  name: string;
} & Omit<ControllerRenderProps, 'ref'> &
  ControllerFieldState;

export const Hidden: React.FC<Props> = (props) => <TextInput {...props} />;
