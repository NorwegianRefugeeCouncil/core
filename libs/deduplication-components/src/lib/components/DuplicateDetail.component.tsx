import { Box, Button, Flex } from '@chakra-ui/react';
import { useState } from 'react';

import {
  DenormalisedDeduplicationRecord,
  Participant,
  ParticipantSchema,
} from '@nrcno/core-models';

import { useDeduplicationContext } from '../deduplication.context';

import { DuplicateMerger } from './DuplicateMerger.component';
import { Why } from './Why.component';

type Props = {
  duplicate: DenormalisedDeduplicationRecord;
  onSubmit: () => Promise<void>;
};

// WIP
const autoMerge = (duplicate: DenormalisedDeduplicationRecord): Participant => {
  const keys = Array.from(
    new Set([
      ...Object.keys(duplicate.participantA),
      ...Object.keys(duplicate.participantB),
    ]) as Set<keyof Participant>,
  );
  return ParticipantSchema.parse(
    keys.reduce((acc, key) => {
      if (
        typeof duplicate.participantA[key] === 'object' ||
        typeof duplicate.participantB[key] === 'object' ||
        Array.isArray(duplicate.participantA[key]) ||
        Array.isArray(duplicate.participantB[key])
      ) {
        return acc;
      }

      if (duplicate.participantA[key] === duplicate.participantB[key]) {
        return {
          ...acc,
          [key]: duplicate.participantA[key],
        };
      }
      if (
        duplicate.participantA[key] !== undefined &&
        duplicate.participantB[key] === undefined
      ) {
        return {
          ...acc,
          [key]: duplicate.participantA[key],
        };
      }
      if (
        duplicate.participantA[key] === undefined &&
        duplicate.participantB[key] !== undefined
      ) {
        return {
          ...acc,
          [key]: duplicate.participantB[key],
        };
      }
      return acc;
    }, {} as Participant),
  );
};

export const DuplicateDetail: React.FC<Props> = ({ duplicate, onSubmit }) => {
  const { resolve } = useDeduplicationContext();

  const [mergedParticipant, setMergedParticipant] = useState<
    Partial<Participant>
  >({});

  const handleAutoMerge = () => {
    setMergedParticipant(autoMerge(duplicate));
  };

  const handleMerge = async () => {
    await resolve.merge(
      duplicate.participantA.id,
      duplicate.participantB.id,
      ParticipantSchema.parse(mergedParticipant),
    );
    await onSubmit();
  };

  const handleIgnore = async () => {
    await resolve.ignore(duplicate.participantA.id, duplicate.participantB.id);
    await onSubmit();
  };

  return (
    <Flex direction="column" w="100%" gap={8} height="100%">
      <Flex w="100%" justify="end" gap={4}>
        <Button onClick={handleAutoMerge}>Auto Merge</Button>
        <Button onClick={handleIgnore}>Ignore</Button>
        <Button onClick={handleMerge}>Merge</Button>
      </Flex>
      <Box width="100%">
        <Why scores={duplicate.scores} />
      </Box>
      <Flex w="100%" flex={1} overflow="scroll">
        <DuplicateMerger
          duplicateRecord={duplicate}
          mergedParticipant={mergedParticipant}
          setMergedParticipant={setMergedParticipant}
        />
      </Flex>
    </Flex>
  );
};
