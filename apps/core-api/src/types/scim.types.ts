import { z } from 'zod';

export const scimUserSchema = z.object({
  schemas: z.array(z.string()),
  id: z.string().optional(),
  userName: z.string(),
  name: z
    .object({
      givenName: z.string().optional(),
      familyName: z.string().optional(),
    })
    .optional(),
  emails: z
    .array(
      z.object({
        primary: z.boolean().optional(),
        value: z.string(),
        type: z.string().optional(),
      }),
    )
    .optional(),
  displayName: z.string().optional(),
  active: z.boolean().optional(),
});

export const scimUserAttributeSchema = z
  .string()
  .refine(
    (attribute) => Object.keys(scimUserSchema.shape).includes(attribute),
    {
      message: 'Invalid attribute',
    },
  );

export const scimUserPatchSchema = z.object({
  schemas: z.array(z.string()),
  Operations: z.array(
    z.object({
      op: z.literal('replace'),
      value: z.object({
        active: z.boolean(),
      }),
    }),
  ),
});

export type ScimUser = z.infer<typeof scimUserSchema>;
