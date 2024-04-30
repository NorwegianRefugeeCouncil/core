import { Knex } from 'knex';
import { faker } from '@faker-js/faker';
import { ulid } from 'ulidx';

enum Sex {
  Male = 'male',
  Female = 'female',
  Other = 'other',
  PreferNotToAnswer = 'prefer_not_to_answer',
}

enum ContactMeans {
  Phone = 'phone',
  Whatsapp = 'whatsapp',
  Email = 'email',
  Visit = 'visit',
  Other = 'other',
}

enum ContactDetailType {
  Email = 'email',
  PhoneNumber = 'phone_number',
}

enum IdentificationType {
  UnhcrId = 'unhcr_id',
  Passport = 'passport',
  NationalId = 'national_id',
  Other = 'other',
}

enum DisplacementStatus {
  Idp = 'idp',
  Refugee = 'refugee',
  HostCommunity = 'host_community',
  Returnee = 'returnee',
  NonDisplaced = 'non_displaced',
  AsylumSeeker = 'asylum_seeker',
  Other = 'other',
}

enum EngagementContext {
  HouseVisit = 'house_visit',
  FieldActivity = 'field_activity',
  Referred = 'referred',
  InOfficeMeeting = 'in_office_meeting',
  RemoteChannels = 'remote_channels',
}

enum DisabilityLevel {
  One = '1',
  Two = '2',
  Three = '3',
  Four = '4',
}

enum YesNoUnknown {
  Yes = 'yes',
  No = 'no',
  Unknown = 'unknown',
}

const batchSize = 100;
const seedCount = 1_000;

export async function seed(knex: Knex): Promise<void> {
  await knex('duplicates').del();
  await knex('deduplication_resolutions').del();
  await knex('participant_disabilities').del();
  await knex('participant_contact_details').del();
  await knex('participant_identifications').del();
  await knex('participant_languages').del();
  await knex('participant_nationalities').del();
  await knex('participants').del();
  await knex('entities').del();
  await knex('persons').del();

  const makeParticipant = () => {
    const participantId = ulid();
    return {
      id: participantId,
      personId: ulid(),
      entityId: ulid(),
      firstName: faker.person.firstName(),
      middleName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      nativeName: faker.person.firstName(),
      motherName: faker.person.lastName(),
      preferredName: faker.person.firstName(),
      dateOfBirth: faker.date.past(),
      nrcId: faker.string.uuid(),
      residence: faker.location.streetAddress(),
      contactMeansComment: faker.lorem.sentence(),
      consentGdpr: faker.datatype.boolean(),
      consentReferral: faker.datatype.boolean(),
      sex: faker.helpers.enumValue(Sex),
      preferredContactMeans: faker.helpers.enumValue(ContactMeans),
      displacementStatus: faker.helpers.enumValue(DisplacementStatus),
      engagementContext: faker.helpers.enumValue(EngagementContext),
      disabilities: {
        participantId,
        hasDisabilityPwd: faker.datatype.boolean(),
        disabilityPwdComment: faker.lorem.sentence(),
        hasDisabilityVision: faker.datatype.boolean(),
        disabilityVisionLevel: faker.helpers.enumValue(DisabilityLevel),
        hasDisabilityHearing: faker.datatype.boolean(),
        disabilityHearingLevel: faker.helpers.enumValue(DisabilityLevel),
        hasDisabilityMobility: faker.datatype.boolean(),
        disabilityMobilityLevel: faker.helpers.enumValue(DisabilityLevel),
        hasDisabilityCognition: faker.datatype.boolean(),
        disabilityCognitionLevel: faker.helpers.enumValue(DisabilityLevel),
        hasDisabilitySelfcare: faker.datatype.boolean(),
        disabilitySelfcareLevel: faker.helpers.enumValue(DisabilityLevel),
        hasDisabilityCommunication: faker.datatype.boolean(),
        disabilityCommunicationLevel: faker.helpers.enumValue(DisabilityLevel),
        isChildAtRisk: faker.helpers.enumValue(YesNoUnknown),
        isElderAtRisk: faker.helpers.enumValue(YesNoUnknown),
        isWomanAtRisk: faker.helpers.enumValue(YesNoUnknown),
        isSingleParent: faker.helpers.enumValue(YesNoUnknown),
        isSeparatedChild: faker.helpers.enumValue(YesNoUnknown),
        isPregnant: faker.helpers.enumValue(YesNoUnknown),
        isLactating: faker.helpers.enumValue(YesNoUnknown),
        hasMedicalCondition: faker.helpers.enumValue(YesNoUnknown),
        needsLegalPhysicalProtection: faker.helpers.enumValue(YesNoUnknown),
        vulnerabilityComments: faker.lorem.sentence(),
      },
      languages: [
        {
          participantId,
          languageIsoCode: faker.helpers.arrayElement(['en', 'es', 'fr', 'ar']),
        },
      ],
      nationalities: [
        {
          participantId,
          nationalityIsoCode: faker.helpers.arrayElement([
            'en',
            'es',
            'fr',
            'ar',
          ]),
        },
      ],
      contactDetails: [
        {
          id: faker.string.uuid(),
          contactDetailType: faker.helpers.enumValue(ContactDetailType),
          rawValue: faker.phone.number(),
          cleanValue: faker.string.numeric(),
          participantId,
        },
      ],
      identification: [
        {
          id: faker.string.uuid(),
          participantId,
          identificationType: faker.helpers.enumValue(IdentificationType),
          identificationNumber: faker.string.uuid(),
          isPrimary: faker.datatype.boolean(),
        },
      ],
    };
  };

  for (let i = 0; i < seedCount; i += batchSize) {
    const foo = Array.from({ length: batchSize }, () => makeParticipant());

    const {
      persons,
      entities,
      participants,
      disabilities,
      contactDetails,
      identification,
      languages,
      nationalities,
    } = foo.reduce<{
      persons: any[];
      entities: any[];
      participants: any[];
      disabilities: any[];
      contactDetails: any[];
      identification: any[];
      languages: any[];
      nationalities: any[];
    }>(
      (acc, cur) => {
        const {
          disabilities,
          contactDetails,
          identification,
          languages,
          nationalities,
          ...participants
        } = cur;
        return {
          persons: [...acc.persons, { id: cur.personId }],
          entities: [...acc.entities, { id: cur.entityId }],
          participants: [...acc.participants, participants],
          disabilities: [...acc.disabilities, cur.disabilities],
          contactDetails: [...acc.contactDetails, ...cur.contactDetails],
          identification: [...acc.identification, ...cur.identification],
          languages: [...acc.languages, ...cur.languages],
          nationalities: [...acc.nationalities, ...cur.nationalities],
        };
      },
      {
        persons: [],
        entities: [],
        participants: [],
        disabilities: [],
        contactDetails: [],
        identification: [],
        languages: [],
        nationalities: [],
      },
    );

    await knex('persons').insert(persons);
    await knex('entities').insert(entities);
    await knex('participants').insert(participants);
    await knex('participant_disabilities').insert(disabilities);
    await knex('participant_contact_details').insert(contactDetails);
    await knex('participant_identifications').insert(identification);
    await knex('participant_languages').insert(languages);
    await knex('participant_nationalities').insert(nationalities);
  }
}
