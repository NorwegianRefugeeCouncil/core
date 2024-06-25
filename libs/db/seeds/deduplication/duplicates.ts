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

const batchSize = 1_000;
const seedCount = 1_000;

export async function seed(knex: Knex): Promise<void> {
  await knex('duplicates').del();
  await knex('deduplication_resolutions').del();
  await knex('individual_contact_details').del();
  await knex('individual_identifications').del();
  await knex('individual_languages').del();
  await knex('individual_nationalities').del();
  await knex('individuals').del();
  await knex('entities').del();
  await knex('persons').del();

  const makeIndividual = () => {
    const individualId = ulid();
    return {
      id: individualId,
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
      address: faker.location.streetAddress(),
      contactMeansComment: faker.lorem.sentence(),
      consentGdpr: faker.datatype.boolean(),
      consentReferral: faker.datatype.boolean(),
      sex: faker.helpers.enumValue(Sex),
      preferredContactMeans: faker.helpers.enumValue(ContactMeans),
      displacementStatus: faker.helpers.enumValue(DisplacementStatus),
      engagementContext: faker.helpers.enumValue(EngagementContext),
      languages: [
        // {
        //   individualId,
        //   languageIsoCode: faker.helpers.arrayElement(['en', 'es', 'fr', 'ar']),
        // },
      ],
      nationalities: [
        // {
        //   individualId,
        //   nationalityIsoCode: faker.helpers.arrayElement([
        //     'en',
        //     'es',
        //     'fr',
        //     'ar',
        //   ]),
        // },
      ],
      contactDetails: [
        {
          id: faker.string.uuid(),
          contactDetailType: ContactDetailType.Email,
          rawValue: faker.internet.email(),
          cleanValue: faker.internet.email(),
          individualId,
        },
        {
          id: faker.string.uuid(),
          contactDetailType: ContactDetailType.Email,
          rawValue: faker.internet.email(),
          cleanValue: faker.internet.email(),
          individualId,
        },
        {
          id: faker.string.uuid(),
          contactDetailType: ContactDetailType.PhoneNumber,
          rawValue: faker.phone.number(),
          cleanValue: faker.string.numeric(),
          individualId,
        },
        {
          id: faker.string.uuid(),
          contactDetailType: ContactDetailType.PhoneNumber,
          rawValue: faker.phone.number(),
          cleanValue: faker.string.numeric(),
          individualId,
        },
      ],
      identification: [
        {
          id: faker.string.uuid(),
          individualId,
          identificationType: faker.helpers.enumValue(IdentificationType),
          identificationNumber: faker.string.uuid(),
          isPrimary: faker.datatype.boolean(),
        },
      ],
    };
  };

  for (let i = 0; i < seedCount; i += batchSize) {
    console.log(
      `Inserting batch ${i / batchSize + 1} of ${seedCount / batchSize}`,
    );

    const foo = Array.from({ length: batchSize }, () => makeIndividual());

    const {
      persons,
      entities,
      individuals,
      contactDetails,
      identification,
      languages,
      nationalities,
    } = foo.reduce<{
      persons: any[];
      entities: any[];
      individuals: any[];
      contactDetails: any[];
      identification: any[];
      languages: any[];
      nationalities: any[];
    }>(
      (acc, cur) => {
        const {
          contactDetails,
          identification,
          languages,
          nationalities,
          ...individuals
        } = cur;
        return {
          persons: [...acc.persons, { id: cur.personId }],
          entities: [...acc.entities, { id: cur.entityId }],
          individuals: [...acc.individuals, individuals],
          contactDetails: [...acc.contactDetails, ...cur.contactDetails],
          identification: [...acc.identification, ...cur.identification],
          languages: [...acc.languages, ...cur.languages],
          nationalities: [...acc.nationalities, ...cur.nationalities],
        };
      },
      {
        persons: [],
        entities: [],
        individuals: [],
        contactDetails: [],
        identification: [],
        languages: [],
        nationalities: [],
      },
    );

    if (persons.length > 0) await knex('persons').insert(persons);
    if (entities.length > 0) await knex('entities').insert(entities);
    if (individuals.length > 0) await knex('individuals').insert(individuals);
    if (contactDetails.length > 0)
      await knex('individual_contact_details').insert(contactDetails);
    if (identification.length > 0)
      await knex('individual_identifications').insert(identification);
    if (languages.length > 0)
      await knex('individual_languages').insert(languages);
    if (nationalities.length > 0)
      await knex('individual_nationalities').insert(nationalities);
  }
}
