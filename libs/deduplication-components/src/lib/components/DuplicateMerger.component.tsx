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
    left: Record<string, Record<number, number>>;
    right: Record<string, Record<number, number>>;
  }>({ left: {}, right: {} });

  const setField = (path: (string | number)[], value: any, list: boolean) => {
    function setNestedObjectValue(
      obj: any,
      path: (string | number)[],
      value: any,
    ): any {
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
    (side: 'left' | 'right') => (path: (string | number)[], value: any) => {
      setField(path, value, false);
      setPathsFromSide({
        ...pathsFromSide,
        [path.join('.')]: side,
      });
    };

  const handleListAdd =
    (side: 'left' | 'right') => (path: (string | number)[], value: any) => {
      const index = path[path.length - 1];
      const pathWithoutIndex = path.slice(0, path.length - 1);
      const pathWithoutIndexStr = pathWithoutIndex.join('.');

      const currentArr: any = pathWithoutIndex.reduce(
        (acc: any, key, i, arr) => {
          const v = acc[key];
          if (v !== undefined) return v;
          if (i === arr.length - 1) return [];
          return {};
        },
        mergedParticipant,
      );
      const nextArr = [...currentArr, value];
      setField(pathWithoutIndex, nextArr, false);

      const listPaths =
        side === 'left' ? listPathsFromSide.left : listPathsFromSide.right;
      const listPathItem = listPaths[pathWithoutIndexStr] || {};
      const nextListPaths = {
        ...listPaths,
        [pathWithoutIndexStr]: {
          ...listPathItem,
          [index]: Object.keys(currentArr).length,
        },
      };
      if (side === 'left') {
        setListPathsFromSide({
          left: nextListPaths,
          right: listPathsFromSide.right,
        });
      } else {
        setListPathsFromSide({
          left: listPathsFromSide.left,
          right: nextListPaths,
        });
      }
    };

  const handleListRemove =
    (side: 'left' | 'right') => (path: (string | number)[], value: any) => {
      const index = Number(path[path.length - 1]);
      const pathWithoutIndex = path.slice(0, path.length - 1);
      const pathWithoutIndexStr = pathWithoutIndex.join('.');
      const otherSide = side === 'left' ? 'right' : 'left';
      const originalIdx = listPathsFromSide[side][pathWithoutIndexStr][index];

      const currentArr: any = pathWithoutIndex.reduce(
        (acc: any, key) => acc[key],
        mergedParticipant,
      );
      const nextArr = currentArr.filter(
        (_: any, i: number) => i !== originalIdx,
      );
      setField(pathWithoutIndex, nextArr, false);

      const nextListPaths = {
        ...listPathsFromSide,
        [side]: {
          ...listPathsFromSide[side],
          [pathWithoutIndexStr]: Object.keys(
            listPathsFromSide[side][pathWithoutIndexStr],
          )
            .filter((key) => key !== index.toString())
            .reduce((acc, key) => {
              const v =
                listPathsFromSide[side][pathWithoutIndexStr][Number(key)];
              return {
                ...acc,
                [key]: v > originalIdx ? v - 1 : v,
              };
            }, {}),
        },
        [otherSide]: {
          ...listPathsFromSide[otherSide],
          [pathWithoutIndexStr]: Object.keys(
            listPathsFromSide[otherSide][pathWithoutIndexStr] || {},
          ).reduce((acc, key) => {
            const v =
              listPathsFromSide[otherSide][pathWithoutIndexStr][Number(key)];
            return {
              ...acc,
              [key]: v > originalIdx ? v - 1 : v,
            };
          }, {}),
        },
      };
      setListPathsFromSide(nextListPaths);
    };

  const handleListSelect =
    (side: 'left' | 'right') => (path: (string | number)[], value: any) => {
      const index = Number(path[path.length - 1]);
      const pathWithoutIndex = path.slice(0, path.length - 1);
      const pathWithoutIndexStr = pathWithoutIndex.join('.');
      if (listPathsFromSide[side][pathWithoutIndexStr]?.[index] !== undefined) {
        handleListRemove(side)(path, value);
      } else {
        handleListAdd(side)(path, value);
      }
    };

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
                    onSelect={handleListSelect('left')}
                    pathsFromSide={listPathsFromSide['left']}
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
                  <ReadOnlyListField
                    field={field}
                    participant={mergedParticipant}
                  />
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
                  <ReadOnlyListField
                    field={field}
                    participant={duplicateRecord.participantB}
                    side="right"
                    onSelect={handleListSelect('right')}
                    pathsFromSide={listPathsFromSide['right']}
                  />
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
