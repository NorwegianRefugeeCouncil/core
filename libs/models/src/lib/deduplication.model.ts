import { z } from 'zod';

import { ParticipantSchema } from './prm/participant.model';

export enum ScoringMechanism {
  Weighted = 'weighted', // Take the score, multiply by the weight, and sum all the scores
  ExactOrNothing = 'exact-or-nothing', // If the score is 1, ignore other scores and return 1. Ignores weight. These checks can likely be done on the database level.
  ExactOrWeighted = 'exact-or-weighted', // If the score is 1, ignore other scores and return 1. If not, multiply by the weight and sum all the scores.
}

export const DeduplicationConfigSchema = z.record(
  z.object({
    weight: z.number().positive(),
    mechanism: z
      .nativeEnum(ScoringMechanism)
      .optional()
      .default(ScoringMechanism.Weighted),
    score: z
      .function()
      .args(ParticipantSchema.partial(), ParticipantSchema)
      .returns(z.number().positive().min(-1).max(1)),
  }),
);
export type DeduplicationConfig = z.infer<typeof DeduplicationConfigSchema>;

export const DeduplicationMergeSchema = z.object({
  participantIdA: z.string(),
  participantIdB: z.string(),
  resolvedParticipant: ParticipantSchema,
});
export type DeduplicationMerge = z.infer<typeof DeduplicationMergeSchema>;

export const DeduplicationIgnoreSchema = z.object({
  participantIdA: z.string(),
  participantIdB: z.string(),
});
export type DeduplicationIgnore = z.infer<typeof DeduplicationIgnoreSchema>;

export const DeduplicationRecordSchema = z.object({
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
export type DeduplicationRecord = z.infer<typeof DeduplicationRecordSchema>;
