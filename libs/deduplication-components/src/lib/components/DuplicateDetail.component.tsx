import { Box, Button, Flex } from '@chakra-ui/react';
import { useState } from 'react';

import {
  DenormalisedDeduplicationRecord,
  Individual,
  IndividualSchema,
} from '@nrcno/core-models';

import { useDeduplicationContext } from '../deduplication.context';

import { DuplicateMerger } from './DuplicateMerger.component';
import { Why } from './Why.component';

type Props = {
  duplicate: DenormalisedDeduplicationRecord;
  onSubmit: () => Promise<void>;
};

// WIP
const autoMerge = (duplicate: DenormalisedDeduplicationRecord): Individual => {
  const keys = Array.from(
    new Set([
      ...Object.keys(duplicate.individualA),
      ...Object.keys(duplicate.individualB),
    ]) as Set<keyof Individual>,
  );
  return IndividualSchema.parse(
    keys.reduce((acc, key) => {
      if (
        typeof duplicate.individualA[key] === 'object' ||
        typeof duplicate.individualB[key] === 'object' ||
        Array.isArray(duplicate.individualA[key]) ||
        Array.isArray(duplicate.individualB[key])
      ) {
        return acc;
      }

      if (duplicate.individualA[key] === duplicate.individualB[key]) {
        return {
          ...acc,
          [key]: duplicate.individualA[key],
        };
      }
      if (
        duplicate.individualA[key] !== undefined &&
        duplicate.individualB[key] === undefined
      ) {
        return {
          ...acc,
          [key]: duplicate.individualA[key],
        };
      }
      if (
        duplicate.individualA[key] === undefined &&
        duplicate.individualB[key] !== undefined
      ) {
        return {
          ...acc,
          [key]: duplicate.individualB[key],
        };
      }
      return acc;
    }, {} as Individual),
  );
};

export const DuplicateDetail: React.FC<Props> = ({ duplicate, onSubmit }) => {
  const { resolve } = useDeduplicationContext();

  const [mergedIndividual, setMergedIndividual] = useState<Partial<Individual>>(
    {},
  );

  const handleAutoMerge = () => {
    setMergedIndividual(autoMerge(duplicate));
  };

  const handleMerge = async () => {
    await resolve.merge(
      duplicate.individualA.id,
      duplicate.individualB.id,
      IndividualSchema.parse({
        ...mergedIndividual,
        id: duplicate.individualA.id,
      }),
    );
    await onSubmit();
  };

  const handleIgnore = async () => {
    await resolve.ignore(duplicate.individualA.id, duplicate.individualB.id);
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
          mergedIndividual={mergedIndividual}
          setMergedIndividual={setMergedIndividual}
        />
      </Flex>
    </Flex>
  );
};
