import diceCoefficient from 'fast-dice-coefficient';

import { Participant, ContactDetailType } from '@nrcno/core-models';

import { DeduplicationConfig } from './deduplication.model';

export const config: DeduplicationConfig = [
  {
    key: 'name',
    weight: 1,
    score: (participant1: Partial<Participant>, participant2: Participant) => {
      const firstNameScore =
        participant1.firstName && participant2.firstName
          ? diceCoefficient(participant1.firstName, participant2.firstName)
          : 0;

      const lastNameScore =
        participant1.lastName && participant2.lastName
          ? diceCoefficient(participant1.lastName, participant2.lastName)
          : 0;

      const fullNameScore =
        participant1.firstName &&
        participant1.lastName &&
        participant2.firstName &&
        participant2.lastName
          ? diceCoefficient(
              `${participant1.firstName} ${participant1.lastName}`,
              `${participant2.firstName} ${participant2.lastName}`,
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
  {
    key: 'email',
    weight: 1,
    score: (participant1: Partial<Participant>, participant2: Participant) => {
      const emails1 =
        participant1.contactDetails
          ?.filter((cd) => cd.contactDetailType === ContactDetailType.Email)
          ?.map((email) => [email.value, ...email.value.split('@')]) ?? [];
      const emails2 = participant2.contactDetails
        .filter((cd) => cd.contactDetailType === ContactDetailType.Email)
        .map((email) => [email.value, ...email.value.split('@')]);

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
];
export const totalWeight = config.reduce((acc, { weight }) => acc + weight, 0);
