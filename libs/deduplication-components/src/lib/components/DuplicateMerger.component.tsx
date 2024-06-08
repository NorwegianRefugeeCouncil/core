import { useState } from 'react';
import { Flex, Grid, GridItem, Heading } from '@chakra-ui/react';

import {
  DenormalisedDeduplicationRecord,
  EntityType,
  Participant,
} from '@nrcno/core-models';
import { Component, configLoader } from '@nrcno/core-prm-components';

import { ReadOnlyField, ReadOnlyListField } from './ParticipantMerge.component';

const participantDetailConfig = configLoader({
  languages: [],
  // nationalities: [],
})[EntityType.Participant].detail;

type Props = {
  duplicateRecord: DenormalisedDeduplicationRecord;
  mergedParticipant: Partial<Participant>;
  setMergedParticipant: (participant: Partial<Participant>) => void;
};

export const DuplicateMerger: React.FC<Props> = ({
  duplicateRecord,
  mergedParticipant,
  setMergedParticipant,
}) => {
  const [pathsFromSide, setPathsFromSide] = useState<
    Record<string, 'left' | 'right'>
  >({});

  const [listPathsFromSide, setListPathsFromSide] = useState<{
    left: Record<string, [number, number][]>;
    right: Record<string, [number, number][]>;
  }>({ left: {}, right: {} });

  const setField = (path: string[], value: any, list: boolean) => {
    function setNestedObjectValue(obj: any, path: string[], value: any): any {
      if (path.length === 1) {
        if (list) {
          return { ...obj, [path[0]]: [...(obj[path[0]] || []), value] };
        }
        return { ...obj, [path[0]]: value };
      } else {
        const [key, ...restPath] = path;
        const defaultValue = path.length === 2 && list ? [] : {};
        return {
          ...obj,
          [key]: setNestedObjectValue(
            obj[key] || defaultValue,
            restPath,
            value,
          ),
        };
      }
    }
    const nextParticipant = setNestedObjectValue(
      { ...mergedParticipant },
      path,
      value,
    );
    setMergedParticipant(nextParticipant);
  };

  const handleSelect =
    (side: 'left' | 'right') => (path: string[], value: any, list: boolean) => {
      console.log(path, value, list);
      setField(path, value, list);
      setPathsFromSide({
        ...pathsFromSide,
        [path.join('.')]: side,
      });
    };

  // const handleListSelect =
  //   (side: 'left' | 'right') => (path: string[], value: any, index: number) => {
  //     const listPaths =
  //       side === 'left' ? listPathsFromSide.left : listPathsFromSide.right;
  //     const nextListPaths = {
  //       ...listPaths,
  //       [path.join('.')]: [
  //         ...(listPaths[path.join('.')] || []),
  //         [index, index],
  //       ],
  //     };
  //     if (side === 'left') {
  //       setListPathsFromSide({
  //         left: nextListPaths,
  //         right: listPathsFromSide.right,
  //       });
  //     } else {
  //       setListPathsFromSide({
  //         left: listPathsFromSide.left,
  //         right: nextListPaths,
  //       });
  //     }
  //     setField(path, value, true);
  //   };

  return (
    <Grid
      templateColumns="1fr 1fr 1fr"
      gap={4}
      w="100%"
      h="100%"
      overflow="scroll"
    >
      {participantDetailConfig.sections.map((section) => (
        <>
          <GridItem key={section.title} colSpan={3}>
            <Heading
              size="sm"
              as="h3"
              bg="secondary.500"
              color="white"
              padding={1}
            >
              {section.title}
            </Heading>
          </GridItem>
          {section.fields.map((field) => (
            <>
              <GridItem key={`left-${field.label}`} colSpan={1}>
                {field.component === Component.List ? (
                  <ReadOnlyListField
                    field={field}
                    participant={duplicateRecord.participantA}
                    side="left"
                    onSelect={handleSelect('left')}
                    pathsFromSide={pathsFromSide}
                  />
                ) : (
                  <ReadOnlyField
                    field={field}
                    participant={duplicateRecord.participantA}
                    side="left"
                    onSelect={handleSelect('left')}
                    pathsFromSide={pathsFromSide}
                  />
                )}
              </GridItem>
              <GridItem key={`centre-${field.label}`} colSpan={1}>
                {field.component === Component.List ? (
                  <div>list - {field.label}</div>
                ) : (
                  <ReadOnlyField
                    field={field}
                    participant={mergedParticipant}
                    pathsFromSide={pathsFromSide}
                  />
                )}
              </GridItem>
              <GridItem key={`right-${field.label}`} colSpan={1}>
                {field.component === Component.List ? (
                  <div>list - {field.label}</div>
                ) : (
                  <ReadOnlyField
                    field={field}
                    participant={duplicateRecord.participantB}
                    side="right"
                    onSelect={handleSelect('right')}
                    pathsFromSide={pathsFromSide}
                  />
                )}
              </GridItem>
            </>
          ))}
        </>
      ))}
    </Grid>
  );
};
