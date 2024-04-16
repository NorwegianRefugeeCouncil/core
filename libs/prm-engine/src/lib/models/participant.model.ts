import { z } from 'zod';

export const ParticipantDefinitionSchema = z.object({});

export type ParticipantDefinition = z.infer<typeof ParticipantDefinitionSchema>;

export const ParticipantSchema = z.object({});

export type Participant = z.infer<typeof ParticipantSchema>;
