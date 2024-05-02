import { useState } from 'react';
import { Flex } from '@chakra-ui/react';

import {
  DenormalisedDeduplicationRecord,
  Participant,
} from '@nrcno/core-models';

import { ParticipantMerge } from './ParticipantMerge.component';

type Props = {
  duplicateRecord: DenormalisedDeduplicationRecord;
};

export const DuplicateMerger: React.FC<Props> = ({ duplicateRecord }) => {
  const [mergedParticipant, setMergedParticipant] = useState<
    Partial<Participant>
  >({});

  const [pathsFromSide, setPathsFromSide] = useState<
    Record<string, 'left' | 'right'>
  >({});

  const setField = (path: string[], value: any) => {
    const newParticipant = { ...mergedParticipant };
    let current: any = newParticipant;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    setMergedParticipant(newParticipant);
  };

  return (
    <Flex w="100%" justify="space-between" overflow="scroll" h="100%" gap={10}>
      <ParticipantMerge
        participant={duplicateRecord.participantA}
        buttonSide="right"
        onSelect={(path, value) => {
          setField(path, value);
          setPathsFromSide({ ...pathsFromSide, [path.join('.')]: 'left' });
        }}
        pathsFromSide={pathsFromSide}
      />
      <ParticipantMerge
        participant={mergedParticipant}
        pathsFromSide={pathsFromSide}
      />
      <ParticipantMerge
        participant={duplicateRecord.participantB}
        buttonSide="left"
        onSelect={(path, value) => {
          setField(path, value);
          setPathsFromSide({ ...pathsFromSide, [path.join('.')]: 'right' });
        }}
        pathsFromSide={pathsFromSide}
      />
    </Flex>
  );
};
