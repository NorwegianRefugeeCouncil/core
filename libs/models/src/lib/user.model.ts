import { z } from 'zod';

const EmailSchema = z.object({
  primary: z.boolean().optional(),
  value: z.string(),
  type: z.string().optional(),
});

export const UserSchema = z.object({
  id: z.string().uuid(),
  oktaId: z.string().optional(),
  userName: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  displayName: z.string().optional(),
  emails: z.array(EmailSchema).optional(),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;
