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
  firstName: z.string().max(100).optional(),
  middleName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  nativeName: z.string().max(100).optional(),
  motherName: z.string().max(100).optional(),
  preferredName: z.string().max(100).optional(),
  dateOfBirth: z.date().optional(),
  nrcId: z.string().max(40).optional(),
  residence: z.string().optional(),
  contactMeansComment: z.string().optional(),
  consentGdpr: z.boolean(),
  consentReferral: z.boolean(),
  sex: SexSchema.optional(),
  preferredContactMeans: ContactMeansSchema.optional(),
  displacementStatus: DisplacementStatusSchema.optional(),
  engagementContext: EngagementContextSchema.optional(),
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
  contactDetailType: ContactDetailTypeSchema,
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
    contactDetails: z.array(ContactDetailsSchema),
    identification: z.array(IdentificationSchema),
  }),
);

export type ParticipantDefinition = z.infer<typeof ParticipantDefinitionSchema>;

export const ParticipantSchema = ParticipantDefinitionSchema.merge(
  z.object({
    id: z.string().ulid(),
    disabilities: ParticipantDisabilitySchema.optional(),
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
    contactDetails: z.array(
      ContactDetailsSchema.merge(
        z.object({
          id: z.string().uuid(),
        }),
      ),
    ),
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
