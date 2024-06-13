import { useMemo } from 'react';
import { Alert, AlertIcon, Box, Skeleton } from '@chakra-ui/react';
import {
  getEntityDefinitionSchema,
  getEntitySchema,
  getEntityUpdateSchema,
} from '@nrcno/core-models';
import { isAxiosError } from 'axios';
import { ZodError } from 'zod';

import { EntityDetailForm } from '../../components';
import { useEntityDetailPage } from '../../hooks/useEntityDetailPage.hook';

type Props = {
  mode: 'create' | 'read' | 'edit';
};

export const EntityDetailPage: React.FC<Props> = ({ mode }) => {
  const {
    entityType,
    entityId,
    config,
    isLoading,
    isSubmitting,
    isError,
    isSuccess,
    error,
    onSubmit,
    data,
  } = useEntityDetailPage(mode);

  const title = useMemo(() => {
    switch (mode) {
      case 'create':
        return `New ${entityType}`;
      case 'edit':
        return `Edit ${entityType}`;
      case 'read':
        return entityType;
    }
  }, [mode, entityType]);

  const defaultBackPath = useMemo(() => {
    switch (mode) {
      case 'create':
      case 'read':
        return `/prm/${entityType}`;
      case 'edit':
        return `/prm/${entityType}/${entityId}`;
    }
  }, [mode, entityType, entityId]);

  const schema = useMemo(() => {
    switch (mode) {
      case 'create':
        return getEntityDefinitionSchema(entityType);
      case 'edit':
        return getEntityUpdateSchema(entityType);
      case 'read':
        return getEntitySchema(entityType);
    }
  }, [mode, entityType]);

  const errorMessage = (() => {
    if (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 400) {
          return 'There was an error with the data you submitted. Please check the form and try again.';
        }
        return `Internal error, contact support. [${error.response?.status}] [${error.response?.data?.message}]`;
      }
      return 'An error occurred. Please try again.';
    }
    return '';
  })();

  const validationError = (() => {
    if (error && isAxiosError(error) && error.response?.status === 400) {
      return new ZodError(error.response.data.errors);
    }
    return null;
  })();

  return (
    <Box p={10} maxW="850px" ml="auto" mr="auto">
      {isError && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {errorMessage}
        </Alert>
      )}
      {isSuccess && (
        <Alert status="success" mb={4}>
          <AlertIcon />
          {entityType} saved successfully
        </Alert>
      )}
      <Skeleton isLoaded={!isLoading}>
        <EntityDetailForm
          id={`entity_detail_${entityType}`}
          title={title}
          config={config}
          onSubmit={onSubmit}
          entity={data}
          isSubmitting={isSubmitting}
          defaultBackPath={defaultBackPath}
          readOnly={mode === 'read'}
          schema={schema}
          error={validationError}
        />
      </Skeleton>
    </Box>
  );
};
