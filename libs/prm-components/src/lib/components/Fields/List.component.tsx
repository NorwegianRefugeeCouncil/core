import { Flex, Heading, IconButton } from '@chakra-ui/react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';

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

  const handleAppend = () => {
    const defaults: Record<string, string> = {};
    config.children.forEach((childConfig) => {
      defaults[childConfig.path.join('.')] =
        childConfig.defaultValue || undefined;
    });
    append(defaults);
  };

  return (
    <Flex direction="column">
      <Flex gap={4} w="100%" justifyContent="space-between">
        <Heading as="h4" size="sm">
          {config.label}
        </Heading>
        <IconButton aria-label="Add" onClick={handleAppend} size="sm">
          <AddIcon />
        </IconButton>
      </Flex>
      <Flex direction="column" gap={4}>
        {fields.map((field: Record<'id', string>, i: number) => (
          <Flex key={field.id} alignItems="flex-end" gap={4}>
            {config.children.map((childConfig: FieldConfig) => {
              const innerConfig = {
                ...childConfig,
                path: [...config.path, `${i}`, ...childConfig.path],
              };
              return (
                <Field key={innerConfig.path.join('.')} config={innerConfig} />
              );
            })}
            <IconButton aria-label="Remove" onClick={() => remove(i)}>
              <DeleteIcon />
            </IconButton>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};
