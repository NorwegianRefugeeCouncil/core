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

  return (
    <Flex>
      <Box>
        <FormLabel>{config.label}</FormLabel>
        {fields.map((field: Record<'id', string>, i: number) => (
          <fieldset key={field.id}>
            <Flex align={'center'}>
              <SubForm
                control={control}
                update={update}
                index={i}
                value={field}
                config={config.children}
              />
              <Button onClick={() => remove(i)}>remove</Button>
            </Flex>
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
      <Flex align={'center'}>
        {config.map((childConfig: FieldConfig) => {
          return (
            <Field key={childConfig.path.join('.')} config={childConfig} />
          );
        })}

        <Button
          type="submit"
          onClick={form.handleSubmit((data) => {
            const updateData: object = {};

            config.forEach((childConfig) => {
              updateData[childConfig.path.join('.')] =
                data[childConfig.path.join('.')] || childConfig.defaultValue;
            });
            console.log('child path update', updateData);
            update(index, updateData);
          })}
        >
          Submit
        </Button>
      </Flex>
    </FormProvider>
  );
};
