import { useMemo } from 'react';
import { Alert, AlertIcon, Box } from '@chakra-ui/react';

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
  }, [mode]);

  const defaultBackPath = useMemo(() => {
    switch (mode) {
      case 'create':
      case 'read':
        return `/prm/${entityType}`;
      case 'edit':
        return `/prm/${entityType}/${entityId}`;
    }
  }, [mode, entityType, entityId]);

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
          {entityType} saved successfully
        </Alert>
      )}
      <EntityDetailForm
        id={`entity_detail_${entityType}`}
        title={title}
        config={config}
        onSubmit={onSubmit}
        entity={data}
        isSubmitting={isSubmitting}
        defaultBackPath={defaultBackPath}
        readOnly={mode === 'read'}
      />
    </Box>
  );
};
