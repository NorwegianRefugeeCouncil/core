import { z } from 'zod';

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

export enum DisabilityLevel {
  One = '1',
  Two = '2',
  Three = '3',
  Four = '4',
}
export const DisabilityLevelSchema = z.nativeEnum(DisabilityLevel);

export enum YesNoUnknown {
  Yes = 'yes',
  No = 'no',
  Unknown = 'unknown',
}
export const YesNoUnknownSchema = z.nativeEnum(YesNoUnknown);

const ParticipantDetailsSchema = z.object({
  firstName: z.string().max(100).optional().nullable(),
  middleName: z.string().max(100).optional().nullable(),
  lastName: z.string().max(100).optional().nullable(),
  nativeName: z.string().max(100).optional().nullable(),
  motherName: z.string().max(100).optional().nullable(),
  preferredName: z.string().max(100).optional().nullable(),
  dateOfBirth: z.coerce.date().optional().nullable(),
  nrcId: z.string().max(40).optional().nullable(),
  residence: z.string().optional().nullable(),
  contactMeansComment: z.string().optional().nullable(),
  consentGdpr: z.boolean(),
  consentReferral: z.boolean(),
  sex: SexSchema.optional().nullable(),
  preferredContactMeans: ContactMeansSchema.optional().nullable(),
  displacementStatus: DisplacementStatusSchema.optional().nullable(),
  engagementContext: EngagementContextSchema.optional().nullable(),
});

const ParticipantDisabilitySchema = z.object({
  hasDisabilityPwd: z.boolean(),
  disabilityPwdComment: z.string(),
  hasDisabilityVision: z.boolean(),
  disabilityVisionLevel: DisabilityLevelSchema,
  hasDisabilityHearing: z.boolean(),
  disabilityHearingLevel: DisabilityLevelSchema,
  hasDisabilityMobility: z.boolean(),
  disabilityMobilityLevel: DisabilityLevelSchema,
  hasDisabilityCognition: z.boolean(),
  disabilityCognitionLevel: DisabilityLevelSchema,
  hasDisabilitySelfcare: z.boolean(),
  disabilitySelfcareLevel: DisabilityLevelSchema,
  hasDisabilityCommunication: z.boolean(),
  disabilityCommunicationLevel: DisabilityLevelSchema,
  isChildAtRisk: YesNoUnknownSchema,
  isElderAtRisk: YesNoUnknownSchema,
  isWomanAtRisk: YesNoUnknownSchema,
  isSingleParent: YesNoUnknownSchema,
  isSeparatedChild: YesNoUnknownSchema,
  isPregnant: YesNoUnknownSchema,
  isLactating: YesNoUnknownSchema,
  hasMedicalCondition: YesNoUnknownSchema,
  needsLegalPhysicalProtection: YesNoUnknownSchema,
  vulnerabilityComments: z.string(),
});

const ContactDetailsSchema = z.object({
  value: z.string(),
});

const IdentificationSchema = z.object({
  identificationType: IdentificationTypeSchema,
  identificationNumber: z.string(),
  isPrimary: z.boolean(),
});

export const ParticipantDefinitionSchema = ParticipantDetailsSchema.merge(
  z.object({
    disabilities: ParticipantDisabilitySchema.optional(),
    languages: z.array(
      z.object({
        isoCode: z.string().max(20),
      }),
    ),
    nationalities: z.array(
      z.object({
        isoCode: z.string().max(20),
      }),
    ),
    contactDetails: z.object({
      emails: z.array(ContactDetailsSchema),
      phones: z.array(ContactDetailsSchema),
    }),
    identification: z.array(IdentificationSchema),
  }),
);

export type ParticipantDefinition = z.infer<typeof ParticipantDefinitionSchema>;

export const ParticipantSchema = ParticipantDefinitionSchema.merge(
  z.object({
    id: z.string().ulid(),
    languages: z.array(
      z.object({
        isoCode: z.string().max(20),
        translationKey: z.string().max(200),
      }),
    ),
    nationalities: z.array(
      z.object({
        isoCode: z.string().max(20),
        translationKey: z.string().max(200),
      }),
    ),
    contactDetails: z.object({
      emails: z.array(
        ContactDetailsSchema.merge(
          z.object({
            id: z.string().uuid(),
          }),
        ),
      ),
      phones: z.array(
        ContactDetailsSchema.merge(
          z.object({
            id: z.string().uuid(),
          }),
        ),
      ),
    }),
    identification: z.array(
      IdentificationSchema.merge(
        z.object({
          id: z.string().uuid(),
        }),
      ),
    ),
  }),
);

export type Participant = z.infer<typeof ParticipantSchema>;

export const ParticipantListItemSchema = z.object({
  id: z.string().ulid(),
  firstName: z.string().max(100).nullable(),
  lastName: z.string().max(100).nullable(),
  dateOfBirth: z.coerce.date().nullable(),
  sex: SexSchema.nullable(),
  displacementStatus: DisplacementStatusSchema.nullable(),
  primaryIdentification: z
    .object({
      identificationType: IdentificationTypeSchema,
      identificationNumber: z.string(),
    })
    .nullable(),
  nationality: z.string().max(20).nullable(), // TODO: update with the ISO code schema var when rebasing
  email: z.string().nullable(),
  phone: z.string().nullable(),
});
export type ParticipantListItem = z.infer<typeof ParticipantListItemSchema>;
