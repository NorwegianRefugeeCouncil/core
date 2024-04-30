import { Button, Flex } from '@chakra-ui/react';

import { DenormalisedDeduplicationRecord } from '@nrcno/core-models';

import { DuplicateMerger } from './DuplicateMerger.component';
import { Why } from './Why.component';

type Props = {
  duplicate: DenormalisedDeduplicationRecord;
};

export const DuplicateDetail: React.FC<Props> = ({ duplicate }) => {
  return (
    <Flex direction="column" w="100%">
      <Flex w="100%" justify="space-between">
        <Why />
        <Flex>
          <Button>Ignore</Button>
          <Button>Merge</Button>
        </Flex>
      </Flex>
      <DuplicateMerger />
    </Flex>
  );
};
