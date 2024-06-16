import { z } from 'zod';

import { ParticipantSchema } from './prm/participant.model';

export enum ScoringMechanism {
  Weighted = 'weighted', // Take the score, multiply by the weight, and sum all the scores
  ExactOrNothing = 'exact-or-nothing', // If the score is 1, ignore other scores and return 1. Ignores weight. These checks can likely be done on the database level.
  ExactOrWeighted = 'exact-or-weighted', // If the score is 1, ignore other scores and return 1. If not, multiply by the weight and sum all the scores.
}

const DeduplicationConfigItem = z.object({
  weight: z.number().positive(),
  mechanism: z
    .nativeEnum(ScoringMechanism)
    .optional()
    .default(ScoringMechanism.Weighted),
});
export const DeduplicationConfigSchema = z.record(DeduplicationConfigItem);
export type DeduplicationConfig = z.infer<typeof DeduplicationConfigSchema>;

export const DeduplicationConfigWithScoreFuncSchema = z.record(
  DeduplicationConfigItem.extend({
    score: z
      .function()
      .args(ParticipantSchema.partial(), ParticipantSchema)
      .returns(z.number().positive().min(-1).max(1)),
  }),
);
export type DeduplicationConfigWithScoreFunc = z.infer<
  typeof DeduplicationConfigWithScoreFuncSchema
>;

export const DeduplicationMergeDefinitionSchema = z.object({
  participantIdA: z.string(),
  participantIdB: z.string(),
  resolvedParticipant: ParticipantSchema,
});
export type DeduplicationMergeDefinition = z.infer<
  typeof DeduplicationMergeDefinitionSchema
>;

export const DeduplicationIgnoreDefinitionSchema = z.object({
  participantIdA: z.string(),
  participantIdB: z.string(),
});
export type DeduplicationIgnoreDefinition = z.infer<
  typeof DeduplicationIgnoreDefinitionSchema
>;

export const DeduplicationRecordDefinitionSchema = z.object({
  participantIdA: z.string().optional(),
  participantIdB: z.string(),
  weightedScore: z.number().min(-1).max(1),
  scores: z.record(
    z.object({
      raw: z.number().min(-1).max(1),
      weighted: z.number(),
    }),
  ),
});
export type DeduplicationRecordDefinition = z.infer<
  typeof DeduplicationRecordDefinitionSchema
>;

export const DeduplicationRecordSchema =
  DeduplicationRecordDefinitionSchema.extend({
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  });
export type DeduplicationRecord = z.infer<typeof DeduplicationRecordSchema>;

export const DenormalisedDeduplicationRecordDefinitionSchema = z.object({
  participantA: ParticipantSchema,
  participantB: ParticipantSchema,
  weightedScore: z.number().min(-1).max(1),
  scores: z.record(
    z.object({
      raw: z.number().min(-1).max(1),
      weighted: z.number(),
    }),
  ),
});
export type DenormalisedDeduplicationRecordDefinition = z.infer<
  typeof DenormalisedDeduplicationRecordDefinitionSchema
>;

export const DenormalisedDeduplicationRecordSchema =
  DenormalisedDeduplicationRecordDefinitionSchema.extend({
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  });
export type DenormalisedDeduplicationRecord = z.infer<
  typeof DenormalisedDeduplicationRecordSchema
>;

export const deduplicationConfig: DeduplicationConfig = {
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
    mechanism: ScoringMechanism.Weighted,
  },
};
