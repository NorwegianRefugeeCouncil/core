import { IconButton, Flex } from '@chakra-ui/react';
import { ArrowLeftIcon, ArrowRightIcon } from '@chakra-ui/icons';

import { EntityType, Participant } from '@nrcno/core-models';
import { Component, DataType, Field, config } from '@nrcno/core-prm-components';

import styles from './ParticipantMerge.module.scss';

type Props = {
  participant: Partial<Participant>;
  buttonSide?: 'left' | 'right';
  onSelect?: (path: string[], value: any) => void;
  pathsFromSide: Record<string, 'left' | 'right'>;
};

const getValueFromPath = (obj: any, path: string[], dataType: DataType) => {
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

const participantDetailConfig = config[EntityType.Participant].detail;

const ReadOnlyField = ({
  field,
  participant,
  buttonSide,
  onSelect,
  pathsFromSide,
}: {
  field: Field;
  participant: Partial<Participant>;
  buttonSide?: 'left' | 'right';
  onSelect?: (path: string[], value: any) => void;
  pathsFromSide: Record<string, 'left' | 'right'>;
}) => {
  const handleSelect = () => {
    if (onSelect)
      onSelect(
        field.path,
        getValueFromPath(participant, field.path, field.dataType),
      );
  };

  let className = styles.mergeField;
  if (buttonSide === 'left') {
    className += ` ${styles.mergeFieldLeft}`;
  } else if (buttonSide === 'right') {
    className += ` ${styles.mergeFieldRight}`;
  }
  if (pathsFromSide[field.path.join('.')] === buttonSide) {
    className += ` .selected`;
  }

  return (
    <Flex
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      height="48px"
      className={className}
    >
      {buttonSide === 'left' && (
        <IconButton
          aria-label="Add all"
          icon={<ArrowLeftIcon />}
          onClick={handleSelect}
        />
      )}

      <Flex direction="column">
        <strong>{field.label}</strong>
        <span>{getValueFromPath(participant, field.path, field.dataType)}</span>
      </Flex>

      {buttonSide === 'right' && (
        <IconButton
          aria-label="Add"
          icon={<ArrowRightIcon />}
          onClick={handleSelect}
        />
      )}
    </Flex>
  );
};

export const ParticipantMerge: React.FC<Props> = ({
  participant,
  buttonSide,
  onSelect,
  pathsFromSide,
}) => (
  <Flex direction="column">
    {participantDetailConfig.sections.map((section) => (
      <Flex key={section.title} direction="column" gap={4}>
        <h2>{section.title}</h2>
        {section.fields.map((field) =>
          field.component === Component.List ? (
            <Flex key={field.path.join('.')} direction="column">
              <Flex direction="row">
                <strong>{field.label}</strong>
              </Flex>
              <Flex direction="column">
                {field.children.map((childField) => (
                  <ReadOnlyField
                    key={[...field.path, ...childField.path].join('.')}
                    field={childField}
                    participant={participant}
                    buttonSide={buttonSide}
                    onSelect={onSelect}
                    pathsFromSide={pathsFromSide}
                  />
                ))}
              </Flex>
            </Flex>
          ) : (
            <ReadOnlyField
              key={field.path.join('.')}
              field={field}
              participant={participant}
              buttonSide={buttonSide}
              onSelect={onSelect}
              pathsFromSide={pathsFromSide}
            />
          ),
        )}
      </Flex>
    ))}
  </Flex>
);
