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
  submit?: (data: Entity) => void;
  entity?: Entity | undefined;
  isLoading?: boolean;
};

export const EntityDetailForm: React.FC<Props> = ({
  id,
  config,
  title,
  submit,
  entity,
  isLoading,
}) => {
  const form = useForm<Entity>({
    defaultValues: entity,
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.onbeforeunload = () => {
      if (form.formState.isDirty) {
        if (window.confirm('Are you sure you want to leave?')) {
          return true;
        }
        return false;
      }
      return true;
    };
    return () => {
      window.onbeforeunload = null;
    };
  }, [form.formState.isDirty]);

  const handleCancel = () => {
    if (
      !form.formState.isDirty ||
      window.confirm('Are you sure you want to cancel?')
    ) {
      if (location.state?.from) {
        navigate(-1);
      } else {
        navigate('/prm/participants');
      }
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={submit && form.handleSubmit(submit)} id={id}>
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
            {isLoading && <Spinner colorScheme="primary" size="lg" />}
          </Flex>
          <HStack>
            <Button
              colorScheme="secondary"
              disabled={isLoading}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              colorScheme="primary"
              type="submit"
              disabled={!form.formState.isValid || isLoading}
            >
              Save
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
