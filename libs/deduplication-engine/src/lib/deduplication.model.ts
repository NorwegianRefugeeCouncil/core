import { z } from 'zod';

import { ParticipantSchema } from '@nrcno/core-models';

export const DeduplicationConfigSchema = z.array(
  z.object({
    key: z.string(),
    weight: z.number().positive(),
    score: z
      .function()
      .args(ParticipantSchema.partial(), ParticipantSchema)
      .returns(z.number().positive()),
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
  weightedScore: z.number().positive(),
  scores: z.record(
    z.object({
      raw: z.number().min(0).max(1),
      weighted: z.number().min(0).max(1),
    }),
  ),
});

export type DeduplicationRecord = z.infer<typeof DeduplicationRecordSchema>;
