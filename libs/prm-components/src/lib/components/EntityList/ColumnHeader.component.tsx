import { Th } from '@chakra-ui/react';

import { EntityUIConfig } from '../../config';

type Props = {
  field: EntityUIConfig['list']['fields'][0];
};

export const ColumnHeader: React.FC<Props> = ({ field }) => {
  return <Th width={`${field.width}rem`}>{field.title}</Th>;
};
