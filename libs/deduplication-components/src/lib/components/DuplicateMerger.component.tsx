import { useState } from 'react';
import { Flex, Grid } from '@chakra-ui/react';

import {
  DenormalisedDeduplicationRecord,
  Participant,
} from '@nrcno/core-models';

import { ParticipantMerge } from './ParticipantMerge.component';

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
    <Grid templateColumns="1fr 1fr 1fr" w="100%" h="100%" overflow="scroll">
      <ParticipantMerge
        participant={duplicateRecord.participantA}
        buttonSide="right"
        onSelect={(path, value) => {
          setField(path, value);
          setPathsFromSide({ ...pathsFromSide, [path.join('.')]: 'right' });
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
          setPathsFromSide({ ...pathsFromSide, [path.join('.')]: 'left' });
        }}
        pathsFromSide={pathsFromSide}
      />
    </Grid>
  );
};
