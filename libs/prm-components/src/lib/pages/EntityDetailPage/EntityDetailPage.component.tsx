import { Spinner } from '@chakra-ui/react';

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

  return (
    <>
      {isLoading && <Spinner colorScheme="primary" size="xl" />}
      {isError && <div>{error?.message}</div>}
      {isSuccess && <div>Success</div>}
      <EntityDetailForm
        id={`entity_detail_${entityType}`}
        title={'New participants'}
        config={config}
        submit={onSubmit}
        entity={data}
      />
    </>
  );
};
