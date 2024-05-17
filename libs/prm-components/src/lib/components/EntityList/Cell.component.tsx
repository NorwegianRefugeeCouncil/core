import { Td } from '@chakra-ui/react';
import { Entity } from '@nrcno/core-models';

import { EntityUIConfig } from '../../config';

type Props = {
  entity: Partial<Entity>;
  field: EntityUIConfig['list']['fields'][0];
};

export const Cell: React.FC<Props> = ({ entity, field }) => {
  const rawValue = field.path.reduce<any>((acc, key) => acc[key], entity);
  const value = field.format ? field.format(rawValue) : rawValue;
  return <Td width={`${field.width}rem`}>{value}</Td>;
};
