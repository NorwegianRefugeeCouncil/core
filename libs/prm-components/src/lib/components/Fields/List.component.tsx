import { Box, Button, Flex, FormLabel } from '@chakra-ui/react';
import {
  ControllerRenderProps,
  Form,
  useFieldArray,
  useFormContext,
} from 'react-hook-form';
import { ContactMeans } from '@nrcno/core-models';
import { useState } from 'react';

import {
  Component,
  DataType,
  FieldConfig,
  ListFieldConfig,
} from '../../config';
import { optionsFromEnum } from '../../config/utils';

import { TextInput } from './TextInput.component';
import { Select } from './Select.component';

import { Field } from '.';

type Props = {
  config: ListFieldConfig;
  name: string;
} & Omit<ControllerRenderProps, 'ref'>;

export const List: React.FC<Props> = ({
  config: { label, children, filter, path, options, defaults },
  name,
  value,
}) => {
  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const filtered = value ? (filter ? fields.map(filter) : value) : [];
  console.log('FIELDS', name, fields, value);

  return (
    <Flex>
      <Box>
        <FormLabel>{label}</FormLabel>
        {fields.map((field: any, i: number) => {
          if (filter && !filter(field)) return null;

          return (
            <Flex direction={'row'} key={field.id} align={'center'}>
              {children.map((childConfig: FieldConfig) => {
                const innerPath = [...path, `${i}`, childConfig.path.join('.')];
                const innerConfig = {
                  ...childConfig,
                  path: innerPath,
                };
                return (
                  <Box>
                    <Field config={innerConfig} />
                  </Box>
                );
              })}
              <Button onClick={() => remove(i)}>remove</Button>
            </Flex>
          );
        })}
      </Box>
      <Button
        onClick={(a) => {
          append(defaults);
        }}
        disabled={fields.length === options?.length}
      >
        add item
      </Button>
    </Flex>
  );
};
