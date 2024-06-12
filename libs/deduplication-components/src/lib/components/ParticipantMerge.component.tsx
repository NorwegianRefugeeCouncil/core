import { IconButton, Flex } from '@chakra-ui/react';
import { ArrowLeftIcon, ArrowRightIcon, CloseIcon } from '@chakra-ui/icons';

import { Participant } from '@nrcno/core-models';
import {
  Component,
  DataType,
  FieldConfig,
  ListFieldConfig,
} from '@nrcno/core-prm-components';

import styles from './ParticipantMerge.module.scss';

type Props = {
  participant: Partial<Participant>;
  side?: 'left' | 'right';
  onSelect?: (path: string[], value: any) => void;
  pathsFromSide: Record<string, 'left' | 'right'>;
};

const getValueFromPath = (
  obj: any,
  path: (string | number)[],
  dataType: DataType,
) => {
  try {
    const value = path.reduce((acc, key) => acc[key], obj);
    if (dataType === DataType.Date) {
      return new Date(value).toLocaleDateString();
    }
    return value;
  } catch {
    return '';
  }
};

const getListValueFromPath = (obj: any, path: (string | number)[]) => {
  try {
    return path.reduce((acc, key) => acc[key], obj);
  } catch {
    return [];
  }
};

export const ReadOnlyField: React.FC<Props & { field: FieldConfig }> = ({
  field,
  participant,
  side,
  onSelect,
  pathsFromSide,
}) => {
  const handleSelect = () => {
    if (onSelect)
      onSelect(
        field.path,
        getValueFromPath(participant, field.path, field.dataType),
      );
  };

  let className = styles.mergeField;
  if (side === 'left') {
    className += ` ${styles.mergeFieldLeft}`;
  } else if (side === 'right') {
    className += ` ${styles.mergeFieldRight}`;
  } else {
    className += ` ${styles.mergeFieldCentre}`;
  }
  if (pathsFromSide[field.path.join('.')] === side) {
    className += ` ${styles.selected}`;
  }

  return (
    <Flex
      direction="row"
      justifyContent="space-between"
      alignItems="start"
      className={className}
      height="100%"
      p={2}
      textAlign={side || 'left'}
    >
      {side === 'right' && (
        <IconButton
          aria-label="Add all"
          icon={<ArrowLeftIcon />}
          onClick={handleSelect}
          mr={4}
        />
      )}

      <Flex direction="column">
        <strong>{field.label}</strong>
        <span>{getValueFromPath(participant, field.path, field.dataType)}</span>
      </Flex>

      {side === 'left' && (
        <IconButton
          aria-label="Add"
          icon={<ArrowRightIcon />}
          onClick={handleSelect}
          ml={4}
        />
      )}
    </Flex>
  );
};

type ListProps = {
  participant: Partial<Participant>;
  side?: 'left' | 'right';
  onSelect?: (path: (string | number)[], value: any) => void;
  pathsFromSide?: Record<string, Record<number, number>>;
  field: ListFieldConfig;
};

export const ReadOnlyListField: React.FC<ListProps> = ({
  field,
  participant,
  side,
  onSelect,
  pathsFromSide,
}) => {
  const handleSelect = (idx: number) => () => {
    if (onSelect) {
      onSelect(
        [...field.path, idx],
        getListValueFromPath(participant, [...field.path, idx]),
      );
    }
  };

  let className = styles.mergeField;
  if (side === 'left') {
    className += ` ${styles.mergeFieldLeft}`;
  } else if (side === 'right') {
    className += ` ${styles.mergeFieldRight}`;
  } else {
    className += ` ${styles.mergeFieldCentre}`;
  }

  const listValue: any[] = getListValueFromPath(participant, field.path) || [];

  return (
    <Flex direction="column" height="100%" p={2} textAlign={side || 'left'}>
      <Flex direction="column">
        <strong>{field.label}</strong>
        {listValue.map((value, index) => {
          const selected =
            pathsFromSide?.[field.path.join('.')]?.[index] !== undefined;
          const cn = selected ? `${className} ${styles.selected}` : className;
          return (
            <Flex
              direction="row"
              justifyContent="space-between"
              alignItems="start"
              className={cn}
              p={2}
            >
              {side === 'right' && (
                <IconButton
                  aria-label={selected ? 'Remove' : 'Add'}
                  icon={selected ? <CloseIcon /> : <ArrowLeftIcon />}
                  onClick={handleSelect(index)}
                />
              )}

              <Flex direction="column">
                {field.children
                  .filter(
                    (childField) => childField.component !== Component.Hidden,
                  )
                  .map((childField) => (
                    <Flex
                      key={[...field.path, ...childField.path].join('.')}
                      direction="column"
                    >
                      <strong>{childField.label}</strong>
                      <span>
                        {getValueFromPath(
                          participant,
                          [...field.path, index, ...childField.path],
                          childField.dataType,
                        )}
                      </span>
                    </Flex>
                  ))}
              </Flex>
              {side === 'left' && (
                <IconButton
                  aria-label={selected ? 'Remove' : 'Add'}
                  icon={selected ? <CloseIcon /> : <ArrowRightIcon />}
                  onClick={handleSelect(index)}
                />
              )}
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
};
