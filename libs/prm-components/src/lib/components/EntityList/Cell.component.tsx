import { Td } from '@chakra-ui/react';
import { Entity } from '@nrcno/core-models';
import _ from 'lodash';

import { EntityUIConfig } from '../../config';

type Props = {
  entity: Partial<Entity>;
  field: EntityUIConfig['list']['fields'][0];
};

export const Cell: React.FC<Props> = ({ entity, field }) => {
  const rawValue = _.get(entity, field.path.join('.'));

  const value = !rawValue
    ? ''
    : field.format
      ? field.format(rawValue)
      : rawValue;
  return <Td width={`${field.width}rem`}>{value}</Td>;
};
