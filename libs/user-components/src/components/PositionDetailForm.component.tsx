import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
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
import { Position, User } from '@nrcno/core-models';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { PositionStaff } from './PositionStaff.component';

type Props = {
  position?: Position;
  onSubmit?: (data: PositionWithStaffIds) => void;
  isSubmitting?: boolean;
  readOnly: boolean;
  schema: z.ZodType<any, any>;
  defaultBackPath: string;
  users: User[];
};

type PositionWithStaffIds = Omit<Position, 'staff'> & { staff: string[] };
export const PositionDetailForm: React.FC<Props> = ({
  position,
  onSubmit,
  isSubmitting,
  readOnly,
  schema,
  defaultBackPath,
  users,
}) => {
  const form = useForm<PositionWithStaffIds>({
    mode: 'onChange',
    defaultValues: position
      ? { ...position, staff: position.staff.map((s) => s.id) }
      : undefined,
    disabled: readOnly || isSubmitting,
    criteriaMode: 'all',
    resolver: zodResolver(schema),
  });
  const {
    register,
    formState: { errors, isDirty, isValid },
    handleSubmit: formHandleSubmit,
    reset,
  } = form;

  useEffect(() => {
    reset(
      position
        ? { ...position, staff: position.staff.map((s) => s.id) }
        : undefined,
    );
  }, [JSON.stringify(position), readOnly]);

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
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} id={`position-${position?.id ?? 'new'}`}>
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
            <Heading mb={4}>{position?.name ?? 'New position'}</Heading>
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
          {position && (
            <FormControl>
              <FormLabel>ID</FormLabel>
              <Text>{position.id}</Text>
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

          <PositionStaff
            users={users.length > 0 ? users : position?.staff ?? []}
          />
        </Flex>
      </form>
    </FormProvider>
  );
};
