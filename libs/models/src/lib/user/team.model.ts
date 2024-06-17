import { z } from 'zod';

import { UUIDSchema } from '../utils';

export const TeamIdSchema = UUIDSchema;

export const TeamDefinitionSchema = z.object({
  name: z.string().min(1).max(100),
  parentTeamId: z.string().length(26).optional(),
});
export type TeamDefinition = z.infer<typeof TeamDefinitionSchema>;

// https://github.com/colinhacks/zod#recursive-types
const BaseTeamSchema = z.object({
  id: TeamIdSchema,
  name: z.string().min(1).max(100),
});
type BaseTeam = z.infer<typeof BaseTeamSchema>;
export type Team = BaseTeam & {
  parentTeam?: Team | null;
};
export const TeamSchema: z.ZodSchema<Team> = BaseTeamSchema.extend({
  parentTeam: z.lazy(() => BaseTeamSchema).optional(),
});

export const TeamPartialUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  parentTeam: TeamSchema.optional(),
});
export type TeamPartialUpdate = z.infer<typeof TeamPartialUpdateSchema>;

export type TeamListItem = Team;
export const TeamListItemSchema = TeamSchema;
