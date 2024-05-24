import { Link as ChakraLink, Td } from '@chakra-ui/react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { Entity } from '@nrcno/core-models';

import { EntityUIConfig } from '../../config';

type Props = {
  entity: Partial<Entity>;
  field: EntityUIConfig['list']['fields'][0];
};

export const IdCell: React.FC<Props> = ({ field, entity }) => {
  return (
    <Td width={`${field.width}rem`}>
      <ChakraLink
        color="secondary.500"
        href="#"
        as={ReactRouterLink}
        to={`${entity.id}`}
      >
        {entity.id}
      </ChakraLink>
    </Td>
  );
};
