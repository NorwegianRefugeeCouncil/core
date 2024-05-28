import { Box, Button, Flex, HStack, Heading, Spinner } from '@chakra-ui/react';
import { EntityFiltering } from '@nrcno/core-models';
import { FormProvider, useForm } from 'react-hook-form';

import { EntityUIConfig } from '../config';

import { Field } from './Fields';

type Props = {
  id: string;
  config: EntityUIConfig['filtering'];
  title?: string;
  onSubmit: (data: EntityFiltering) => void;
  onClear?: () => void;
  isSubmitting?: boolean;
  filters: EntityFiltering;
};

export const EntityFilterForm: React.FC<Props> = ({
  id,
  config,
  title,
  onSubmit,
  onClear,
  isSubmitting,
  filters,
}) => {
  const form = useForm<EntityFiltering>({ defaultValues: filters });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} id={id}>
        <Flex direction="column">
          <Flex direction="column" alignItems="flex-start">
            {title && <Heading mb={4}>{title}</Heading>}
            {isSubmitting && <Spinner colorScheme="primary" size="lg" />}
          </Flex>

          <Flex direction="column">
            {config.map((field) => {
              return <Field config={field} key={field.path.join('.')}></Field>;
            })}
          </Flex>

          <Flex
            alignItems="flex-end"
            bg="white"
            bottom={-2}
            direction="row"
            gap={4}
            position="sticky"
            py={4}
            zIndex="docked"
          >
            <Button
              colorScheme="primary"
              variant="outline"
              onClick={onClear}
              disabled={isSubmitting}
            >
              Clear
            </Button>
            <Button
              colorScheme="primary"
              type="submit"
              disabled={!form.formState.isValid || isSubmitting}
            >
              Search
            </Button>
          </Flex>
        </Flex>
      </form>
    </FormProvider>
  );
};
