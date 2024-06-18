import { z } from 'zod';

import { DateOfBirthSchema, IsoCodeSchema } from './common';
import {
  IdentificationDefinitionSchema,
  IdentificationSchema,
  PhoneContactDetailsDefinitionSchema,
  PhoneContactDetailsSchema,
  SexSchema,
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

const HouseholdIndividualDefinitionSchema = z.object({
  isHeadOfHousehold: z.boolean().optional().default(false),
  lastName: z.string().max(100).optional().nullable(),
  firstName: z.string().max(100).optional().nullable(),
  sex: SexSchema.optional().nullable(),
  dateOfBirth: DateOfBirthSchema.optional().nullable(),
  nationality: IsoCodeSchema.optional().nullable(),
  identification: IdentificationDefinitionSchema.optional().nullable(),
  address: z.string().max(512).optional().nullable(),
  phone: PhoneContactDetailsDefinitionSchema.optional().nullable(),
});

export const HouseholdDefinitionSchema = z.object({
  headType: HeadOfHouseholdTypeSchema.optional(),
  sizeOverride: z.number().int().optional(),
  individuals: z.array(HouseholdIndividualDefinitionSchema),
});
export type HouseholdDefinition = z.infer<typeof HouseholdDefinitionSchema>;

const HouseholdIndividualSchema = HouseholdIndividualDefinitionSchema.merge(
  z.object({
    id: z.string().ulid(),
    identification: IdentificationSchema.nullable(),
    phone: PhoneContactDetailsSchema.nullable(),
  }),
);

export const HouseholdSchema = HouseholdDefinitionSchema.merge(
  z.object({
    id: z.string().ulid(),
    headId: z.string().ulid().optional(), // TODO: remove optional once enforcing head of household
    headNationality: IsoCodeSchema.optional(),
    individuals: z.array(HouseholdIndividualSchema),
  }),
);
export type Household = z.infer<typeof HouseholdSchema>;
