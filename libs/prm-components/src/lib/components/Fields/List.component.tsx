import { Box, Button, Flex, FormLabel } from '@chakra-ui/react';
import {
  Control,
  FormProvider,
  UseFieldArrayUpdate,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form';

import { FieldConfig, ListFieldConfig } from '../../config';

import { Field } from '.';

type Props = {
  config: ListFieldConfig;
};

export const List: React.FC<Props> = ({ config }) => {
  const { control } = useFormContext();
  const name = config.path.join('.');

  const { fields, append, remove, update } = useFieldArray({
    control,
    name,
  });
  console.log('LIST', name, config.children, fields);

  return (
    <Flex>
      <Box>
        <FormLabel>{config.label}</FormLabel>
        {fields.map((field: Record<'id', string>, i: number) => (
          <fieldset key={field.id}>
            <SubForm
              control={control}
              update={update}
              index={i}
              value={field}
              config={config.children}
            />
            {/* <Flex align={'center'}>
              {config.children.map((childConfig: FieldConfig) => {
                const innerPath = [...config.path, `${i}`, ...childConfig.path];
                const innerConfig = {
                  ...childConfig,
                  path: innerPath,
                };
                console.log('FIELD', field);
                return (
                  <Field
                    key={innerConfig.path.join('.')}
                    config={innerConfig}
                  />
                );
              })}
              <Button
                onClick={handleSubmit((data) => {
                  console.log('SUBMIT', data);
                  update(i, data);
                })}
              >
                add
              </Button>{' '}
            </Flex> */}
            <Button onClick={() => remove(i)}>remove</Button>
          </fieldset>
        ))}
      </Box>
      <Button onClick={append}>new</Button>
    </Flex>
  );
};

type SubFormProps = {
  update: UseFieldArrayUpdate;
  index: number;
  value: Record<'id', string>;
  control: Control;
  config: FieldConfig[];
};

const SubForm: React.FC<SubFormProps> = ({
  update,
  index,
  value,
  config,
  control,
}) => {
  const form = useForm({
    defaultValues: value,
  });

  return (
    <FormProvider {...form}>
      <form id={`${index}`}>
        {config.map((childConfig: FieldConfig) => {
          return (
            <Field key={childConfig.path.join('.')} config={childConfig} />
          );
        })}

        <Button
          type="submit"
          onClick={form.handleSubmit((data) => {
            const updateData:any = {};
            config.forEach((childConfig) => {
              console.log(
                'child path update',
                childConfig.path,
                (updateData[childConfig.path.join('.')] =
                  data[childConfig.path.join('.')] || childConfig.defaultValue),
              );
            });
            update(index, updateData);
          })}
        >
          Submit
        </Button>
      </form>
    </FormProvider>
  );
};
