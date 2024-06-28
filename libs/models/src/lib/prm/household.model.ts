import { z } from 'zod';

import {
  IndividualDefinitionSchema,
  IndividualSchema,
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
  sizeOverride: z.coerce.number().int().min(0).optional().nullable(),
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

export const HouseholdListItemSchema = HouseholdSchema.pick({
  id: true,
  headType: true,
  sizeOverride: true,
}).extend({
  individuals: z
    .array(
      HouseholdIndividualSchema.pick({ id: true, isHeadOfHousehold: true }),
    )
    .max(1),
});
export type HouseholdListItem = z.infer<typeof HouseholdListItemSchema>;

export const HouseholdListSortingFields = ['id', 'headType', 'sizeOverride'];
export const HouseholdDefaultSorting = 'id';

export const HouseholdFilteringSchema = z
  .object({
    id: z.string().optional(),
    headType: HeadOfHouseholdTypeSchema.optional(),
    sizeOverrideMin: z.number().int().min(0).optional(),
    sizeOverrideMax: z.number().int().min(0).optional(),
  })
  .refine((filtering) => {
    if (filtering.sizeOverrideMin && filtering.sizeOverrideMax) {
      return filtering.sizeOverrideMin <= filtering.sizeOverrideMax;
    }
    return true;
  });
export type HouseholdFiltering = z.infer<typeof HouseholdFilteringSchema>;
