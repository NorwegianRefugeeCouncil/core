import { z } from 'zod';

import { UUIDSchema } from '../utils';

import { PositionListItemSchema } from './position.model';

export const TeamIdSchema = UUIDSchema;

export const TeamDefinitionSchema = z.object({
  name: z.string().min(1).max(100),
  parentTeamId: z.string().length(26).optional(),
  positions: z.array(UUIDSchema).optional().default([]),
});
export type TeamDefinition = z.infer<typeof TeamDefinitionSchema>;

// https://github.com/colinhacks/zod#recursive-types
const BaseTeamSchema = z.object({
  id: TeamIdSchema,
  name: z.string().min(1).max(100),
  positions: z.array(PositionListItemSchema).optional().default([]),
});
type BaseTeam = z.infer<typeof BaseTeamSchema>;
export type Team = BaseTeam & {
  parentTeam?: Team | null;
};
export const TeamSchema: z.ZodSchema<Team> = BaseTeamSchema.extend({
  parentTeam: z.lazy(() => BaseTeamSchema).optional(),
});

export const TeamUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  parentTeam: TeamSchema.optional(),
  positions: z.array(UUIDSchema).optional().default([]),
});
export type TeamUpdate = z.infer<typeof TeamUpdateSchema>;

export const TeamPartialUpdateSchema = TeamUpdateSchema.merge(
  z.object({
    positions: z.object({
      add: z.array(UUIDSchema).optional(),
      remove: z.array(UUIDSchema).optional(),
    }),
  }),
);
export type TeamPartialUpdate = z.infer<typeof TeamPartialUpdateSchema>;

export type TeamListItem = Team;
export const TeamListItemSchema = TeamSchema;
