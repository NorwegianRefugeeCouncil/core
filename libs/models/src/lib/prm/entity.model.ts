import { z } from 'zod';

export enum EntityType {
  Participant = 'participant',
}
export const EntityTypeSchema = z.nativeEnum(EntityType);
