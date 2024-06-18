import { Alert, AlertIcon, Box, Skeleton } from '@chakra-ui/react';
import {
  PositionDefinition,
  PositionDefinitionSchema,
  PositionPartialUpdate,
  PositionPartialUpdateSchema,
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
    position: { create, update, read },
  } = useUserContext();

  // Load entity when in read or edit mode
  React.useEffect(() => {
    if ((mode === 'read' || mode === 'edit') && positionId) {
      read.loadPosition(positionId);
    }
  }, [mode, positionId]);

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
            await create.onCreatePosition(data);
            navigate(`/admin/positions`);
          },
          defaultBackPath: `/admin/positions`,
          schema: PositionDefinitionSchema,
        };
      case 'edit':
        if (!positionId) {
          throw new Error('Position id is required');
        }
        return {
          ...update,
          onSubmit: (data: PositionPartialUpdate) =>
            update.onUpdatePosition(positionId, data),
          defaultBackPath: `/admin/positions/${positionId}`,
          schema: PositionPartialUpdateSchema,
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
        />
      </Skeleton>
    </Box>
  );
};
