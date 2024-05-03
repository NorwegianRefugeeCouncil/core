import { Box, Button, Flex, FormLabel } from '@chakra-ui/react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { FieldConfig, ListFieldConfig } from '../../config';

import { Field } from '.';

type Props = {
  config: ListFieldConfig;
};

export const List: React.FC<Props> = ({ config }) => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: config.path.join('.'),
  });

  return (
    <Flex>
      <Box>
        <FormLabel>{config.label}</FormLabel>
        {fields.map((field: Record<'id', string>, i: number) => (
          <fieldset key={field.id}>
            <Flex align={'center'}>
              {config.children.map((childConfig: FieldConfig) => (
                <Field
                  key={childConfig.path.join('.')}
                  config={{
                    ...childConfig,
                    path: [...config.path, i.toString(), ...childConfig.path],
                  }}
                />
              ))}
              <Button onClick={() => remove(i)}>remove</Button>
            </Flex>
          </fieldset>
        ))}
      </Box>
      <Button
        onClick={() => {
          const defaults: Record<string, string> = {};
          config.children.forEach((childConfig) => {
            defaults[childConfig.path.join('.')] = childConfig.defaultValue;
          });
          append(defaults);
        }}
      >
        new
      </Button>
    </Flex>
  );
};
