import { Alert, AlertIcon, Box, Skeleton } from '@chakra-ui/react';
import {
  PositionDefinition,
  PositionDefinitionSchema,
  PositionUpdate,
  PositionUpdateSchema,
  PositionSchema,
} from '@nrcno/core-models';
import { useNavigate, useParams } from 'react-router-dom';
import { SubmitStatus } from '@nrcno/core-shared-frontend';
import * as React from 'react';

import { PositionDetailForm } from '../components/PositionDetailForm.component';
import { useUserContext } from '../user.context';

type Props = {
  mode: 'create' | 'read' | 'edit';
};

export const PositionDetailPage: React.FC<Props> = ({ mode }) => {
  const navigate = useNavigate();
  const { positionId } = useParams();

  const {
    user,
    position: { create, update, read },
  } = useUserContext();

  // Load entity when in read or edit mode
  React.useEffect(() => {
    if ((mode === 'read' || mode === 'edit') && positionId) {
      read.onRead(positionId);
    }
  }, [mode, positionId]);

  React.useEffect(() => {
    if (mode === 'create' || mode === 'edit') {
      user.list.getUserList({
        startIndex: 0,
        pageSize: 1000,
      });
    }
  }, [mode]);

  // Reset form when switching between create and edit mode
  React.useEffect(() => {
    if (mode === 'edit' || mode === 'create') {
      create.reset();
      update.reset();
    }
    return () => {
      create.reset();
      update.reset();
    };
  }, [mode]);

  const { data, status, error, onSubmit, defaultBackPath, schema } = (() => {
    switch (mode) {
      case 'create':
        return {
          ...create,
          onSubmit: async (data: PositionDefinition) => {
            await create.onCreate(data);
            navigate(`/admin/positions`);
          },
          defaultBackPath: `/admin/positions`,
          schema: PositionDefinitionSchema,
          data: undefined,
        };
      case 'edit':
        if (!positionId) {
          throw new Error('Position id is required');
        }
        return {
          ...update,
          onSubmit: (data: PositionUpdate) => update.onUpdate(positionId, data),
          defaultBackPath: `/admin/positions/${positionId}`,
          schema: PositionUpdateSchema,
          data: update.data ? update.data : read.data,
        };
      case 'read':
        return {
          ...read,
          onSubmit: () => {},
          defaultBackPath: `/admin/positions`,
          schema: PositionSchema,
        };
    }
  })();

  const isSuccess = create.status === SubmitStatus.SUCCESS;
  const isLoading = status === SubmitStatus.SUBMITTING;
  const isError = status === SubmitStatus.ERROR;

  const isSubmitting = create.status === SubmitStatus.SUBMITTING;

  return (
    <Box p={10} maxW="850px" ml="auto" mr="auto">
      {isError && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error?.message}
        </Alert>
      )}
      {isSuccess && (
        <Alert status="success" mb={4}>
          <AlertIcon />
          Position saved successfully
        </Alert>
      )}
      <Skeleton isLoaded={!isLoading}>
        <PositionDetailForm
          onSubmit={onSubmit}
          position={data}
          isSubmitting={isSubmitting}
          defaultBackPath={defaultBackPath}
          readOnly={mode === 'read'}
          schema={schema}
          users={user.list.data?.items ?? []}
        />
      </Skeleton>
    </Box>
  );
};
