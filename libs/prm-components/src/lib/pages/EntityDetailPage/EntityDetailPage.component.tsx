import { useMemo } from 'react';
import { Alert, AlertIcon, Box, Spinner } from '@chakra-ui/react';

import { EntityDetailForm } from '../../components';
import { useEntityDetailPage } from '../../hooks/useEntityDetailPage.hook';

type Props = {
  mode: 'create' | 'read' | 'edit';
};

export const EntityDetailPage: React.FC<Props> = ({ mode }) => {
  const {
    entityType,
    config,
    isLoading,
    isError,
    isSuccess,
    error,
    onSubmit,
    data,
  } = useEntityDetailPage(mode);

  const title = useMemo(() => {
    switch (mode) {
      case 'create':
        return 'New participant';
      case 'edit':
        return 'Edit participant';
      case 'read':
        return 'Participant';
    }
  }, [mode]);

  const successMessage = useMemo(() => {
    switch (mode) {
      case 'create':
        return `${entityType} created successfully`;
      case 'edit':
        return `${entityType} updated successfully`;
      case 'read':
        return '';
    }
  }, [mode, entityType]);

  return (
    <Box p={10} maxW="850px" ml="auto" mr="auto">
      {isError && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error?.message}
        </Alert>
      )}
      {isSuccess && mode !== 'read' && (
        <Alert status="success" mb={4}>
          <AlertIcon />
          {successMessage}
        </Alert>
      )}
      <EntityDetailForm
        id={`entity_detail_${entityType}`}
        title={title}
        config={config}
        submit={onSubmit}
        entity={data}
        isLoading={isLoading}
      />
    </Box>
  );
};
