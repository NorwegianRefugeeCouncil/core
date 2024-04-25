import { z } from 'zod';

import { ParticipantSchema } from './participant.model';
import { ParticipantDefinition } from './participant.model';

export enum EntityType {
  Participant = 'participants',
}

export const EntityTypeSchema = z.nativeEnum(EntityType);

export const EntityIdSchema = z.string().ulid();

// export const EntitySchema = z.union([ParticipantSchema]);
export const EntitySchema = ParticipantSchema;
export type Entity = z.infer<typeof EntitySchema>;
export type EntityDefinition = ParticipantDefinition;
