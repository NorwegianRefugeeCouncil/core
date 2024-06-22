import { z } from 'zod';

import { PermissionMapSchema } from './role.model';

const EmailSchema = z.object({
  primary: z.boolean().optional(),
  value: z.string(),
  type: z.string().optional(),
});

export const UserDefinitionSchema = z.object({
  id: z.string().uuid(),
  oktaId: z.string().optional(),
  userName: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  displayName: z.string().optional(),
  emails: z.array(EmailSchema).optional(),
  active: z.boolean(),
});
export type UserDefinition = z.infer<typeof UserDefinitionSchema>;

export const UserSchema = UserDefinitionSchema.extend({
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  permissions: PermissionMapSchema,
});
export type User = z.infer<typeof UserSchema>;

export const UserListItemSchema = UserSchema.omit({
  permissions: true,
});
export type UserListItem = z.infer<typeof UserListItemSchema>;
