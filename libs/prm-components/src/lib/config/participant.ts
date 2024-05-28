import {
  ContactDetailType,
  ContactMeans,
  DisabilityLevel,
  DisplacementStatus,
  EngagementContext,
  IdentificationType,
  Sex,
  YesNoUnknown,
} from '@nrcno/core-models';

import { Component, DataType, EntityUIConfigLoader } from './config.types';
import { optionsFromEnum } from './utils';

export const participantConfig: EntityUIConfigLoader = (staticData) => ({
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
            path: ['id'],
            dataType: DataType.String,
            component: Component.Display,
            label: 'ID',
          },
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
            component: Component.TextInput,
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
                path: [],
                dataType: DataType.String,
                component: Component.Select,
                options: staticData.nationalities.map((nationality) => ({
                  value: nationality.id,
                  label: `nationality__${nationality.id}`,
                })),
              },
            ],
          },
          {
            path: ['languages'],
            component: Component.List,
            label: 'Languages',
            children: [
              {
                path: [],
                dataType: DataType.String,
                component: Component.Select,
                options: staticData.languages.map((language) => ({
                  value: language.id,
                  label: `language__${language.id}`,
                })),
              },
            ],
          },
        ],
      },
      {
        title: 'Contact Information',
        fields: [
          {
            path: ['contactDetails.emails'],
            component: Component.List,
            label: 'Email addresses',
            children: [
              {
                path: ['id'],
                dataType: DataType.String,
                component: Component.Hidden,
              },
              {
                path: ['contactDetailType'],
                dataType: DataType.String,
                component: Component.Hidden,
                defaultValue: ContactDetailType.Email,
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
            path: ['contactDetails.phones'],
            component: Component.List,
            label: 'Phone numbers',
            children: [
              {
                path: ['id'],
                dataType: DataType.String,
                component: Component.Hidden,
              },
              {
                path: ['contactDetailType'],
                dataType: DataType.String,
                component: Component.Hidden,
                defaultValue: ContactDetailType.PhoneNumber,
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
  list: {
    fields: [
      {
        path: ['id'],
        title: 'ID',
        isID: true,
        width: 4,
      },
      { path: ['firstName'], title: 'First Name', width: 2 },
      { path: ['lastName'], title: 'Last Name', width: 2 },
      { path: ['sex'], title: 'Sex', width: 2 },
      {
        path: ['dateOfBirth'],
        title: 'Date of Birth',
        width: 2,
        format: (date: Date) => date.toLocaleDateString(),
      },
      {
        path: ['nationalities', 0],
        title: 'Nationality',
      },
      {
        path: ['identification', 0, 'identificationNumber'],
        title: 'Primary Identification',
        width: 2,
      },
      {
        path: ['contactDetails', 'phones', 0, 'value'],
        title: 'Phone Number #1',
      },
      {
        path: ['contactDetails', 'emails', 0, 'value'],
        title: 'Email Address #1',
      },
      {
        path: ['displacementStatus'],
        title: 'Displacement Status',
      },
    ],
  },
  filtering: [
    {
      path: ['id'],
      dataType: DataType.String,
      component: Component.TextInput,
      label: 'ID',
    },
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
      label: "Mother's Name",
    },
    {
      path: ['sex'],
      dataType: DataType.String,
      component: Component.Select,
      label: 'Sex',
      options: optionsFromEnum(Sex),
    },
    {
      path: ['dateOfBirthMin'],
      dataType: DataType.Date,
      component: Component.TextInput,
      label: 'Date of Birth - Start',
    },
    {
      path: ['dateOfBirthMax'],
      dataType: DataType.Date,
      component: Component.TextInput,
      label: 'Date of Birth - End',
    },
    {
      path: ['ageMin'],
      dataType: DataType.Number,
      component: Component.TextInput,
      label: 'Age - Start',
    },
    {
      path: ['ageMax'],
      dataType: DataType.Number,
      component: Component.TextInput,
      label: 'Age - End',
    },
    {
      path: ['isMinor'],
      dataType: DataType.Boolean,
      component: Component.Checkbox,
      label: 'Is a minor',
    },
    {
      path: ['nationalities'],
      dataType: DataType.String,
      component: Component.Select,
      label: 'Nationality',
      options: [
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Spanish' },
        { value: 'fr', label: 'French' },
        { value: 'ar', label: 'Arabic' },
      ],
    },
    {
      path: ['identificationNumber'],
      dataType: DataType.String,
      component: Component.TextInput,
      label: 'Primary Identification Number',
    },
    {
      path: ['phones'],
      dataType: DataType.String,
      component: Component.TextInput,
      label: 'Phone number',
    },
    {
      path: ['emails'],
      dataType: DataType.String,
      component: Component.TextInput,
      label: 'Emails',
    },
    {
      path: ['residence'],
      dataType: DataType.String,
      component: Component.TextInput,
      label: 'Residence',
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
      path: ['hasDisabilityPwd'],
      dataType: DataType.Boolean,
      component: Component.Checkbox,
      label: 'Has PWD',
    },
    {
      path: ['hasDisabilityVision'],
      dataType: DataType.Boolean,
      component: Component.Checkbox,
      label: 'Has vision disability',
    },
    {
      path: ['hasDisabilityHearing'],
      dataType: DataType.Boolean,
      component: Component.Checkbox,
      label: 'Has hearing disability',
    },
    {
      path: ['hasDisabilityMobility'],
      dataType: DataType.Boolean,
      component: Component.Checkbox,
      label: 'Has mobility disability',
    },
    {
      path: ['hasDisabilityCognition'],
      dataType: DataType.Boolean,
      component: Component.Checkbox,
      label: 'Has cognition disability',
    },
    {
      path: ['hasDisabilitySelfcare'],
      dataType: DataType.Boolean,
      component: Component.Checkbox,
      label: 'Has selfcare disability',
    },
    {
      path: ['hasDisabilityCommunication'],
      dataType: DataType.Boolean,
      component: Component.Checkbox,
      label: 'Has communication disability',
    },
    {
      path: ['isChildAtRisk'],
      dataType: DataType.String,
      component: Component.Radio,
      label: 'Is child at risk',
      options: optionsFromEnum(YesNoUnknown),
      defaultValue: YesNoUnknown.Unknown,
    },
    {
      path: ['isElderAtRisk'],
      dataType: DataType.String,
      component: Component.Radio,
      label: 'Is elder at risk',
      options: optionsFromEnum(YesNoUnknown),
      defaultValue: YesNoUnknown.Unknown,
    },
    {
      path: ['isWomanAtRisk'],
      dataType: DataType.String,
      component: Component.Radio,
      label: 'Is woman at risk',
      options: optionsFromEnum(YesNoUnknown),
      defaultValue: YesNoUnknown.Unknown,
    },
    {
      path: ['isSeparatedChild'],
      dataType: DataType.String,
      component: Component.Radio,
      label: 'Is separated child',
      options: optionsFromEnum(YesNoUnknown),
      defaultValue: YesNoUnknown.Unknown,
    },
    {
      path: ['isSingleParent'],
      dataType: DataType.String,
      component: Component.Radio,
      label: 'Is single parent',
      options: optionsFromEnum(YesNoUnknown),
      defaultValue: YesNoUnknown.Unknown,
    },
    {
      path: ['isPregnant'],
      dataType: DataType.String,
      component: Component.Radio,
      label: 'Is pregnant',
      options: optionsFromEnum(YesNoUnknown),
      defaultValue: YesNoUnknown.Unknown,
    },
    {
      path: ['isLactating'],
      dataType: DataType.String,
      component: Component.Radio,
      label: 'Is lactating',
      options: optionsFromEnum(YesNoUnknown),
      defaultValue: YesNoUnknown.Unknown,
    },
    {
      path: ['hasMedicalCondition'],
      dataType: DataType.String,
      component: Component.Radio,
      label: 'Has medical condition',
      options: optionsFromEnum(YesNoUnknown),
      defaultValue: YesNoUnknown.Unknown,
    },
    {
      path: ['needsLegalPhysicalProtection'],
      dataType: DataType.String,
      component: Component.Radio,
      label: 'Needs legal or physical protection',
      options: optionsFromEnum(YesNoUnknown),
      defaultValue: YesNoUnknown.Unknown,
    },
  ],
});
