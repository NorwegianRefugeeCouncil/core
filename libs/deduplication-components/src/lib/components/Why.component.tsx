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
  const exactMatches = Object.entries(config).filter(
    ([key, configItem]) =>
      (configItem.mechanism === ScoringMechanism.ExactOrNothing ||
        configItem.mechanism === ScoringMechanism.ExactOrWeighted) &&
      scores[key].raw === 1,
  );

  const weightedMatches = Object.entries(config).filter(
    ([key, configItem]) =>
      configItem.mechanism === ScoringMechanism.Weighted ||
      (configItem.mechanism === ScoringMechanism.ExactOrWeighted &&
        scores[key].raw !== 1),
  );

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
          {exactMatches.length > 0 ? (
            <div>
              {exactMatches.map(([key, configItem]) => (
                <div key={key}>
                  <b>{key}</b> is an exact match
                </div>
              ))}
            </div>
          ) : (
            <div>
              {weightedMatches.map(([key, configItem]) => (
                <div key={key}>
                  <b>{key}</b> is a weighted match with a similarity of{' '}
                  {scores[key].raw * 100}%
                </div>
              ))}
            </div>
          )}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};
