import { Box, FormLabel } from '@chakra-ui/react';
import { ControllerRenderProps } from 'react-hook-form';

import { FieldConfig, ListFieldConfig } from '../../config';

import { Field } from '.';

type Props = {
  config: ListFieldConfig;
  name: string;
} & Omit<ControllerRenderProps, 'ref'>;

export const List: React.FC<Props> = ({
  config: { label, children, map },
  name,
  value,
}) => {
  const mapped = map ? value.map(map) : children;
  return (
    <Box>
      <FormLabel>{label}</FormLabel>
      {mapped.map((v: boolean, i: number) => {
        if (!v) return null;
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
