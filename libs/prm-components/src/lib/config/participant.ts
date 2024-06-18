import {
  ContactDetailType,
  ContactMeans,
  DisplacementStatus,
  EngagementContext,
  IdentificationType,
  Sex,
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
          },
          {
            path: ['consentReferral'],
            dataType: DataType.Boolean,
            component: Component.Checkbox,
            label: 'Consent Referral',
          },
        ],
      },
      {
        title: 'Identification',
        fields: [
          {
            path: ['id'],
            dataType: DataType.String,
            component: Component.Display,
            label: 'ID',
          },
          {
            path: ['prefersToRemainAnonymous'],
            dataType: DataType.Boolean,
            component: Component.Checkbox,
            label: 'Prefers to Remain Anonymous',
          },
          {
            path: ['firstName'],
            dataType: DataType.String,
            component: Component.TextInput,
            label: 'First Name',
          },
          {
            path: ['lastName'],
            dataType: DataType.String,
            component: Component.TextInput,
            label: 'Last Name',
          },
          {
            path: ['middleName'],
            dataType: DataType.String,
            component: Component.TextInput,
            label: 'Middle Name',
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
            path: ['sex'],
            dataType: DataType.String,
            component: Component.Select,
            label: 'Sex',
            options: optionsFromEnum(Sex),
          },
          {
            path: ['dateOfBirth'],
            dataType: DataType.Date,
            component: Component.TextInput,
            label: 'Date of Birth',
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
          {
            path: ['preferredLanguage'],
            dataType: DataType.String,
            component: Component.Select,
            label: 'Preferred Language',
            options: staticData.languages.map((language) => ({
              value: language.id,
              label: `language__${language.id}`,
            })), // TODO: make this a subset including only selected languages - CORE24-360
          },
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
            ],
          },
          {
            path: ['nrcId'],
            dataType: DataType.String,
            component: Component.TextInput,
            label: 'NRC ID',
          },
        ],
      },
      {
        title: 'Contact Information',
        fields: [
          {
            path: ['residence'],
            dataType: DataType.String,
            component: Component.TextArea,
            label: 'Residence',
          },
          {
            path: ['phones'],
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
          {
            path: ['emails'],
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
            path: ['preferredContactMeans'],
            dataType: DataType.String,
            component: Component.Select,
            label: 'Preferred Contact Means',
            options: optionsFromEnum(ContactMeans),
          },
          {
            path: ['contactMeansComment'],
            dataType: DataType.String,
            component: Component.TextArea,
            label: 'Contact Means Comment',
          },
        ],
      },
      {
        title: 'Protection',
        fields: [
          {
            path: ['displacementStatus'],
            dataType: DataType.String,
            component: Component.Select,
            label: 'Displacement Status',
            options: optionsFromEnum(DisplacementStatus),
          },
        ],
      },
      {
        title: 'Data collection',
        fields: [
          {
            path: ['engagementContext'],
            dataType: DataType.String,
            component: Component.Select,
            label: 'Engagement Context',
            options: optionsFromEnum(EngagementContext),
          },
          {
            path: ['dateOfRegistration'],
            dataType: DataType.Date,
            component: Component.TextInput,
            label: 'Date of Registration',
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
        path: ['phones', 0, 'value'],
        title: 'Phone Number #1',
      },
      {
        path: ['emails', 0, 'value'],
        title: 'Email Address #1',
      },
      {
        path: ['displacementStatus'],
        title: 'Displacement Status',
      },
    ],
  },
  filtering: {
    fields: [
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
        path: ['nationalities'],
        dataType: DataType.String,
        component: Component.Select,
        options: staticData.nationalities.map((nationality) => ({
          value: nationality.id,
          label: `nationality__${nationality.id}`,
        })),
        label: 'Nationality',
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
    ],
  },
});
