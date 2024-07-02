import { z } from 'zod';

import { DateOfBirthSchema, IsoCodeSchema } from './common';

export enum Sex {
  Male = 'male',
  Female = 'female',
  Other = 'other',
  PreferNotToAnswer = 'prefer_not_to_answer',
}
export const SexSchema = z.nativeEnum(Sex);

export enum ContactMeans {
  Phone = 'phone',
  Whatsapp = 'whatsapp',
  Email = 'email',
  Visit = 'visit',
  Other = 'other',
}
export const ContactMeansSchema = z.nativeEnum(ContactMeans);

export enum ContactDetailType {
  Email = 'email',
  PhoneNumber = 'phone_number',
}
export const ContactDetailTypeSchema = z.nativeEnum(ContactDetailType);

export enum IdentificationType {
  UnhcrId = 'unhcr_id',
  Passport = 'passport',
  NationalId = 'national_id',
  Other = 'other',
}
export const IdentificationTypeSchema = z.nativeEnum(IdentificationType);

export enum DisplacementStatus {
  Idp = 'idp',
  Refugee = 'refugee',
  HostCommunity = 'host_community',
  Returnee = 'returnee',
  NonDisplaced = 'non_displaced',
  AsylumSeeker = 'asylum_seeker',
  Other = 'other',
}
export const DisplacementStatusSchema = z.nativeEnum(DisplacementStatus);

export enum EngagementContext {
  HouseVisit = 'house_visit',
  FieldActivity = 'field_activity',
  Referred = 'referred',
  InOfficeMeeting = 'in_office_meeting',
  RemoteChannels = 'remote_channels',
}
export const EngagementContextSchema = z.nativeEnum(EngagementContext);

const IndividualDetailsSchema = z.object({
  firstName: z.string().max(100).optional().nullable(),
  middleName: z.string().max(100).optional().nullable(),
  lastName: z.string().max(100).optional().nullable(),
  nativeName: z.string().max(100).optional().nullable(),
  motherName: z.string().max(100).optional().nullable(),
  preferredName: z.string().max(100).optional().nullable(),
  prefersToRemainAnonymous: z.boolean().optional().nullable(),
  dateOfBirth: DateOfBirthSchema.optional().nullable(),
  nrcId: z.string().max(40).optional().nullable(),
  preferredLanguage: IsoCodeSchema.optional().nullable(),
  address: z.string().max(512).optional().nullable(),
  contactMeansComment: z.string().max(512).optional().nullable(),
  consentGdpr: z.boolean().optional().nullable(),
  consentReferral: z.boolean().optional().nullable(),
  sex: SexSchema.optional().nullable(),
  preferredContactMeans: ContactMeansSchema.optional().nullable(),
  displacementStatus: DisplacementStatusSchema.optional().nullable(),
  engagementContext: EngagementContextSchema.optional().nullable(),
  dateOfRegistration: z.coerce.date().max(new Date()).optional().nullable(),
});

const EmailContactDetailsDefinitionSchema = z.object({
  value: z.string().max(150).email(),
});
export const PhoneContactDetailsDefinitionSchema = z.object({
  value: z.string().max(150),
});

export type ContactDetailsDefinition = z.infer<
  typeof EmailContactDetailsDefinitionSchema
>;

const EmailContactDetailsSchema = EmailContactDetailsDefinitionSchema.extend({
  id: z.string().uuid(),
});
export const PhoneContactDetailsSchema =
  PhoneContactDetailsDefinitionSchema.extend({
    id: z.string().uuid(),
  });
export type ContactDetails = z.infer<typeof EmailContactDetailsSchema>;

export const IdentificationDefinitionSchema = z.object({
  identificationType: IdentificationTypeSchema,
  identificationNumber: z.string().max(40),
});
export type IdentificationDefinition = z.infer<
  typeof IdentificationDefinitionSchema
>;

export const IdentificationSchema = IdentificationDefinitionSchema.extend({
  id: z.string().uuid(),
});
export type Identification = z.infer<typeof IdentificationSchema>;

export const IndividualDefinitionSchema = IndividualDetailsSchema.extend({
  languages: z.array(IsoCodeSchema).optional().default([]),
  nationalities: z.array(IsoCodeSchema).optional().default([]),
  emails: z.array(EmailContactDetailsDefinitionSchema).optional().default([]),
  phones: z.array(PhoneContactDetailsDefinitionSchema).optional().default([]),
  identification: z
    .array(IdentificationDefinitionSchema)
    .optional()
    .default([]),
  householdId: z.string().ulid().optional(),
  isHeadOfHousehold: z.boolean().optional(),
});
export type IndividualDefinition = z.infer<typeof IndividualDefinitionSchema>;

export const IndividualSchema = IndividualDefinitionSchema.extend({
  id: z.string().ulid(),
  emails: z.array(EmailContactDetailsSchema).optional().default([]),
  phones: z.array(PhoneContactDetailsSchema).optional().default([]),
  identification: z.array(IdentificationSchema).optional().default([]),
  householdId: z.string().ulid(),
});
export type Individual = z.infer<typeof IndividualSchema>;

const EmailContactDetailsWithOptionalIdSchema =
  EmailContactDetailsDefinitionSchema.extend({
    id: z.string().uuid().optional(),
  });
const PhoneContactDetailsWithOptionalIdSchema =
  PhoneContactDetailsDefinitionSchema.extend({
    id: z.string().uuid().optional(),
  });
const IdentificationWithOptionalIdSchema =
  IdentificationDefinitionSchema.extend({
    id: z.string().uuid().optional(),
  });
export const IndividualUpdateSchema = IndividualDefinitionSchema.extend({
  emails: z
    .array(EmailContactDetailsWithOptionalIdSchema)
    .optional()
    .default([]),
  phones: z
    .array(PhoneContactDetailsWithOptionalIdSchema)
    .optional()
    .default([]),
  identification: z
    .array(IdentificationWithOptionalIdSchema)
    .optional()
    .default([]),
});
export type IndividualUpdate = z.infer<typeof IndividualUpdateSchema>;

const IndividualPartialUpdateSchema = IndividualUpdateSchema.extend({
  languages: z
    .object({
      add: z.array(IsoCodeSchema).optional(),
      remove: z.array(IsoCodeSchema).optional(),
    })
    .optional(),
  nationalities: z
    .object({
      add: z.array(IsoCodeSchema).optional(),
      remove: z.array(IsoCodeSchema).optional(),
    })
    .optional(),
  phones: z
    .object({
      add: z.array(PhoneContactDetailsDefinitionSchema).optional(),
      update: z.array(PhoneContactDetailsSchema).optional(),
      remove: z.array(z.string().uuid()).optional(),
    })
    .optional(),
  emails: z
    .object({
      add: z.array(EmailContactDetailsDefinitionSchema).optional(),
      update: z.array(EmailContactDetailsSchema).optional(),
      remove: z.array(z.string().uuid()).optional(),
    })
    .optional(),
  identification: z
    .object({
      add: z.array(IdentificationDefinitionSchema).optional(),
      update: z.array(IdentificationSchema).optional(),
      remove: z.array(z.string().uuid()).optional(),
    })
    .optional(),
});
export type IndividualPartialUpdate = z.infer<
  typeof IndividualPartialUpdateSchema
>;

export const IndividualListItemSchema = IndividualSchema.pick({
  id: true,
  firstName: true,
  lastName: true,
  dateOfBirth: true,
  sex: true,
  displacementStatus: true,
}).extend({
  nationalities: z.array(IsoCodeSchema).max(1).optional().default([]),
  emails: z.array(EmailContactDetailsSchema).max(1).optional().default([]),
  phones: z.array(PhoneContactDetailsSchema).max(1).optional().default([]),
  identification: z.array(IdentificationSchema).max(1).optional().default([]),
});
export type IndividualListItem = z.infer<typeof IndividualListItemSchema>;

export const IndividualListSortingFields = [
  'id',
  'firstName',
  'lastName',
  'dateOfBirth',
  'sex',
  'displacementStatus',
  'nationalities',
  'emails',
  'phones',
  'identificationNumber',
];

export const IndividualDefaultSorting = 'lastName';

export const IndividualFilteringSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  middleName: z.string().optional(),
  nativeName: z.string().optional(),
  motherName: z.string().optional(),
  sex: SexSchema.optional(),
  dateOfBirthMin: z.coerce.date().optional(),
  dateOfBirthMax: z.coerce.date().optional(),
  nationalities: z.string().optional(),
  identificationNumber: z.string().optional(),
  phones: z.string().optional(),
  emails: z.string().optional(),
  address: z.string().optional(),
  displacementStatus: DisplacementStatusSchema.optional(),
  engagementContext: EngagementContextSchema.optional(),
});

export type IndividualFiltering = z.infer<typeof IndividualFilteringSchema>;
