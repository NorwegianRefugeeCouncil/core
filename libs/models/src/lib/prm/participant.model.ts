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
  isPrimary: z.boolean().optional().default(false),
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

export const ParticipantDefinitionSchema = ParticipantDetailsSchema.merge(
  z.object({
    disabilities: ParticipantDisabilitySchema.optional(),
    languages: z.array(IsoCodeSchema).optional().default([]),
    nationalities: z.array(IsoCodeSchema).optional().default([]),
    contactDetails: z
      .object({
        emails: z.array(ContactDetailsDefinitionSchema).optional().default([]),
        phones: z.array(ContactDetailsDefinitionSchema).optional().default([]),
      })
      .optional()
      .default({ emails: [], phones: [] }),
    identification: z
      .array(IdentificationDefinitionSchema)
      .optional()
      .default([]),
  }),
);

export type ParticipantDefinition = z.infer<typeof ParticipantDefinitionSchema>;

export const ParticipantSchema = ParticipantDefinitionSchema.merge(
  z.object({
    id: z.string().ulid(),
    languages: z.array(IsoCodeSchema).optional().default([]),
    nationalities: z.array(IsoCodeSchema).optional().default([]),
    contactDetails: z
      .object({
        emails: z.array(ContactDetailsSchema).optional().default([]),
        phones: z.array(ContactDetailsSchema).optional().default([]),
      })
      .optional()
      .default({
        emails: [],
        phones: [],
      }),
    identification: z.array(IdentificationSchema).optional().default([]),
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
    contactDetails: z
      .object({
        emails: z
          .array(ContactDetailsWithOptionalIdSchema)
          .optional()
          .default([]),
        phones: z
          .array(ContactDetailsWithOptionalIdSchema)
          .optional()
          .default([]),
      })
      .optional()
      .default({ emails: [], phones: [] }),
    identification: z
      .array(IdentificationWithOptionalIdSchema)
      .optional()
      .default([]),
  }),
);
export type ParticipantUpdate = z.infer<typeof ParticipantUpdateSchema>;

const ParticipantPartialUpdateSchema = ParticipantUpdateSchema.merge(
  z.object({
    consentGdpr: z.boolean().optional(),
    consentReferral: z.boolean().optional(),
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

export const ParticipantListItemSchema = z.object({
  id: z.string().ulid(),
  firstName: z.string().max(100).nullable(),
  lastName: z.string().max(100).nullable(),
  dateOfBirth: z.coerce.date().nullable(),
  sex: SexSchema.nullable(),
  displacementStatus: DisplacementStatusSchema.nullable(),
  nationalities: z.array(IsoCodeSchema).max(1).optional().default([]),
  contactDetails: z
    .object({
      emails: z.array(ContactDetailsSchema).max(1).optional().default([]),
      phones: z.array(ContactDetailsSchema).max(1).optional().default([]),
    })
    .optional()
    .default({
      emails: [],
      phones: [],
    }),
  identification: z.array(IdentificationSchema).max(1).optional().default([]),
});
export type ParticipantListItem = z.infer<typeof ParticipantListItemSchema>;

export const ParticipantFilteringSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  middleName: z.string().optional(),
  nativeName: z.string().optional(),
  motherName: z.string().optional(),
  sex: SexSchema.optional(),
  dateOfBirth: z.coerce.date().optional(),
  nationalities: z.string().optional(),
  identificationNumber: z.string().optional(),
  phones: z.string().optional(),
  emails: z.string().optional(),
  residence: z.string().optional(),
  displacementStatus: DisplacementStatusSchema.optional(),
  engagementContext: EngagementContextSchema.optional(),
  hasDisabilityPwd: z.boolean().optional(),
  hasDisabilityVision: z.boolean().optional(),
  hasDisabilityHearing: z.boolean().optional(),
  hasDisabilityMobility: z.boolean().optional(),
  hasDisabilityCognition: z.boolean().optional(),
  hasDisabilitySelfcare: z.boolean().optional(),
  hasDisabilityCommunication: z.boolean().optional(),
  isChildAtRisk: YesNoUnknownSchema.optional(),
  isElderAtRisk: YesNoUnknownSchema.optional(),
  isWomanAtRisk: YesNoUnknownSchema.optional(),
  isSingleParent: YesNoUnknownSchema.optional(),
  isSeparatedChild: YesNoUnknownSchema.optional(),
  isPregnant: YesNoUnknownSchema.optional(),
  isLactating: YesNoUnknownSchema.optional(),
  hasMedicalCondition: YesNoUnknownSchema.optional(),
  needsLegalPhysicalProtection: YesNoUnknownSchema.optional(),
});
export type ParticipantFiltering = z.infer<typeof ParticipantFilteringSchema>;
