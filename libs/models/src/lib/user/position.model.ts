import { z } from 'zod';

import { UUIDSchema } from '../utils';

export const PositionIdSchema = UUIDSchema;

export const PositionDefinitionSchema = z.object({
  name: z.string().min(1).max(100),
});
export type PositionDefinition = z.infer<typeof PositionDefinitionSchema>;

export const PositionSchema = z.object({
  id: PositionIdSchema,
  name: z.string().min(1).max(100),
});
export type Position = z.infer<typeof PositionSchema>;

export const PositionPartialUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});
export type PositionPartialUpdate = z.infer<typeof PositionPartialUpdateSchema>;

export type PositionListItem = Position;
export const PositionListItemSchema = PositionSchema;
