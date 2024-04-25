import { Box, Button, Heading, HStack } from '@chakra-ui/react';
import { useForm, FormProvider } from 'react-hook-form';
import { Entity } from '@nrcno/core-models';

import { EntityUIConfig } from '../config';

import { Section } from './Section.component';

type Props = {
  id: string;
  config: EntityUIConfig['detail'];
  title: string;
  submit?: (data: Entity) => void;
  entity: Entity;
};

export const Form: React.FC<Props> = ({
  id,
  config,
  title,
  submit,
  entity,
}) => {
  const form = useForm<Entity>({
    defaultValues: entity,
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={submit && form.handleSubmit(submit)}>
        <Box>
          <Heading>{title}</Heading>
          {config.sections.map((section) => (
            <Section key={`${id}_${section.title}`} section={section} />
          ))}
          <HStack>
            <Button colorScheme="primary" type="reset">
              Cancel
            </Button>
            <Button colorScheme="primary" type="submit">
              Save
            </Button>
          </HStack>
        </Box>
      </form>
    </FormProvider>
  );
};
