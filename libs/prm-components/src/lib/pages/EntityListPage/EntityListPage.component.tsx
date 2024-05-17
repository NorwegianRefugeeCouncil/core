import { Heading, Spinner, Box } from '@chakra-ui/react';
import {
  DisplacementStatus,
  IdentificationType,
  Sex,
} from '@nrcno/core-models';
import { theme } from '@nrcno/core-theme';

import { EntityList } from '../../components';
import { useEntityListPage } from '../../hooks/useEntityListPage.hook';

export const EntityListPage: React.FC = () => {
  const { entityType, config, isLoading, isError, isSuccess, error, data } =
    useEntityListPage();

  return (
    <Box>
      <Heading
        pb="8"
        bg={theme.colors.white}
        top="0"
        position="sticky"
        zIndex={'docked'}
      >
        {entityType}
      </Heading>
      {isLoading && <Spinner colorScheme="primary" size="xl" />}
      {isError && <div>{error?.message}</div>}
      {isSuccess && <div>Success</div>}
      <EntityList
        config={config}
        entityList={new Array(100).fill({
          dateOfBirth: new Date('2006-10-12'),
          displacementStatus: DisplacementStatus.AsylumSeeker,
          firstName: 'first name',
          id: 'id1',
          lastName: 'lastname',
          nationalities: ['en'],
          identification: [
            {
              id: 'id1',
              identificationType: IdentificationType.Passport,
              identificationNumber: '123456789',
              isPrimary: true,
            },
          ],
          contactDetails: {
            phones: [
              {
                id: 'phone1',
                value: '12345678',
              },
            ],
            emails: [
              {
                id: 'email1',
                value: 'email@email.com',
              },
            ],
          },
          sex: Sex.Female,
        })}
      />
    </Box>
  );
};
