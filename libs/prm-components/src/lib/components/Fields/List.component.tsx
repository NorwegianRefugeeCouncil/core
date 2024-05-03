import { Box, Button, Flex, FormLabel } from '@chakra-ui/react';
import {
  Control,
  UseFieldArrayUpdate,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form';

import { FieldConfig, ListFieldConfig, config } from '../../config';

import { TextInput } from './TextInput.component';

import { Field } from '.';

type Props = {
  config: ListFieldConfig;
};

export const List: React.FC<Props> = ({ config }) => {
  const { control, handleSubmit } = useFormContext();
  const name = config.path.join('.');

  const { fields, append, remove, update } = useFieldArray({
    control,
    name,
  });
  console.log('LIST', name, config.children, fields);
  // const appendItem = handleSubmit((data) => {
  //   console.log();
  //   update(i, data);
  // });

  return (
    <Flex>
      <Box>
        <FormLabel>{config.label}</FormLabel>
        {fields.map((field: Record<'id', string>, i: number) => (
          <fieldset key={field.id}>
            {/* <SubForm
              control={control}
              update={update}
              index={index}
              value={field}
              config={children}
            /> */}
            <Flex align={'center'}>
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
  const { register, handleSubmit } = useForm({
    defaultValues: value,
  });

  return (
    <div>
      {/* <TextInput
        placeholder="first name"
        {...register(`firstName`, { required: true })}
      /> */}

      {config.map((childConfig: FieldConfig) => {
        // const innerPath = [`${i}`, ...childConfig.path];
        // const innerConfig = {
        //   ...childConfig,
        //   path: innerPath,
        // };
        return <Field key={childConfig.path.join('.')} config={childConfig} />;
      })}

      <button
        type="button"
        onClick={handleSubmit((data) => {
          update(index, data);
        })}
      >
        Submit
      </button>
    </div>
  );
};
