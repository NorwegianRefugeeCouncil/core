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
import { useLocation, useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    if (!readOnly && form.formState.isDirty) {
      window.onbeforeunload = () => {
        if (window.confirm('Are you sure you want to leave?')) {
          return true;
        }
        return false;
      };
    } else {
      window.onbeforeunload = null;
    }

    return () => {
      window.onbeforeunload = null;
    };
  }, [form.formState.isDirty, readOnly]);

  const handleCancel = () => {
    if (
      !form.formState.isDirty ||
      window.confirm('Are you sure you want to cancel?')
    ) {
      if (location.state?.from) {
        navigate(-1);
      } else {
        navigate(defaultBackPath);
      }
    }
  };

  const handleEdit = () => {
    navigate(`${location.pathname}/edit`);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (onSubmit) {
      form.handleSubmit(onSubmit)(event);
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
            <Button
              colorScheme="secondary"
              disabled={isSubmitting}
              onClick={handleCancel}
            >
              {readOnly ? 'Back' : 'Cancel'}
            </Button>
            <Button
              colorScheme="primary"
              type={readOnly ? 'button' : 'submit'}
              disabled={!form.formState.isValid || isSubmitting}
              onClick={readOnly ? handleEdit : undefined}
            >
              {readOnly ? 'Edit' : 'Save'}
            </Button>
          </HStack>
        </Flex>
        <Accordion
          defaultIndex={config.sections.map((_, i) => i)}
          allowMultiple
          allowToggle
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
