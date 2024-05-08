import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  Spinner,
} from '@chakra-ui/react';
import { Entity } from '@nrcno/core-models';
import { FormProvider, useForm } from 'react-hook-form';
import {
  Link,
  useLocation,
  useNavigate,
  unstable_usePrompt,
} from 'react-router-dom';
import { useEffect } from 'react';

import { EntityUIConfig } from '../config';

import { Section } from './Section.component';

type Props = {
  id: string;
  config: EntityUIConfig['detail'];
  title: string;
  onSubmit?: (data: Entity) => void;
  entity?: Entity | undefined;
  isSubmitting?: boolean;
  defaultBackPath: string;
  readOnly: boolean;
};

export const EntityDetailForm: React.FC<Props> = ({
  id,
  config,
  title,
  onSubmit,
  entity,
  isSubmitting,
  defaultBackPath,
  readOnly,
}) => {
  const form = useForm<Entity>({
    defaultValues: entity,
    disabled: readOnly || isSubmitting,
  });

  useEffect(() => {
    form.reset(entity);
  }, [JSON.stringify(entity), readOnly]);

  const navigate = useNavigate();
  const location = useLocation();

  // Client side blocking
  unstable_usePrompt({
    message: 'Are you sure you want to leave?',
    when: !readOnly && form.formState.isDirty,
  });

  // Document blocking
  useEffect(() => {
    if (!readOnly && form.formState.isDirty) {
      window.onbeforeunload = (event: BeforeUnloadEvent) => {
        event.preventDefault();
        // eslint-disable-next-line no-param-reassign
        event.returnValue = true;
      };
    } else {
      window.onbeforeunload = null;
    }

    return () => {
      window.onbeforeunload = null;
    };
  }, [form.formState.isDirty, readOnly]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (onSubmit) {
      form.handleSubmit(onSubmit)(event);
      form.reset();
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} id={id}>
        <Flex
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          zIndex="docked"
          position="sticky"
          top={0}
          bg="white"
          pt={2}
        >
          <Flex direction="row" gap={4} alignItems="flex-start">
            <Heading mb={4}>{title}</Heading>
            {isSubmitting && <Spinner colorScheme="primary" size="lg" />}
          </Flex>
          <HStack>
            <Link to={defaultBackPath}>
              <Button colorScheme="secondary" disabled={isSubmitting}>
                {readOnly ? 'Back' : 'Cancel'}
              </Button>
            </Link>
            {readOnly ? (
              <Link to={`${location.pathname.replace(/\/$/, '')}/edit`}>
                <Button colorScheme="primary">Edit</Button>
              </Link>
            ) : (
              <Button
                colorScheme="primary"
                type={'submit'}
                disabled={!form.formState.isValid || isSubmitting}
              >
                Save
              </Button>
            )}
          </HStack>
        </Flex>
        <Accordion
          defaultIndex={config.sections.map((_, i) => i)}
          allowMultiple
        >
          {config.sections.map((section) => (
            <AccordionItem key={`${id}_${section.title}`}>
              <Heading as="h3">
                <AccordionButton>
                  <Box as="span" flex="1" textAlign="left">
                    <Heading as="h3" size="md">
                      {section.title}
                    </Heading>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </Heading>
              <AccordionPanel pb={4}>
                <Section section={section} />
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </form>
    </FormProvider>
  );
};
