import {
  ContactDetailType,
  ContactMeans,
  DisabilityLevel,
  DisplacementStatus,
  EngagementContext,
  IdentificationType,
  Participant,
  Sex,
  YesNoUnknown,
} from '@nrcno/core-models';

import { Component, DataType, EntityUIConfig } from './config.types';
import { optionsFromEnum } from './utils';

export const participantConfig: EntityUIConfig = {
  detail: {
    sections: [
      {
        title: 'Consent',
        fields: [
          {
            path: ['consentGdpr'],
            dataType: DataType.Boolean,
            component: Component.Checkbox,
            label: 'Consent GDPR',
            required: true,
          },
          {
            path: ['consentReferral'],
            dataType: DataType.Boolean,
            component: Component.Checkbox,
            label: 'Consent Referral',
            required: true,
          },
        ],
      },
      {
        title: 'Personal Information',
        fields: [
          {
            path: ['firstName'],
            dataType: DataType.String,
            component: Component.TextInput,
            label: 'First Name',
          },
          {
            path: ['middleName'],
            dataType: DataType.String,
            component: Component.TextInput,
            label: 'Middle Name',
          },
          {
            path: ['lastName'],
            dataType: DataType.String,
            component: Component.TextInput,
            label: 'Last Name',
          },
          {
            path: ['nativeName'],
            dataType: DataType.String,
            component: Component.TextInput,
            label: 'Native Name',
          },
          {
            path: ['motherName'],
            dataType: DataType.String,
            component: Component.TextInput,
            label: 'Mother Name',
          },
          {
            path: ['preferredName'],
            dataType: DataType.String,
            component: Component.TextInput,
            label: 'Preferred Name',
          },
          {
            path: ['dateOfBirth'],
            dataType: DataType.Date,
            component: Component.Date,
            label: 'Date of Birth',
          },
          {
            path: ['nrcId'],
            dataType: DataType.String,
            component: Component.TextInput,
            label: 'NRC ID',
          },
          {
            path: ['residence'],
            dataType: DataType.String,
            component: Component.TextArea,
            label: 'Residence',
          },
          {
            path: ['contactMeansComment'],
            dataType: DataType.String,
            component: Component.TextArea,
            label: 'Contact Means Comment',
          },
          {
            path: ['sex'],
            dataType: DataType.String,
            component: Component.Select,
            label: 'Sex',
            options: optionsFromEnum(Sex),
          },
          {
            path: ['preferredContactMeans'],
            dataType: DataType.String,
            component: Component.Select,
            label: 'Preferred Contact Means',
            options: optionsFromEnum(ContactMeans),
          },
          {
            path: ['displacementStatus'],
            dataType: DataType.String,
            component: Component.Select,
            label: 'Displacement Status',
            options: optionsFromEnum(DisplacementStatus),
          },
          {
            path: ['engagementContext'],
            dataType: DataType.String,
            component: Component.Select,
            label: 'Engagement Context',
            options: optionsFromEnum(EngagementContext),
          },
          {
            path: ['nationalities'],
            component: Component.List,
            label: 'Nationalities',
            children: [
              {
                path: ['isoCode'],
                dataType: DataType.String,
                component: Component.Hidden,
              },
              {
                path: ['translationKey'],
                dataType: DataType.String,
                component: Component.Select,
                options: {
                  options: [
                    { value: 'en', label: 'English' },
                    { value: 'es', label: 'Spanish' },
                    { value: 'fr', label: 'French' },
                    { value: 'ar', label: 'Arabic' },
                  ],
                },
              },
            ],
          },
          {
            path: ['languages'],
            component: Component.List,
            label: 'Languages',
            children: [
              {
                path: ['isoCode'],
                dataType: DataType.String,
                component: Component.Hidden,
              },
              {
                path: ['translationKey'],
                dataType: DataType.String,
                component: Component.Select,
                options: {
                  options: [
                    { value: 'en', label: 'English' },
                    { value: 'es', label: 'Spanish' },
                    { value: 'fr', label: 'French' },
                    { value: 'ar', label: 'Arabic' },
                  ],
                },
              },
            ],
          },
        ],
      },
      {
        title: 'Contact Information',
        fields: [
          {
            path: ['contactDetails'],
            component: Component.List,
            label: 'Email addresses',
            filter: (value: Participant['contactDetails'][0]) =>
              value.contactDetailType === ContactDetailType.Email,
            children: [
              {
                path: ['id'],
                dataType: DataType.String,
                component: Component.Hidden,
              },
              {
                path: ['type'],
                dataType: DataType.String,
                component: Component.Hidden,
              },
              {
                path: ['value'],
                dataType: DataType.String,
                component: Component.TextInput,
                label: 'Email',
              },
            ],
          },
          {
            path: ['contactDetails'],
            component: Component.List,
            label: 'Phone numbers',
            filter: (value: Participant['contactDetails'][0]) =>
              value.contactDetailType === ContactDetailType.PhoneNumber,
            children: [
              {
                path: ['id'],
                dataType: DataType.String,
                component: Component.Hidden,
              },
              {
                path: ['type'],
                dataType: DataType.String,
                component: Component.Hidden,
              },
              {
                path: ['value'],
                dataType: DataType.String,
                component: Component.TextInput,
                label: 'Phone number',
              },
            ],
          },
        ],
      },
      {
        title: 'Identification',
        fields: [
          {
            path: ['identification'],
            component: Component.List,
            label: 'Identification',
            children: [
              {
                path: ['id'],
                dataType: DataType.String,
                component: Component.Hidden,
              },
              {
                path: ['identificationType'],
                dataType: DataType.String,
                component: Component.Select,
                label: 'Identification Type',
                options: optionsFromEnum(IdentificationType),
              },
              {
                path: ['identificationNumber'],
                dataType: DataType.String,
                component: Component.TextInput,
                label: 'Identification Number',
              },
              {
                path: ['isPrimary'],
                dataType: DataType.String,
                component: Component.Checkbox,
                label: 'Is Primary',
              },
            ],
          },
        ],
      },
      {
        title: 'Disability',
        fields: [
          {
            path: ['disabilities', 'hasDisabilityPwd'],
            dataType: DataType.Boolean,
            component: Component.Checkbox,
            label: 'Has Disability PWD',
          },
          {
            path: ['disabilities', 'disabilityPwdComment'],
            dataType: DataType.String,
            component: Component.TextArea,
            label: 'Disability PWD Comment',
          },
          {
            path: ['disabilities', 'hasDisabilityVision'],
            dataType: DataType.Boolean,
            component: Component.Checkbox,
            label: 'Has Disability Vision',
          },
          {
            path: ['disabilities', 'disabilityVisionLevel'],
            dataType: DataType.String,
            component: Component.Select,
            label: 'Disability Vision Level',
            options: optionsFromEnum(DisabilityLevel),
          },
          {
            path: ['disabilities', 'hasDisabilityHearing'],
            dataType: DataType.Boolean,
            component: Component.Checkbox,
            label: 'Has Disability Hearing',
          },
          {
            path: ['disabilities', 'disabilityHearingLevel'],
            dataType: DataType.String,
            component: Component.Select,
            label: 'Disability Hearing Level',
            options: optionsFromEnum(DisabilityLevel),
          },
          {
            path: ['disabilities', 'hasDisabilityMobility'],
            dataType: DataType.Boolean,
            component: Component.Checkbox,
            label: 'Has Disability Mobility',
          },
          {
            path: ['disabilities', 'disabilityMobilityLevel'],
            dataType: DataType.String,
            component: Component.Select,
            label: 'Disability Mobility Level',
            options: optionsFromEnum(DisabilityLevel),
          },
          {
            path: ['disabilities', 'hasDisabilityCognition'],
            dataType: DataType.Boolean,
            component: Component.Checkbox,
            label: 'Has Disability Cognition',
          },
          {
            path: ['disabilities', 'disabilityCognitionLevel'],
            dataType: DataType.String,
            component: Component.Select,
            label: 'Disability Cognition Level',
            options: optionsFromEnum(DisabilityLevel),
          },
          {
            path: ['disabilities', 'hasDisabilitySelfcare'],
            dataType: DataType.Boolean,
            component: Component.Checkbox,
            label: 'Has Disability Selfcare',
          },
          {
            path: ['disabilities', 'disabilitySelfcareLevel'],
            dataType: DataType.String,
            component: Component.Select,
            label: 'Disability Selfcare Level',
            options: optionsFromEnum(DisabilityLevel),
          },
          {
            path: ['disabilities', 'hasDisabilityCommunication'],
            dataType: DataType.Boolean,
            component: Component.Checkbox,
            label: 'Has Disability Communication',
          },
          {
            path: ['disabilities', 'disabilityCommunicationLevel'],
            dataType: DataType.String,
            component: Component.Select,
            label: 'Disability Communication Level',
            options: optionsFromEnum(DisabilityLevel),
          },
          {
            path: ['disabilities', 'isChildAtRisk'],
            dataType: DataType.String,
            component: Component.Select,
            label: 'Is Child At Risk',
            options: optionsFromEnum(YesNoUnknown),
          },
          {
            path: ['disabilities', 'isElderAtRisk'],
            dataType: DataType.String,
            component: Component.Select,
            label: 'Is Elder At Risk',
            options: optionsFromEnum(YesNoUnknown),
          },
          {
            path: ['disabilities', 'isWomanAtRisk'],
            dataType: DataType.String,
            component: Component.Select,
            label: 'Is Woman At Risk',
            options: optionsFromEnum(YesNoUnknown),
          },
          {
            path: ['disabilities', 'isSingleParent'],
            dataType: DataType.String,
            component: Component.Select,
            label: 'Is Single Parent',
            options: optionsFromEnum(YesNoUnknown),
          },
          {
            path: ['disabilities', 'isSeparatedChild'],
            dataType: DataType.String,
            component: Component.Select,
            label: 'Is Separated Child',
            options: optionsFromEnum(YesNoUnknown),
          },
          {
            path: ['disabilities', 'isPregnant'],
            dataType: DataType.String,
            component: Component.Select,
            label: 'Is Pregnant',
            options: optionsFromEnum(YesNoUnknown),
          },
          {
            path: ['disabilities', 'isLactating'],
            dataType: DataType.String,
            component: Component.Select,
            label: 'Is Lactating',
            options: optionsFromEnum(YesNoUnknown),
          },
          {
            path: ['disabilities', 'hasMedicalCondition'],
            dataType: DataType.String,
            component: Component.Select,
            label: 'Has Medical Condition',
            options: optionsFromEnum(YesNoUnknown),
          },
          {
            path: ['disabilities', 'needsLegalPhysicalProtection'],
            dataType: DataType.String,
            component: Component.Select,
            label: 'Needs Legal Physical Protection',
            options: optionsFromEnum(YesNoUnknown),
          },
          {
            path: ['disabilities', 'vulnerabilityComments'],
            dataType: DataType.String,
            component: Component.TextArea,
            label: 'Vulnerability Comments',
          },
        ],
      },
    ],
  },
  list: {},
  search: {},
};
