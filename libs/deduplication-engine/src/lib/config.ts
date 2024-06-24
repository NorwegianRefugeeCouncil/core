import diceCoefficient from 'fast-dice-coefficient';

import {
  ScoringMechanism,
  DeduplicationConfigWithScoreFunc,
} from '@nrcno/core-models';

export const config: DeduplicationConfigWithScoreFunc = {
  name: {
    weight: 1,
    mechanism: ScoringMechanism.Weighted,
    score: (individual1, individual2) => {
      const firstNameScore =
        individual1.firstName && individual2.firstName
          ? diceCoefficient(individual1.firstName, individual2.firstName)
          : 0;

      const lastNameScore =
        individual1.lastName && individual2.lastName
          ? diceCoefficient(individual1.lastName, individual2.lastName)
          : 0;

      const fullNameScore =
        individual1.firstName &&
        individual1.lastName &&
        individual2.firstName &&
        individual2.lastName
          ? diceCoefficient(
              `${individual1.firstName} ${individual1.lastName}`,
              `${individual2.firstName} ${individual2.lastName}`,
            )
          : 0;

      return (
        [firstNameScore, lastNameScore, fullNameScore].reduce(
          (acc, score) => acc + score,
          0,
        ) / 3
      );
    },
  },
  email: {
    weight: 1,
    mechanism: ScoringMechanism.Weighted,
    score: (individual1, individual2) => {
      const emails1 =
        individual1.emails?.map((email) => [
          email.value,
          ...email.value.split('@'),
        ]) ?? [];
      const emails2 =
        individual2.emails?.map((email) => [
          email.value,
          ...email.value.split('@'),
        ]) ?? [];

      if (emails1.length === 0 || emails2.length === 0) {
        return 0;
      }

      const distances = emails1.flatMap((email1) => {
        return emails2.flatMap((email2) => {
          if (email1[2] !== email2[2]) {
            return 0;
          }
          return diceCoefficient(email1[1], email2[1]);
        });
      });

      return Math.max(...distances);
    },
  },
  /*
  nrcId: {
    // TODO: Offload to database query
    weight: 1,
    mechanism: ScoringMechanism.ExactOrNothing,
    score: (individual1, individual2) => {
      if (!individual1.nrcId || !individual2.nrcId) return 0;
      return individual1.nrcId === individual2.nrcId ? 1 : 0;
    },
  },
  identification: {
    // TODO: Offload to database query
    weight: 1,
    mechanism: ScoringMechanism.ExactOrNothing,
    score: (individual1, individual2) => {
      const identityByType1 =
        individual1.identification?.reduce<
          Record<IdentificationType, string[]>
        >(
          (acc, cur) => ({
            ...acc,
            [cur.identificationType]: [
              ...(acc[cur.identificationType] ?? []),
              cur.identificationNumber,
            ],
          }),
          {} as Record<IdentificationType, string[]>,
        ) ?? ({} as Record<IdentificationType, string[]>);

      const identityByType2 =
        individual2.identification?.reduce<
          Record<IdentificationType, string[]>
        >(
          (acc, cur) => ({
            ...acc,
            [cur.identificationType]: [
              ...(acc[cur.identificationType] ?? []),
              cur.identificationNumber,
            ],
          }),
          {} as Record<IdentificationType, string[]>,
        ) ?? ({} as Record<IdentificationType, string[]>);

      const hasMatchingId = Object.values(IdentificationType).some((type) => {
        if (!identityByType1[type] || !identityByType2[type]) return false;
        return identityByType1[type].some((id) =>
          identityByType2[type].includes(id),
        );
      });

      const score = hasMatchingId ? 1 : 0;

      return score;
    },
  },
  */
  address: {
    weight: 1,
    mechanism: ScoringMechanism.Weighted,
    score: (individual1, individual2) => {
      const address1 = individual1.address;
      const address2 = individual2.address;

      if (!address1 || !address2) return 0;

      const address1Normalised = normaliseAddress(address1);
      const address2Normalised = normaliseAddress(address2);

      const address1Tokens = tokenizeAddress(address1Normalised);
      const address2Tokens = tokenizeAddress(address2Normalised);

      return jaccardSimilarity(address1Tokens, address2Tokens);
    },
  },
  /*
  sex: {
    // TODO: Offload to database query
    weight: 1,
    mechanism: ScoringMechanism.ExactOrNothing,
    score: (individual1, individual2) => {
      if (!individual1.sex || !individual2.sex) return 0;
      return individual1.sex !== individual2.sex ? -1 : 0;
    },
  },
  */
  dateOfBirth: {
    // TODO: Offload to database query
    weight: 1,
    mechanism: ScoringMechanism.Weighted,
    score: (individual1, individual2) => {
      if (!individual1.dateOfBirth || !individual2.dateOfBirth) return 0;
      return individual1.dateOfBirth === individual2.dateOfBirth ? 1 : 0;
    },
  },
};
export const totalWeight = Object.values(config).reduce(
  (acc, { weight, mechanism }) => {
    if (mechanism === ScoringMechanism.ExactOrNothing) return acc;
    return acc + weight;
  },
  0,
);

const addressAbbreviations = {
  road: ['rd'],
  street: ['st'],
  avenue: ['ave'],
  place: ['pl'],
  drive: ['dr'],
  boulevard: ['blvd'],
  court: ['ct'],
  square: ['sq'],
  apartment: ['apt'],
};

const normaliseAddress = (address: string): string => {
  const addressLower = address.toLowerCase();
  const addressNormalised = Object.entries(addressAbbreviations).reduce(
    (acc, [full, abbreviations]) => {
      return abbreviations.reduce((acc, abbreviation) => {
        return acc.replace(new RegExp(`\\b${abbreviation}\\.?\\b`, 'g'), full);
      }, acc);
    },
    addressLower,
  );
  return addressNormalised;
};

const tokenizeAddress = (address: string): Set<string> => {
  return new Set(address.split(/\s+/));
};

const jaccardSimilarity = (set1: Set<string>, set2: Set<string>): number => {
  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
};
