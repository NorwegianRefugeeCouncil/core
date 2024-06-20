import { z } from 'zod';

import { IsoCodeSchema } from './common';
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
  headType: HeadOfHouseholdTypeSchema.optional(),
  sizeOverride: z.number().int().optional(),
  individuals: z.array(HouseholdIndividualDefinitionSchema),
});
export type HouseholdDefinition = z.infer<typeof HouseholdDefinitionSchema>;

const HouseholdIndividualSchema = HouseholdIndividualDefinitionSchema.merge(
  IndividualSchema.pick({ id: true, identification: true, phones: true }),
);

export const HouseholdSchema = HouseholdDefinitionSchema.extend({
  id: z.string().ulid(),
  headId: z.string().ulid().optional(), // TODO: remove optional once enforcing head of household
  headNationality: IsoCodeSchema.optional(),
  individuals: z.array(HouseholdIndividualSchema),
});
export type Household = z.infer<typeof HouseholdSchema>;
