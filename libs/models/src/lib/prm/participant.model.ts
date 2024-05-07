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
  hasDisabilityPwd: z.boolean().optional().nullable(),
  disabilityPwdComment: z.string().optional().nullable(),
  hasDisabilityVision: z.boolean().optional().nullable(),
  disabilityVisionLevel: DisabilityLevelSchema.optional().nullable(),
  hasDisabilityHearing: z.boolean().optional().nullable(),
  disabilityHearingLevel: DisabilityLevelSchema.optional().nullable(),
  hasDisabilityMobility: z.boolean().optional().nullable(),
  disabilityMobilityLevel: DisabilityLevelSchema.optional().nullable(),
  hasDisabilityCognition: z.boolean().optional().nullable(),
  disabilityCognitionLevel: DisabilityLevelSchema.optional().nullable(),
  hasDisabilitySelfcare: z.boolean().optional().nullable(),
  disabilitySelfcareLevel: DisabilityLevelSchema.optional().nullable(),
  hasDisabilityCommunication: z.boolean().optional().nullable(),
  disabilityCommunicationLevel: DisabilityLevelSchema.optional().nullable(),
  isChildAtRisk: YesNoUnknownSchema.optional().nullable(),
  isElderAtRisk: YesNoUnknownSchema.optional().nullable(),
  isWomanAtRisk: YesNoUnknownSchema.optional().nullable(),
  isSingleParent: YesNoUnknownSchema.optional().nullable(),
  isSeparatedChild: YesNoUnknownSchema.optional().nullable(),
  isPregnant: YesNoUnknownSchema.optional().nullable(),
  isLactating: YesNoUnknownSchema.optional().nullable(),
  hasMedicalCondition: YesNoUnknownSchema.optional().nullable(),
  needsLegalPhysicalProtection: YesNoUnknownSchema.optional().nullable(),
  vulnerabilityComments: z.string().optional().nullable(),
});

const ContactDetailsDefinitionSchema = z.object({
  value: z.string(),
});
export type ContactDetailsDefinition = z.infer<
  typeof ContactDetailsDefinitionSchema
>;

const ContactDetailsSchema = ContactDetailsDefinitionSchema.merge(
  z.object({
    id: z.string().uuid(),
  }),
);
export type ContactDetails = z.infer<typeof ContactDetailsSchema>;

const IdentificationDefinitionSchema = z.object({
  identificationType: IdentificationTypeSchema,
  identificationNumber: z.string(),
  isPrimary: z.boolean(),
});
export type IdentificationDefinition = z.infer<
  typeof IdentificationDefinitionSchema
>;

const IdentificationSchema = IdentificationDefinitionSchema.merge(
  z.object({
    id: z.string().uuid(),
  }),
);
export type Identification = z.infer<typeof IdentificationSchema>;

const IsoCodeSchema = z.string().max(20);
const LanguageDefinitionSchema = z.object({
  isoCode: IsoCodeSchema,
});
export type LanguageDefinition = z.infer<typeof LanguageDefinitionSchema>;

const LanguageSchema = LanguageDefinitionSchema.merge(
  z.object({
    translationKey: z.string().max(200),
  }),
);
export type Language = z.infer<typeof LanguageSchema>;

const NationalityDefinitionSchema = z.object({
  isoCode: IsoCodeSchema,
});
export type NationalityDefinition = z.infer<typeof NationalityDefinitionSchema>;

const NationalitySchema = NationalityDefinitionSchema.merge(
  z.object({
    translationKey: z.string().max(200),
  }),
);
export type Nationality = z.infer<typeof NationalitySchema>;

export const ParticipantDefinitionSchema = ParticipantDetailsSchema.merge(
  z.object({
    disabilities: ParticipantDisabilitySchema.optional(),
    languages: z.array(LanguageDefinitionSchema),
    nationalities: z.array(NationalityDefinitionSchema),
    contactDetails: z.object({
      emails: z.array(ContactDetailsDefinitionSchema),
      phones: z.array(ContactDetailsDefinitionSchema),
    }),
    identification: z.array(IdentificationDefinitionSchema),
  }),
);

export type ParticipantDefinition = z.infer<typeof ParticipantDefinitionSchema>;

export const ParticipantSchema = ParticipantDefinitionSchema.merge(
  z.object({
    id: z.string().ulid(),
    languages: z.array(LanguageSchema),
    nationalities: z.array(NationalitySchema),
    contactDetails: z.object({
      emails: z.array(ContactDetailsSchema),
      phones: z.array(ContactDetailsSchema),
    }),
    identification: z.array(IdentificationSchema),
  }),
);

export type Participant = z.infer<typeof ParticipantSchema>;

const ContactDetailsWithOptionalIdSchema = ContactDetailsDefinitionSchema.merge(
  z.object({
    id: z.string().uuid().optional(),
  }),
);
const IdentificationWithOptionalIdSchema = IdentificationDefinitionSchema.merge(
  z.object({
    id: z.string().uuid().optional(),
  }),
);
export const ParticipantUpdateSchema = ParticipantDefinitionSchema.merge(
  z.object({
    consentGdpr: z.boolean().optional(),
    consentReferral: z.boolean().optional(),
    languages: z.array(LanguageDefinitionSchema).optional(),
    nationalities: z.array(NationalityDefinitionSchema).optional(),
    contactDetails: z
      .object({
        emails: z.array(ContactDetailsWithOptionalIdSchema).optional(),
        phones: z.array(ContactDetailsWithOptionalIdSchema).optional(),
      })
      .optional(),
    identification: z.array(IdentificationWithOptionalIdSchema).optional(),
  }),
);
export type ParticipantUpdate = z.infer<typeof ParticipantUpdateSchema>;

const ParticipantPartialUpdateSchema = ParticipantUpdateSchema.merge(
  z.object({
    languages: z
      .object({
        add: z.array(LanguageDefinitionSchema).optional(),
        remove: z.array(IsoCodeSchema).optional(),
      })
      .optional(),
    nationalities: z
      .object({
        add: z.array(NationalityDefinitionSchema).optional(),
        remove: z.array(IsoCodeSchema).optional(),
      })
      .optional(),
    contactDetails: z
      .object({
        phones: z
          .object({
            add: z.array(ContactDetailsDefinitionSchema).optional(),
            update: z.array(ContactDetailsSchema).optional(),
            remove: z.array(z.string().uuid()).optional(),
          })
          .optional(),
        emails: z
          .object({
            add: z.array(ContactDetailsDefinitionSchema).optional(),
            update: z.array(ContactDetailsSchema).optional(),
            remove: z.array(z.string().uuid()).optional(),
          })
          .optional(),
      })
      .optional(),
    identification: z
      .object({
        add: z.array(IdentificationDefinitionSchema).optional(),
        update: z.array(IdentificationSchema).optional(),
        remove: z.array(z.string().uuid()).optional(),
      })
      .optional(),
  }),
);
export type ParticipantPartialUpdate = z.infer<
  typeof ParticipantPartialUpdateSchema
>;
