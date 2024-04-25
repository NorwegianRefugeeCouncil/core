import { Box, FormLabel } from '@chakra-ui/react';
import { UseControllerProps, ControllerRenderProps } from 'react-hook-form';

import { FieldConfig, ListFieldConfig } from '../../config';

import { Field } from '.';

type Props = {
  config: ListFieldConfig;
  name: string;
};

// TODO figure out Props
export const List: React.FC<
  Props & UseControllerProps & Omit<ControllerRenderProps, 'ref'>
> = ({ config: { label, children, filter }, name, ...props }) => {
  const filtered = filter ? props.value.map(filter) : children;
  return (
    <Box>
      <FormLabel>{label}</FormLabel>
      {filtered.map((v: object, i: number) => {
        if (!v) return;
        return children.map((childConfig: FieldConfig) => {
          const innerConfig = {
            ...childConfig,
            path: [name, `${i}`, childConfig.path.join('.')],
          };
          return <Field config={innerConfig} />;
        });
      })}
    </Box>
  );
};
