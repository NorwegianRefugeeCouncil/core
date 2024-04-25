import { ContactDetailType, IdentificationType, Sex } from '@nrcno/core-models';
import { Spinner } from '@chakra-ui/react';

import { useEntityDetailPage } from '../../hooks/useEntityDetailPage.hook';
import { Form } from '../../components';

type Props = {
  mode: 'create' | 'read' | 'edit';
};

export const EntityDetailPage: React.FC<Props> = ({ mode }) => {
  const { entityType, config, isLoading, isError, isSuccess, error, onSubmit } =
    useEntityDetailPage(mode);

  return (
    <>
      {isLoading && <Spinner colorScheme="primary" size="xl" />}
      {isError && <div>{error?.message}</div>}
      {isSuccess && <div>Success</div>}
      <Form
        id={`entity_detail_${entityType}`}
        title={'EntityDetailPage'}
        config={config}
        submit={onSubmit}
        entity={{
          id: 'id',
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date('1990-01-01'),
          sex: Sex.Male,
          consentGdpr: true,
          consentReferral: true,
          languages: [
            {
              isoCode: 'es',
              translationKey: '',
            },
          ],
          nationalities: [],
          contactDetails: [
            {
              contactDetailType: ContactDetailType.Email,
              value: 'john.doe@example.com',
              id: '1',
            },
            {
              contactDetailType: ContactDetailType.PhoneNumber,
              value: '9876543210',
              id: '2',
            },
            {
              contactDetailType: ContactDetailType.PhoneNumber,
              value: '1234567890',
              id: '3',
            },
          ],
          identification: [
            {
              identificationType: IdentificationType.UnhcrId,
              identificationNumber: '1234567890',
              isPrimary: true,
              id: '4',
            },
          ],
        }}
      />
    </>
  );
};
