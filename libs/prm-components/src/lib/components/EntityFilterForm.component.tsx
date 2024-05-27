import { Button, Flex, HStack, Heading, Spinner } from '@chakra-ui/react';
import { EntityFiltering } from '@nrcno/core-models';
import { FormProvider, useForm } from 'react-hook-form';

import { EntityUIConfig } from '../config';

import { Field } from './Fields';

type Props = {
  id: string;
  config: EntityUIConfig['filtering'];
  title?: string;
  onSubmit: (data: EntityFiltering) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  filters: EntityFiltering;
};

export const EntityFilterForm: React.FC<Props> = ({
  id,
  config,
  title,
  onSubmit,
  onCancel,
  isSubmitting,
  filters,
}) => {
  const form = useForm<EntityFiltering>({ defaultValues: filters });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} id={id}>
        {config.map((field) => {
          return <Field config={field} key={field.path.join('.')}></Field>;
        })}
        <Flex
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          zIndex="docked"
          position="sticky"
          bottom={0}
          bg="white"
          pt={2}
        >
          <Flex direction="row" gap={4} alignItems="flex-start">
            {title && <Heading mb={4}>{title}</Heading>}
            {isSubmitting && <Spinner colorScheme="primary" size="lg" />}
          </Flex>

          <HStack>
            <Button
              colorScheme="primary"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            {
              <Button
                colorScheme="primary"
                type={'submit'}
                disabled={!form.formState.isValid || isSubmitting}
              >
                Search
              </Button>
            }
          </HStack>
        </Flex>
      </form>
    </FormProvider>
  );
};
