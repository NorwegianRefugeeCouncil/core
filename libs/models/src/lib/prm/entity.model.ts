import { z } from 'zod';

export enum EntityType {
  Participant = 'participants',
}
export const EntityTypeSchema = z.nativeEnum(EntityType);
