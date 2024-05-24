import { Button, Flex, HStack, Heading, Spinner } from '@chakra-ui/react';
import { Entity } from '@nrcno/core-models';
import { FormProvider, useForm } from 'react-hook-form';

import { EntityUIConfig } from '../config';

import { Field } from './Fields';

type Props = {
  id: string;
  config: EntityUIConfig['search'];
  title?: string;
  onSubmit?: (data: Entity) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
};

export const EntitySearchForm: React.FC<Props> = ({
  id,
  config,
  title,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const form = useForm<Entity>();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (onSubmit) {
      form.handleSubmit(onSubmit)(event);
      form.reset();
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} id={id}>
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
