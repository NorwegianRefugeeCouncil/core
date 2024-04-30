import { Box, Button, Flex, FormLabel } from '@chakra-ui/react';
import {
  ControllerRenderProps,
  useFieldArray,
  useFormContext,
} from 'react-hook-form';

import { FieldConfig, ListFieldConfig } from '../../config';

import { Field } from '.';

type Props = {
  config: ListFieldConfig;
  name: string;
} & Omit<ControllerRenderProps, 'ref'>;

export const List: React.FC<Props> = ({
  config: { label, children, path },
  name,
}) => {
  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  return (
    <Flex>
      <Box>
        <FormLabel>{label}</FormLabel>
        {fields.map((field: Record<'id', string>, i: number) => (
          <Flex key={field.id} align={'center'}>
            {children.map((childConfig: FieldConfig) => {
              const innerPath = [...path, `${i}`, childConfig.path.join('.')];
              const innerConfig = {
                ...childConfig,
                path: innerPath,
              };
              return (
                <Field key={innerConfig.path.join('.')} config={innerConfig} />
              );
            })}
            <Button onClick={() => remove(i)}>remove</Button>
          </Flex>
        ))}
      </Box>
      <Button onClick={append}>add item</Button>
    </Flex>
  );
};
