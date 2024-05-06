import { Spinner } from '@chakra-ui/react';
import {
  DisplacementStatus,
  IdentificationType,
  Sex,
} from '@nrcno/core-models';

import { EntityList } from '../../components';
import { useEntityListPage } from '../../hooks/useEntityListPage.hook';

export const EntityListPage: React.FC = () => {
  const { config, isLoading, isError, isSuccess, error, data } =
    useEntityListPage();

  return (
    <>
      {isLoading && <Spinner colorScheme="primary" size="xl" />}
      {isError && <div>{error?.message}</div>}
      {isSuccess && <div>Success</div>}
      <EntityList
        config={config}
        entityList={[
          {
            dateOfBirth: new Date('2006-10-12'),
            displacementStatus: DisplacementStatus.AsylumSeeker,
            email1: 'email@email.de',
            firstName: 'first name',
            id: 'id1',
            lastName: 'lastname',
            phone1: '21987430219',
            primaryIdentification: {
              identificationType: IdentificationType.NationalId,
              id: 'idid',
              identificationNumber: 'kjsdfkjdxf',
            },
            primaryNationality: {
              isoCode: 'de',
              translationKey: 'dslkjf',
            },
            sex: Sex.Female,
          },
          {
            dateOfBirth: new Date('2006-10-12'),
            displacementStatus: DisplacementStatus.HostCommunity,
            email1: 'email@email.de',
            firstName: 'first name',
            id: 'id2',
            lastName: 'lastname',
            phone1: '21987430219',
            primaryIdentification: {
              identificationType: IdentificationType.Passport,
              id: 'idid',
              identificationNumber: 'kjsdfkjdxf',
            },
            primaryNationality: {
              isoCode: 'de',
              translationKey: 'dslkjf',
            },
            sex: Sex.Other,
          },
        ]}
      />
    </>
  );
};
