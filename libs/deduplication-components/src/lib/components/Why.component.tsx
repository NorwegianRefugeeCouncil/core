import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Heading,
} from '@chakra-ui/react';

import {
  DeduplicationConfig,
  DenormalisedDeduplicationRecord,
  ScoringMechanism,
} from '@nrcno/core-models';

type Props = {
  scores: DenormalisedDeduplicationRecord['scores'];
};

const config = {
  name: {
    weight: 1,
    mechanism: ScoringMechanism.Weighted,
  },
  email: {
    weight: 1,
    mechanism: ScoringMechanism.Weighted,
  },
  nrcId: {
    weight: 1,
    mechanism: ScoringMechanism.ExactOrNothing,
  },
  identification: {
    weight: 1,
    mechanism: ScoringMechanism.ExactOrNothing,
  },
  residence: {
    weight: 1,
    mechanism: ScoringMechanism.Weighted,
  },
  sex: {
    weight: 1,
    mechanism: ScoringMechanism.ExactOrNothing,
  },
  dateOfBirth: {
    weight: 1,
    mechanism: ScoringMechanism.ExactOrNothing,
  },
};

export const Why: React.FC<Props> = ({ scores }) => {
  return (
    <Accordion allowToggle>
      <AccordionItem>
        <AccordionButton>
          <Box as="span" flex="1" textAlign="left">
            <Heading as="h3" size="md">
              Why?
            </Heading>
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          {Object.entries(config).map(([key, configItem]) => {
            if (configItem.mechanism === ScoringMechanism.ExactOrNothing) {
              return <div>exact or nothing</div>;
            }
            if (configItem.mechanism === ScoringMechanism.ExactOrWeighted) {
              return <div>exact or weighted</div>;
            }
            if (configItem.mechanism === ScoringMechanism.Weighted) {
              return <div>weighted</div>;
            }
            return null;
          })}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};
