import { snakeCase } from 'lodash';
import { ulid } from 'ulidx';
import { z } from 'zod';
import { Knex } from 'knex';

import {
  ContactDetailType,
  EntityType,
  Pagination,
  Individual,
  IndividualDefinition,
  IndividualFiltering,
  IndividualListItem,
  IndividualListItemSchema,
  IndividualPartialUpdate,
  IndividualSchema,
  Sorting,
  createSortingSchema,
} from '@nrcno/core-models';
import { PostgresError, PostgresErrorCode, getDb } from '@nrcno/core-db';
import { AlreadyExistsError, NotFoundError } from '@nrcno/core-errors';

import { BaseStore } from './base.store';

const buildListQueryFilters = (filtering: IndividualFiltering) => {
  const equalityProperties: Array<keyof IndividualFiltering> = [
    'id',
    'firstName',
    'lastName',
    'middleName',
    'nativeName',
    'motherName',
    'sex',
    'address',
    'displacementStatus',
    'engagementContext',
  ];
  const propertyMapping: Partial<Record<keyof IndividualFiltering, string>> = {
    id: 'individuals.id',
  };
  const equalityFilters: Partial<IndividualFiltering> =
    equalityProperties.reduce(
      (obj, key) =>
        filtering[key]
          ? { ...obj, [propertyMapping[key] || key]: filtering[key] }
          : obj,
      {},
    );

  const applyAdditionalFilters = (builder: Knex.QueryBuilder) => {
    if (filtering.dateOfBirthMin) {
      builder.where('dateOfBirth', '>=', filtering.dateOfBirthMin);
    }
    if (filtering.dateOfBirthMax) {
      builder.where('dateOfBirth', '<=', filtering.dateOfBirthMax);
    }
    if (filtering.nationalities) {
      builder.whereRaw('? = ANY (nationalities.all_nationalities)', [
        filtering.nationalities,
      ]);
    }
    if (filtering.phones) {
      builder.whereRaw('? = ANY (phones.all_phones)', [filtering.phones]);
    }
    if (filtering.emails) {
      builder.whereRaw('? = ANY (emails.all_emails)', [filtering.emails]);
    }
    if (filtering.identificationNumber) {
      builder.whereRaw('? = ANY (identifications.all_identification_numbers)', [
        filtering.identificationNumber,
      ]);
    }
  };

  return { equalityFilters, applyAdditionalFilters };
};

const buildListQueryJoins = (db: Knex) => {
  const nationalitiesSubquery = db('individual_nationalities')
    .select(
      'individualId',
      db.raw(`
        (array_agg(nationality_iso_code ORDER BY created_at ASC))[1] as main_nationality,
        array_agg(nationality_iso_code) as all_nationalities
        `),
    )
    .groupBy('individualId')
    .as('nationalities');

  const phonesSubquery = db
    .select(
      'individualId',
      db.raw(`
        phone_details->>'id' as first_phone_id,
        phone_details->>'value' as first_phone_value
      `),
      'allPhones',
    )
    .from(
      db('individual_contact_details')
        .select(
          'individualId',
          db.raw(
            `
            (array_agg(
              json_build_object(
                'id', id,
                'value', clean_value
              ) ORDER BY created_at ASC
            ))[1] as phone_details,
            array_agg(clean_value) as all_phones`,
          ),
        )
        .where('contactDetailType', ContactDetailType.PhoneNumber)
        .groupBy('individualId')
        .as('phones_agg'),
    )
    .as('phones');

  const emailsSubquery = db
    .select(
      'individualId',
      db.raw(`
        email_details->>'id' as first_email_id,
        email_details->>'value' as first_email_value
      `),
      'allEmails',
    )
    .from(
      db('individual_contact_details')
        .select(
          'individualId',
          db.raw(
            `
            (array_agg(
              json_build_object(
                'id', id,
                'value', clean_value
              ) ORDER BY created_at ASC
            ))[1] as email_details,
            array_agg(clean_value) as all_emails`,
          ),
        )
        .where('contactDetailType', ContactDetailType.Email)
        .groupBy('individualId')
        .as('emails_agg'),
    )
    .as('emails');

  const identificationsSubquery = db('individual_identifications')
    .select(
      'individualId',
      db.raw(`
        (array_agg(
          json_build_object(
            'id', id,
            'identification_type', identification_type,
            'identification_number', identification_number
          ) ORDER BY created_at ASC
        ))[1] as first_identification,
        array_agg(identification_number) as all_identification_numbers
        `),
    )
    .groupBy('individualId')
    .as('identifications');

  const applyJoins = (query: Knex.QueryBuilder) => {
    query
      .leftJoin(
        identificationsSubquery,
        'individuals.id',
        'identifications.individualId',
      )
      .leftJoin(
        nationalitiesSubquery,
        'individuals.id',
        'nationalities.individualId',
      )
      .leftJoin(phonesSubquery, 'individuals.id', 'phones.individualId')
      .leftJoin(emailsSubquery, 'individuals.id', 'emails.individualId');
  };

  return { applyJoins };
};

export type IIndividualStore = BaseStore<
  IndividualDefinition,
  Individual,
  IndividualPartialUpdate,
  IndividualListItem,
  IndividualFiltering
>;

const count: IIndividualStore['count'] = async (
  filtering: IndividualFiltering = {},
): Promise<number> => {
  const db = getDb();

  const { equalityFilters, applyAdditionalFilters } =
    buildListQueryFilters(filtering);
  const { applyJoins } = buildListQueryJoins(db);

  const [{ count }] = await db('individuals')
    .count()
    .where(equalityFilters)
    .andWhere(applyAdditionalFilters)
    .modify(applyJoins);

  return typeof count === 'string' ? parseInt(count, 10) : count;
};

const create: IIndividualStore['create'] = async (
  individualDefinition: IndividualDefinition,
): Promise<Individual> => {
  const db = getDb();

  const {
    emails,
    phones,
    identification,
    languages,
    nationalities,
    ...individualDetails
  } = individualDefinition;

  const personId = ulid();
  const entityId = ulid();
  const individualId = ulid();

  const result = await db.transaction(async (trx) => {
    try {
      await trx('persons').insert({ id: personId });

      await trx('entities').insert({ id: entityId });

      await trx('individuals').insert({
        ...individualDetails,
        id: individualId,
        personId,
        entityId,
      });

      if (languages && languages.length > 0) {
        await trx('individual_languages').insert(
          languages.map((lang) => ({
            languageIsoCode: lang,
            individualId,
          })),
        );
      }

      if (nationalities && nationalities.length > 0) {
        await trx('individual_nationalities').insert(
          nationalities.map((nat) => ({
            nationalityIsoCode: nat,
            individualId,
          })),
        );
      }

      const contactDetailsEmailsForDb =
        emails.length > 0
          ? emails.map((email) => ({
              id: ulid(),
              contactDetailType: ContactDetailType.Email,
              rawValue: email.value,
              cleanValue: email.value, // TODO: Clean string for searching
              individualId,
            }))
          : [];

      const contactDetailsPhonesForDb =
        phones.length > 0
          ? phones.map((phone) => ({
              id: ulid(),
              contactDetailType: ContactDetailType.PhoneNumber,
              rawValue: phone.value,
              cleanValue: phone.value, // TODO: Clean string for searching
              individualId,
            }))
          : [];
      const contactDetailsForDb = contactDetailsEmailsForDb.concat(
        contactDetailsPhonesForDb,
      );
      if (contactDetailsForDb.length > 0) {
        await trx('individual_contact_details').insert(contactDetailsForDb);
      }

      const identificationForDb =
        identification && identification.length > 0
          ? identification.map((id) => ({
              ...id,
              id: ulid(),
              individualId,
            }))
          : [];
      if (identificationForDb.length > 0) {
        await trx('individual_identifications').insert(identificationForDb);
      }

      const createdIndividual = IndividualSchema.safeParse({
        ...individualDetails,
        id: individualId,
        personId,
        entityId,
        languages,
        nationalities,
        emails: contactDetailsEmailsForDb.map((contact) => ({
          id: contact.id,
          value: contact.rawValue,
        })),
        phones: contactDetailsPhonesForDb.map((contact) => ({
          id: contact.id,
          value: contact.rawValue,
        })),
        identification: identificationForDb,
      });

      if (createdIndividual.error) {
        throw new Error(
          `Corrupt data in database for individuals: ${createdIndividual.error.errors.join(', ')}`,
        );
      }
      return createdIndividual.data;
    } catch (error) {
      if ((error as PostgresError).code === PostgresErrorCode.UniqueViolation) {
        throw new AlreadyExistsError('Individual already exists');
      }
      throw error;
    }
  });

  return result;
};

const get: IIndividualStore['get'] = async (
  id: string,
): Promise<Individual | null> => {
  const db = getDb();

  const individual = await db('individuals').where('id', id).first();

  if (!individual) {
    return null;
  }

  const [languages, nationalities, contactDetails, identifications] =
    await Promise.all([
      db('individual_languages')
        .where('individualId', id)
        .select('languageIsoCode'),
      db('individual_nationalities')
        .where('individualId', id)
        .select('nationalityIsoCode'),
      db('individual_contact_details')
        .where('individualId', id)
        .select('id', 'contactDetailType', 'rawValue'),
      db('individual_identifications')
        .where('individualId', id)
        .select('id', 'identificationType', 'identificationNumber'),
    ]);

  const individualResult = IndividualSchema.safeParse({
    ...individual,
    languages: languages.map((lang) => lang.languageIsoCode),
    nationalities: nationalities.map((nat) => nat.nationalityIsoCode),
    emails: contactDetails
      .filter(
        (contactDetail) =>
          contactDetail.contactDetailType === ContactDetailType.Email,
      )
      .map((contactDetail) => ({
        id: contactDetail.id,
        value: contactDetail.rawValue,
      })),
    phones: contactDetails
      .filter(
        (contactDetail) =>
          contactDetail.contactDetailType === ContactDetailType.PhoneNumber,
      )
      .map((contactDetail) => ({
        id: contactDetail.id,
        value: contactDetail.rawValue,
      })),
    identification: identifications,
  });

  if (individualResult.error) {
    throw new Error(
      `Corrupt data in database for individuals: ${individualResult.error.errors.join(', ')}`,
    );
  }
  return individualResult.data;
};

const list: IIndividualStore['list'] = async (
  pagination: Pagination,
  { sort, direction }: Sorting = createSortingSchema(
    EntityType.Individual,
  ).parse({}),
  filtering: IndividualFiltering = {},
): Promise<IndividualListItem[]> => {
  const db = getDb();

  const { equalityFilters, applyAdditionalFilters } =
    buildListQueryFilters(filtering);
  const { applyJoins } = buildListQueryJoins(db);

  let sortColumn: string;
  switch (sort) {
    case 'id':
      sortColumn = 'individuals.id';
      break;
    case 'nationalities':
      sortColumn = `main_nationality`;
      break;
    case 'emails':
      sortColumn = `first_email_value`;
      break;
    case 'phones':
      sortColumn = `first_phone_value`;
      break;
    case 'identificationNumber':
      sortColumn = `first_identification->>'identification_number'`;
      break;
    default:
      sortColumn = snakeCase(sort);
  }

  const individualFields = [
    'individuals.id',
    'firstName',
    'lastName',
    'sex',
    'dateOfBirth',
    'displacementStatus',
  ];

  interface IndividualListItemRaw {
    id: string;
    firstName: string | null;
    lastName: string | null;
    sex: string | null;
    dateOfBirth: Date | null;
    displacementStatus: string | null;
    identificationId: string | null;
    identificationType: string | null;
    identificationNumber: string | null;
    mainNationality: string | null;
    firstPhoneId: string | null;
    firstPhoneValue: string | null;
    firstEmailId: string | null;
    firstEmailValue: string | null;
  }

  const individuals: IndividualListItemRaw[] = await db('individuals')
    .select([
      ...individualFields,
      db.raw(
        `identifications.first_identification->>'id' as identification_id`,
      ),
      db.raw(
        `identifications.first_identification->>'identification_type' as identification_type`,
      ),
      db.raw(
        `identifications.first_identification->>'identification_number' as identification_number`,
      ),
      'nationalities.mainNationality',
      'phones.firstPhoneId',
      'phones.firstPhoneValue',
      'emails.firstEmailId',
      'emails.firstEmailValue',
    ])
    .where(equalityFilters)
    .andWhere(applyAdditionalFilters)
    .modify(applyJoins)
    .limit(pagination.pageSize)
    .offset(pagination.startIndex)
    .orderByRaw(`${sortColumn} ${direction}`);

  const result = z.array(IndividualListItemSchema).safeParse(
    individuals.map((individual) => ({
      ...individual,
      identification: individual.identificationId
        ? [
            {
              id: individual.identificationId,
              identificationType: individual.identificationType,
              identificationNumber: individual.identificationNumber,
            },
          ]
        : [],
      nationalities: individual.mainNationality
        ? [individual.mainNationality]
        : [],
      emails: individual.firstEmailId
        ? [
            {
              id: individual.firstEmailId,
              value: individual.firstEmailValue,
            },
          ]
        : [],
      phones: individual.firstPhoneId
        ? [
            {
              id: individual.firstPhoneId,
              value: individual.firstPhoneValue,
            },
          ]
        : [],
    })),
  );

  if (result.error) {
    throw new Error(
      `Corrupt data in database for individuals: ${result.error.errors.join(', ')}`,
    );
  }
  return result.data;
};

const update: IIndividualStore['update'] = async (
  individualId: string,
  individualUpdate: IndividualPartialUpdate,
): Promise<Individual> => {
  const db = getDb();

  const {
    emails,
    phones,
    identification,
    languages,
    nationalities,
    ...individualDetails
  } = individualUpdate;

  await db.transaction(async (trx) => {
    if (Object.keys(individualDetails).length > 0) {
      await trx('individuals')
        .update({
          ...individualDetails,
        })
        .where('id', individualId);
    }

    if (languages?.add && languages.add.length > 0) {
      await trx('individual_languages').insert(
        languages.add.map((lang) => ({
          languageIsoCode: lang,
          individualId,
        })),
      );
    }
    if (languages?.remove && languages?.remove?.length > 0) {
      await trx('individual_languages')
        .whereIn('languageIsoCode', languages.remove)
        .where('individualId', individualId)
        .del();
    }

    if (nationalities?.add && nationalities?.add?.length > 0) {
      await trx('individual_nationalities').insert(
        nationalities.add.map((nat) => ({
          nationalityIsoCode: nat,
          individualId,
        })),
      );
    }
    if (nationalities?.remove && nationalities?.remove?.length > 0) {
      await trx('individual_nationalities')
        .whereIn('nationalityIsoCode', nationalities.remove)
        .where('individualId', individualId)
        .del();
    }

    const phonesToAdd =
      phones?.add?.map((contact) => ({
        id: ulid(),
        contactDetailType: ContactDetailType.PhoneNumber,
        rawValue: contact.value,
        cleanValue: contact.value, // TODO: Clean string for searching
        individualId,
      })) || [];
    const emailsToAdd =
      emails?.add?.map((contact) => ({
        id: ulid(),
        contactDetailType: ContactDetailType.Email,
        rawValue: contact.value,
        cleanValue: contact.value, // TODO: Clean string for searching
        individualId,
      })) || [];
    const contactDetailsToAdd = phonesToAdd.concat(emailsToAdd);
    if (contactDetailsToAdd.length > 0) {
      await trx('individual_contact_details').insert(contactDetailsToAdd);
    }

    const phonesToUpdate =
      phones?.update?.map((contact) => ({
        id: contact.id,
        contactDetailType: ContactDetailType.PhoneNumber,
        rawValue: contact.value,
        cleanValue: contact.value, // TODO: Clean string for searching
        individualId,
      })) || [];
    const emailsToUpdate =
      emails?.update?.map((contact) => ({
        id: contact.id,
        contactDetailType: ContactDetailType.Email,
        rawValue: contact.value,
        cleanValue: contact.value, // TODO: Clean string for searching
        individualId,
      })) || [];
    const contactDetailsToUpdate = phonesToUpdate.concat(emailsToUpdate);
    if (contactDetailsToUpdate.length > 0) {
      for (const detail of contactDetailsToUpdate) {
        await trx('individual_contact_details')
          .update({
            contactDetailType: detail.contactDetailType,
            rawValue: detail.rawValue,
            cleanValue: detail.cleanValue,
          })
          .where('individualId', detail.individualId)
          .where('id', detail.id);
      }
    }

    const phonesToRemove = phones?.remove || [];
    const emailsToRemove = emails?.remove || [];
    const contactDetailsToRemove = phonesToRemove.concat(emailsToRemove);
    if (contactDetailsToRemove.length > 0) {
      await trx('individual_contact_details')
        .whereIn('id', contactDetailsToRemove)
        .del();
    }

    const identificationsToAdd =
      identification?.add?.map((identification) => ({
        ...identification,
        id: ulid(),
        individualId,
      })) || [];
    if (identificationsToAdd.length > 0) {
      await trx('individual_identifications').insert(identificationsToAdd);
    }
    const identificationsToUpdate =
      identification?.update?.map((identification) => ({
        ...identification,
        individualId,
      })) || [];
    if (identificationsToUpdate.length > 0) {
      for (const identification of identificationsToUpdate) {
        await trx('individual_identifications')
          .update({
            identificationType: identification.identificationType,
            identificationNumber: identification.identificationNumber,
          })
          .where('individualId', identification.individualId)
          .where('id', identification.id);
      }
    }
    if (identification?.remove && identification?.remove?.length > 0) {
      await trx('individual_identifications')
        .whereIn('id', identification.remove)
        .del();
    }
  });

  const updatedIndividual = await get(individualId);

  if (!updatedIndividual) {
    throw new NotFoundError('Individual that was updated not found');
  }

  return updatedIndividual;
};

export const IndividualStore: IIndividualStore = {
  count,
  create,
  get,
  list,
  update,
};
