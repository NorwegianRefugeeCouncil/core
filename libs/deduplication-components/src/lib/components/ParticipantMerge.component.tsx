import { IconButton, Flex, Heading } from '@chakra-ui/react';
import { ArrowLeftIcon, ArrowRightIcon } from '@chakra-ui/icons';

import { EntityType, Participant } from '@nrcno/core-models';
import {
  Component,
  DataType,
  FieldConfig,
  ListFieldConfig,
  configLoader,
} from '@nrcno/core-prm-components';

import styles from './ParticipantMerge.module.scss';

type Props = {
  participant: Partial<Participant>;
  buttonSide?: 'left' | 'right';
  onSelect?: (path: string[], value: any, list: boolean) => void;
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

const getListValueFromPath = (obj: any, path: string[]) => {
  try {
    return path.reduce((acc, key) => acc[key], obj);
  } catch {
    return [];
  }
};

const participantDetailConfig = configLoader({
  languages: [],
  // nationalities: [],
})[EntityType.Participant].detail;

const ReadOnlyField: React.FC<
  Props & { field: FieldConfig | ListFieldConfig }
> = ({ field, participant, buttonSide, onSelect, pathsFromSide }) => {
  const handleSelect = () => {
    if (onSelect)
      onSelect(
        field.path,
        field.component === Component.List
          ? getListValueFromPath(participant, field.path)
          : getValueFromPath(participant, field.path, field.dataType),
        field.component === Component.List,
      );
  };

  let className = styles.mergeField;
  if (buttonSide === 'left') {
    className += ` ${styles.mergeFieldLeft}`;
  } else if (buttonSide === 'right') {
    className += ` ${styles.mergeFieldRight}`;
  } else {
    className += ` ${styles.mergeFieldCentre}`;
  }
  if (pathsFromSide[field.path.join('.')] === buttonSide) {
    className += ` ${styles.selected}`;
  }

  return (
    <Flex
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      height="48px"
      className={className}
      mr={buttonSide === 'right' ? 10 : 0}
      ml={buttonSide === 'left' ? 10 : 0}
    >
      {buttonSide === 'left' && (
        <IconButton
          aria-label="Add all"
          icon={<ArrowLeftIcon />}
          onClick={handleSelect}
        />
      )}

      {field.component === Component.List ? (
        <Flex direction="column">
          <strong>{field.label}</strong>
          {field.children
            .filter((childField) => childField.component !== Component.Hidden)
            .map((childField) => (
              <Flex
                key={[...field.path, ...childField.path].join('.')}
                direction="column"
              >
                <strong>{childField.label}</strong>
                <span>
                  {getValueFromPath(
                    participant,
                    [...field.path, ...childField.path],
                    childField.dataType,
                  )}
                </span>
              </Flex>
            ))}
        </Flex>
      ) : (
        <Flex direction="column">
          <strong>{field.label}</strong>
          <span>
            {getValueFromPath(participant, field.path, field.dataType)}
          </span>
        </Flex>
      )}

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
  <Flex direction="column" gap={4}>
    {participantDetailConfig.sections.map((section) => (
      <Flex
        key={section.title}
        direction="column"
        gap={4}
        textAlign={
          buttonSide ? (buttonSide === 'right' ? 'left' : 'right') : 'left'
        }
      >
        <Heading
          size="sm"
          as="h3"
          bg="secondary.500"
          color={buttonSide === 'right' ? 'white' : 'secondary.500'}
          padding={1}
        >
          {buttonSide === 'right' ? section.title : '.'}
        </Heading>
        {section.fields.map((field) => (
          <ReadOnlyField
            key={field.path.join('.')}
            field={field}
            participant={participant}
            buttonSide={buttonSide}
            onSelect={onSelect}
            pathsFromSide={pathsFromSide}
          />
        ))}
      </Flex>
    ))}
  </Flex>
);
