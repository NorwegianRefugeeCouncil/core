import { z } from 'zod';

import {
  IndividualDefinitionSchema,
  IndividualSchema,
  IndividualUpdateSchema,
} from './individual.model';

export enum HeadOfHouseholdType {
  AdultFemale = 'adult_female',
  AdultMale = 'adult_male',
  ElderlyFemale = 'elderly_female',
  ElderlyMale = 'elderly_male',
  MinorFemale = 'minor_female',
  MinorMale = 'minor_male',
}
const HeadOfHouseholdTypeSchema = z.nativeEnum(HeadOfHouseholdType);

const HouseholdIndividualDefinitionSchema = IndividualDefinitionSchema.pick({
  lastName: true,
  firstName: true,
  sex: true,
  dateOfBirth: true,
  address: true,
  nationalities: true,
  identification: true,
  phones: true,
}).extend({
  isHeadOfHousehold: z.boolean().optional().default(false),
});

export const HouseholdDefinitionSchema = z.object({
  headType: HeadOfHouseholdTypeSchema.optional().nullable(),
  sizeOverride: z.coerce.number().int().optional().nullable(),
  individuals: z.array(HouseholdIndividualDefinitionSchema).default([]), // TODO: remove default once enforcing head of household
});
export type HouseholdDefinition = z.infer<typeof HouseholdDefinitionSchema>;

const HouseholdIndividualSchema = HouseholdIndividualDefinitionSchema.merge(
  IndividualSchema.pick({ id: true, identification: true, phones: true }),
);

export const HouseholdSchema = HouseholdDefinitionSchema.extend({
  id: z.string().ulid(),
  individuals: z.array(HouseholdIndividualSchema).default([]), // TODO: remove default once enforcing head of household
});
export type Household = z.infer<typeof HouseholdSchema>;

const HouseholdIndividualUpdateSchema =
  HouseholdIndividualDefinitionSchema.merge(
    IndividualUpdateSchema.pick({
      identification: true,
      phones: true,
    }),
  ).extend({
    id: z.string().uuid().optional(),
  });
export const HouseholdUpdateSchema = HouseholdDefinitionSchema.extend({
  individuals: z.array(HouseholdIndividualUpdateSchema).default([]),
});
export type HouseholdUpdate = z.infer<typeof HouseholdUpdateSchema>;

export const HouseholdPartialUpdateSchema = HouseholdUpdateSchema.omit({
  individuals: true,
});
export type HouseholdPartialUpdate = z.infer<
  typeof HouseholdPartialUpdateSchema
>;
