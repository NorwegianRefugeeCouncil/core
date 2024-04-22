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

import { Components } from '../config';

import { DataTypes, EntityUIConfig } from './config.types';
import { optionsFromEnum } from './utils';

export const participantConfig: EntityUIConfig = {
  detail: {
    sections: [
      {
        title: 'Consent',
        fields: [
          {
            path: ['consentGdpr'],
            dataType: DataTypes.Boolean,
            component: Components.Checkbox,
            label: 'Consent GDPR',
            required: true,
          },
          {
            path: ['consentReferral'],
            dataType: DataTypes.Boolean,
            component: Components.Checkbox,
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
            dataType: DataTypes.String,
            component: Components.TextInput,
            label: 'First Name',
          },
          {
            path: ['middleName'],
            dataType: DataTypes.String,
            component: Components.TextInput,
            label: 'Middle Name',
          },
          {
            path: ['lastName'],
            dataType: DataTypes.String,
            component: Components.TextInput,
            label: 'Last Name',
          },
          {
            path: ['nativeName'],
            dataType: DataTypes.String,
            component: Components.TextInput,
            label: 'Native Name',
          },
          {
            path: ['motherName'],
            dataType: DataTypes.String,
            component: Components.TextInput,
            label: 'Mother Name',
          },
          {
            path: ['preferredName'],
            dataType: DataTypes.String,
            component: Components.TextInput,
            label: 'Preferred Name',
          },
          {
            path: ['dateOfBirth'],
            dataType: DataTypes.Date,
            component: Components.Date,
            label: 'Date of Birth',
          },
          {
            path: ['nrcId'],
            dataType: DataTypes.String,
            component: Components.TextInput,
            label: 'NRC ID',
          },
          {
            path: ['residence'],
            dataType: DataTypes.String,
            component: Components.TextArea,
            label: 'Residence',
          },
          {
            path: ['contactMeansComment'],
            dataType: DataTypes.String,
            component: Components.TextArea,
            label: 'Contact Means Comment',
          },
          {
            path: ['sex'],
            dataType: DataTypes.String,
            component: Components.Select,
            label: 'Sex',
            options: optionsFromEnum(Sex),
          },
          {
            path: ['preferredContactMeans'],
            dataType: DataTypes.String,
            component: Components.Select,
            label: 'Preferred Contact Means',
            options: optionsFromEnum(ContactMeans),
          },
          {
            path: ['displacementStatus'],
            dataType: DataTypes.String,
            component: Components.Select,
            label: 'Displacement Status',
            options: optionsFromEnum(DisplacementStatus),
          },
          {
            path: ['engagementContext'],
            dataType: DataTypes.String,
            component: Components.Select,
            label: 'Engagement Context',
            options: optionsFromEnum(EngagementContext),
          },
          {
            path: ['nationalities'],
            component: Components.List,
            label: 'Nationalities',
            children: [
              {
                path: ['isoCode'],
                dataType: DataTypes.String,
                component: Components.Hidden,
              },
              {
                path: ['translationKey'],
                dataType: DataTypes.String,
                component: Components.Select,
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
            component: Components.List,
            label: 'Languages',
            children: [
              {
                path: ['isoCode'],
                dataType: DataTypes.String,
                component: Components.Hidden,
              },
              {
                path: ['translationKey'],
                dataType: DataTypes.String,
                component: Components.Select,
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
            component: Components.List,
            label: 'Email addresses',
            filter: (value: Participant['contactDetails'][0]) =>
              value.contactDetailType === ContactDetailType.Email,
            children: [
              {
                path: ['id'],
                dataType: DataTypes.String,
                component: Components.Hidden,
              },
              {
                path: ['type'],
                dataType: DataTypes.String,
                component: Components.Hidden,
              },
              {
                path: ['value'],
                dataType: DataTypes.String,
                component: Components.TextInput,
                label: 'Email',
              },
            ],
          },
          {
            path: ['contactDetails'],
            component: Components.List,
            label: 'Phone numbers',
            filter: (value: Participant['contactDetails'][0]) =>
              value.contactDetailType === ContactDetailType.PhoneNumber,
            children: [
              {
                path: ['id'],
                dataType: DataTypes.String,
                component: Components.Hidden,
              },
              {
                path: ['type'],
                dataType: DataTypes.String,
                component: Components.Hidden,
              },
              {
                path: ['value'],
                dataType: DataTypes.String,
                component: Components.TextInput,
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
            component: Components.List,
            label: 'Identification',
            children: [
              {
                path: ['id'],
                dataType: DataTypes.String,
                component: Components.Hidden,
              },
              {
                path: ['identificationType'],
                dataType: DataTypes.String,
                component: Components.Select,
                label: 'Identification Type',
                options: optionsFromEnum(IdentificationType),
              },
              {
                path: ['identificationNumber'],
                dataType: DataTypes.String,
                component: Components.TextInput,
                label: 'Identification Number',
              },
              {
                path: ['isPrimary'],
                dataType: DataTypes.String,
                component: Components.Checkbox,
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
            dataType: DataTypes.Boolean,
            component: Components.Checkbox,
            label: 'Has Disability PWD',
          },
          {
            path: ['disabilities', 'disabilityPwdComment'],
            dataType: DataTypes.String,
            component: Components.TextArea,
            label: 'Disability PWD Comment',
          },
          {
            path: ['disabilities', 'hasDisabilityVision'],
            dataType: DataTypes.Boolean,
            component: Components.Checkbox,
            label: 'Has Disability Vision',
          },
          {
            path: ['disabilities', 'disabilityVisionLevel'],
            dataType: DataTypes.String,
            component: Components.Select,
            label: 'Disability Vision Level',
            options: optionsFromEnum(DisabilityLevel),
          },
          {
            path: ['disabilities', 'hasDisabilityHearing'],
            dataType: DataTypes.Boolean,
            component: Components.Checkbox,
            label: 'Has Disability Hearing',
          },
          {
            path: ['disabilities', 'disabilityHearingLevel'],
            dataType: DataTypes.String,
            component: Components.Select,
            label: 'Disability Hearing Level',
            options: optionsFromEnum(DisabilityLevel),
          },
          {
            path: ['disabilities', 'hasDisabilityMobility'],
            dataType: DataTypes.Boolean,
            component: Components.Checkbox,
            label: 'Has Disability Mobility',
          },
          {
            path: ['disabilities', 'disabilityMobilityLevel'],
            dataType: DataTypes.String,
            component: Components.Select,
            label: 'Disability Mobility Level',
            options: optionsFromEnum(DisabilityLevel),
          },
          {
            path: ['disabilities', 'hasDisabilityCognition'],
            dataType: DataTypes.Boolean,
            component: Components.Checkbox,
            label: 'Has Disability Cognition',
          },
          {
            path: ['disabilities', 'disabilityCognitionLevel'],
            dataType: DataTypes.String,
            component: Components.Select,
            label: 'Disability Cognition Level',
            options: optionsFromEnum(DisabilityLevel),
          },
          {
            path: ['disabilities', 'hasDisabilitySelfcare'],
            dataType: DataTypes.Boolean,
            component: Components.Checkbox,
            label: 'Has Disability Selfcare',
          },
          {
            path: ['disabilities', 'disabilitySelfcareLevel'],
            dataType: DataTypes.String,
            component: Components.Select,
            label: 'Disability Selfcare Level',
            options: optionsFromEnum(DisabilityLevel),
          },
          {
            path: ['disabilities', 'hasDisabilityCommunication'],
            dataType: DataTypes.Boolean,
            component: Components.Checkbox,
            label: 'Has Disability Communication',
          },
          {
            path: ['disabilities', 'disabilityCommunicationLevel'],
            dataType: DataTypes.String,
            component: Components.Select,
            label: 'Disability Communication Level',
            options: optionsFromEnum(DisabilityLevel),
          },
          {
            path: ['disabilities', 'isChildAtRisk'],
            dataType: DataTypes.String,
            component: Components.Select,
            label: 'Is Child At Risk',
            options: optionsFromEnum(YesNoUnknown),
          },
          {
            path: ['disabilities', 'isElderAtRisk'],
            dataType: DataTypes.String,
            component: Components.Select,
            label: 'Is Elder At Risk',
            options: optionsFromEnum(YesNoUnknown),
          },
          {
            path: ['disabilities', 'isWomanAtRisk'],
            dataType: DataTypes.String,
            component: Components.Select,
            label: 'Is Woman At Risk',
            options: optionsFromEnum(YesNoUnknown),
          },
          {
            path: ['disabilities', 'isSingleParent'],
            dataType: DataTypes.String,
            component: Components.Select,
            label: 'Is Single Parent',
            options: optionsFromEnum(YesNoUnknown),
          },
          {
            path: ['disabilities', 'isSeparatedChild'],
            dataType: DataTypes.String,
            component: Components.Select,
            label: 'Is Separated Child',
            options: optionsFromEnum(YesNoUnknown),
          },
          {
            path: ['disabilities', 'isPregnant'],
            dataType: DataTypes.String,
            component: Components.Select,
            label: 'Is Pregnant',
            options: optionsFromEnum(YesNoUnknown),
          },
          {
            path: ['disabilities', 'isLactating'],
            dataType: DataTypes.String,
            component: Components.Select,
            label: 'Is Lactating',
            options: optionsFromEnum(YesNoUnknown),
          },
          {
            path: ['disabilities', 'hasMedicalCondition'],
            dataType: DataTypes.String,
            component: Components.Select,
            label: 'Has Medical Condition',
            options: optionsFromEnum(YesNoUnknown),
          },
          {
            path: ['disabilities', 'needsLegalPhysicalProtection'],
            dataType: DataTypes.String,
            component: Components.Select,
            label: 'Needs Legal Physical Protection',
            options: optionsFromEnum(YesNoUnknown),
          },
          {
            path: ['disabilities', 'vulnerabilityComments'],
            dataType: DataTypes.String,
            component: Components.TextArea,
            label: 'Vulnerability Comments',
          },
        ],
      },
    ],
  },
  list: {},
  search: {},
};
