import { Alert, AlertIcon, Box, Skeleton } from '@chakra-ui/react';
import {
  TeamDefinition,
  TeamDefinitionSchema,
  TeamPartialUpdate,
  TeamPartialUpdateSchema,
  TeamSchema,
} from '@nrcno/core-models';
import { useNavigate, useParams } from 'react-router-dom';
import { SubmitStatus } from '@nrcno/core-shared-frontend';
import * as React from 'react';

import { TeamDetailForm } from '../components/TeamDetailForm.component';
import { useUserContext } from '../user.context';

type Props = {
  mode: 'create' | 'read' | 'edit';
};

export const TeamDetailPage: React.FC<Props> = ({ mode }) => {
  const navigate = useNavigate();
  const { teamId } = useParams();

  const {
    team: { create, update, read },
  } = useUserContext();

  // Load entity when in read or edit mode
  React.useEffect(() => {
    if ((mode === 'read' || mode === 'edit') && teamId) {
      read.onRead(teamId);
    }
  }, [mode, teamId]);

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

  const { status, error, onSubmit, defaultBackPath, schema } = (() => {
    switch (mode) {
      case 'create':
        return {
          ...create,
          onSubmit: async (data: TeamDefinition) => {
            await create.onCreate(data);
            navigate(`/admin/teams`);
          },
          defaultBackPath: `/admin/teams`,
          schema: TeamDefinitionSchema,
        };
      case 'edit':
        if (!teamId) {
          throw new Error('Team id is required');
        }
        return {
          ...update,
          onSubmit: (data: TeamPartialUpdate) => update.onUpdate(teamId, data),
          defaultBackPath: `/admin/teams/${teamId}`,
          schema: TeamPartialUpdateSchema,
        };
      case 'read':
        return {
          ...read,
          onSubmit: () => {},
          defaultBackPath: `/admin/teams`,
          schema: TeamSchema,
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
          Team saved successfully
        </Alert>
      )}
      <Skeleton isLoaded={!isLoading}>
        <TeamDetailForm
          onSubmit={onSubmit}
          team={read.data}
          isSubmitting={isSubmitting}
          defaultBackPath={defaultBackPath}
          readOnly={mode === 'read'}
          schema={schema}
        />
      </Skeleton>
    </Box>
  );
};
