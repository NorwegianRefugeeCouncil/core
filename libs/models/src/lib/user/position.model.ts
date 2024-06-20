import { z } from 'zod';

import { UUIDSchema } from '../utils';

import { UserSchema } from './user.model';
import { RoleSchema } from './role.model';

export const PositionIdSchema = UUIDSchema;

export const PositionDefinitionSchema = z.object({
  name: z.string().min(1).max(100),
  staff: z.array(UUIDSchema).optional().default([]),
  roles: z.record(RoleSchema, z.boolean()),
});
export type PositionDefinition = z.infer<typeof PositionDefinitionSchema>;

export const PositionSchema = z.object({
  id: PositionIdSchema,
  name: z.string().min(1).max(100),
  staff: z.array(UserSchema).optional().default([]),
  roles: z.record(RoleSchema, z.boolean()),
});
export type Position = z.infer<typeof PositionSchema>;

export const PositionUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  staff: z.array(UUIDSchema).optional().default([]),
  roles: z.record(RoleSchema, z.boolean()),
});
export type PositionUpdate = z.infer<typeof PositionUpdateSchema>;

export const PositionPartialUpdateSchema = PositionUpdateSchema.merge(
  z.object({
    staff: z.object({
      add: z.array(UUIDSchema).optional().default([]),
      remove: z.array(UUIDSchema).optional().default([]),
    }),
    roles: z.object({
      add: z.array(RoleSchema).optional().default([]),
      remove: z.array(RoleSchema).optional().default([]),
    }),
  }),
);
export type PositionPartialUpdate = z.infer<typeof PositionPartialUpdateSchema>;

export const PositionListItemSchema = PositionSchema.pick({
  id: true,
  name: true,
});
export type PositionListItem = z.infer<typeof PositionListItemSchema>;
