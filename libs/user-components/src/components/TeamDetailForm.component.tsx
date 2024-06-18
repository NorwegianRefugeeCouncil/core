import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, unstable_usePrompt } from 'react-router-dom';
import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Heading,
  Input,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { Team } from '@nrcno/core-models';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

type Props = {
  team?: Team;
  onSubmit?: (data: Team) => void;
  isSubmitting?: boolean;
  readOnly: boolean;
  schema: z.ZodType<any, any>;
  defaultBackPath: string;
};

export const TeamDetailForm: React.FC<Props> = ({
  team,
  onSubmit,
  isSubmitting,
  readOnly,
  schema,
  defaultBackPath,
}) => {
  const {
    register,
    formState: { errors, isDirty, isValid },
    handleSubmit: formHandleSubmit,
    reset,
  } = useForm<Team>({
    mode: 'onChange',
    defaultValues: team,
    disabled: readOnly || isSubmitting,
    criteriaMode: 'all',
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    reset(team);
  }, [JSON.stringify(team), readOnly]);

  const location = useLocation();

  // Client side blocking
  unstable_usePrompt({
    message: 'Are you sure you want to leave?',
    when: !readOnly && isDirty,
  });

  // Document blocking
  useEffect(() => {
    if (!readOnly && isDirty) {
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
  }, [isDirty, readOnly]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (onSubmit) {
      formHandleSubmit(onSubmit)(event);
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit} id={`team-${team?.id ?? 'new'}`}>
      <Flex
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        zIndex="docked"
        team="sticky"
        top={0}
        bg="white"
        pt={2}
      >
        <Flex direction="row" gap={4} alignItems="flex-start">
          <Heading mb={4}>{team?.name ?? 'New team'}</Heading>
          {isSubmitting && <Spinner colorScheme="primary" size="lg" />}
        </Flex>
        <HStack>
          <Link to={defaultBackPath}>
            <Button colorScheme="secondary" isDisabled={isSubmitting}>
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
              isDisabled={!isValid || isSubmitting}
            >
              Save
            </Button>
          )}
        </HStack>
      </Flex>

      <Flex direction="column" gap={4}>
        {team && (
          <FormControl>
            <FormLabel>ID</FormLabel>
            <Text>{team.id}</Text>
          </FormControl>
        )}

        <FormControl isInvalid={Boolean(errors.name)} isRequired>
          <FormLabel>Name</FormLabel>
          <Input
            isInvalid={Boolean(errors.name)}
            isRequired
            type="text"
            {...register('name')}
          />
          {errors.name && (
            <FormErrorMessage>{errors.name.message}</FormErrorMessage>
          )}
        </FormControl>
      </Flex>
    </form>
  );
};
