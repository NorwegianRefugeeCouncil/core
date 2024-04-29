import { Box, Button, Heading, HStack } from '@chakra-ui/react';
import { Entity } from '@nrcno/core-models';
import { FormProvider, useForm } from 'react-hook-form';

import { EntityUIConfig } from '../config';

import { Section } from './Section.component';

type Props = {
  id: string;
  config: EntityUIConfig['detail'];
  title: string;
  submit?: (data: Entity) => void;
  entity?: Entity | undefined;
};

export const EntityDetailForm: React.FC<Props> = ({
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
      <form onSubmit={submit && form.handleSubmit(submit)} id={id}>
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
