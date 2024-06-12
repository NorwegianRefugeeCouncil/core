import { snakeCase } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { ulid } from 'ulidx';
import { z } from 'zod';
import { Knex } from 'knex';

import {
  ContactDetailType,
  EntityType,
  Pagination,
  Participant,
  ParticipantDefinition,
  ParticipantFiltering,
  ParticipantListItem,
  ParticipantListItemSchema,
  ParticipantPartialUpdate,
  ParticipantSchema,
  Sorting,
  createSortingSchema,
} from '@nrcno/core-models';
import { PostgresError, PostgresErrorCode, getDb } from '@nrcno/core-db';
import { AlreadyExistsError, NotFoundError } from '@nrcno/core-errors';

import { BaseStore } from './base.store';

const buildListQueryFilters = (filtering: ParticipantFiltering) => {
  const equalityProperties: Array<keyof ParticipantFiltering> = [
    'id',
    'firstName',
    'lastName',
    'middleName',
    'nativeName',
    'motherName',
    'sex',
    'residence',
    'displacementStatus',
    'engagementContext',
  ];
  const propertyMapping: Partial<Record<keyof ParticipantFiltering, string>> = {
    id: 'participants.id',
  };
  const equalityFilters: Partial<ParticipantFiltering> =
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
      builder.whereRaw(
        '? = ANY (all_identifications.all_identification_numbers)',
        [filtering.identificationNumber],
      );
    }
  };

  return { equalityFilters, applyAdditionalFilters };
};

const buildListQueryJoins = (db: Knex) => {
  const nationalitiesSubquery = db('participant_nationalities')
    .select(
      'participantId',
      db.raw(`
        (array_agg(nationality_iso_code ORDER BY created_at ASC))[1] as main_nationality,
        array_agg(nationality_iso_code) as all_nationalities
        `),
    )
    .groupBy('participantId')
    .as('nationalities');

  const phonesSubquery = db
    .select(
      'participantId',
      db.raw(`
        phone_details->>'id' as first_phone_id,
        phone_details->>'value' as first_phone_value
      `),
      'allPhones',
    )
    .from(
      db('participant_contact_details')
        .select(
          'participantId',
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
        .groupBy('participantId')
        .as('phones_agg'),
    )
    .as('phones');

  const emailsSubquery = db
    .select(
      'participantId',
      db.raw(`
        email_details->>'id' as first_email_id,
        email_details->>'value' as first_email_value
      `),
      'allEmails',
    )
    .from(
      db('participant_contact_details')
        .select(
          'participantId',
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
        .groupBy('participantId')
        .as('emails_agg'),
    )
    .as('emails');

  const allIdentificationsSubquery = db('participant_identifications')
    .select(
      'participantId',
      db.raw(
        '(array_agg(identification_number)) as all_identification_numbers',
      ),
    )
    .groupBy('participantId')
    .as('all_identifications');

  const applyJoins = (query: Knex.QueryBuilder) => {
    query
      .leftJoin('participant_identifications', function () {
        this.on(
          'participants.id',
          '=',
          'participant_identifications.participantId',
        ).andOn(
          'participant_identifications.isPrimary',
          '=',
          db.raw('?', [true]),
        );
      })
      .leftJoin(
        allIdentificationsSubquery,
        'participants.id',
        'all_identifications.participantId',
      )
      .leftJoin(
        nationalitiesSubquery,
        'participants.id',
        'nationalities.participantId',
      )
      .leftJoin(phonesSubquery, 'participants.id', 'phones.participantId')
      .leftJoin(emailsSubquery, 'participants.id', 'emails.participantId');
  };

  return { applyJoins };
};

export type IParticipantStore = BaseStore<
  ParticipantDefinition,
  Participant,
  ParticipantPartialUpdate,
  ParticipantListItem,
  ParticipantFiltering
>;

const count: IParticipantStore['count'] = async (
  filtering: ParticipantFiltering = {},
): Promise<number> => {
  const db = getDb();

  const { equalityFilters, applyAdditionalFilters } =
    buildListQueryFilters(filtering);
  const { applyJoins } = buildListQueryJoins(db);

  const [{ count }] = await db('participants')
    .count()
    .where(equalityFilters)
    .andWhere(applyAdditionalFilters)
    .modify(applyJoins);

  return typeof count === 'string' ? parseInt(count, 10) : count;
};

const create: IParticipantStore['create'] = async (
  participantDefinition: ParticipantDefinition,
): Promise<Participant> => {
  const db = getDb();

  const {
    contactDetails,
    identification,
    languages,
    nationalities,
    ...participantDetails
  } = participantDefinition;

  const personId = ulid();
  const entityId = ulid();
  const participantId = ulid();

  const result = await db.transaction(async (trx) => {
    try {
      await trx('persons').insert({ id: personId });

      await trx('entities').insert({ id: entityId });

      await trx('participants').insert({
        ...participantDetails,
        id: participantId,
        personId,
        entityId,
      });

      if (languages && languages.length > 0) {
        await trx('participant_languages').insert(
          languages.map((lang) => ({
            languageIsoCode: lang,
            participantId,
          })),
        );
      }

      if (nationalities && nationalities.length > 0) {
        await trx('participant_nationalities').insert(
          nationalities.map((nat) => ({
            nationalityIsoCode: nat,
            participantId,
          })),
        );
      }

      const contactDetailsEmailsForDb =
        contactDetails && contactDetails.emails.length > 0
          ? contactDetails.emails.map((email) => ({
              id: uuidv4(),
              contactDetailType: ContactDetailType.Email,
              rawValue: email.value,
              cleanValue: email.value, // TODO: Clean string for searching
              participantId,
            }))
          : [];

      const contactDetailsPhonesForDb =
        contactDetails && contactDetails.phones.length > 0
          ? contactDetails.phones.map((phone) => ({
              id: uuidv4(),
              contactDetailType: ContactDetailType.PhoneNumber,
              rawValue: phone.value,
              cleanValue: phone.value, // TODO: Clean string for searching
              participantId,
            }))
          : [];
      const contactDetailsForDb = contactDetailsEmailsForDb.concat(
        contactDetailsPhonesForDb,
      );
      if (contactDetailsForDb.length > 0) {
        await trx('participant_contact_details').insert(contactDetailsForDb);
      }

      const identificationForDb =
        identification && identification.length > 0
          ? identification.map((id) => ({
              ...id,
              id: uuidv4(),
              participantId,
            }))
          : [];
      if (identificationForDb.length > 0) {
        await trx('participant_identifications').insert(identificationForDb);
      }

      const createdParticipant = ParticipantSchema.safeParse({
        ...participantDetails,
        id: participantId,
        personId,
        entityId,
        languages,
        nationalities,
        contactDetails: {
          emails: contactDetailsEmailsForDb.map((contact) => ({
            id: contact.id,
            value: contact.rawValue,
          })),
          phones: contactDetailsPhonesForDb.map((contact) => ({
            id: contact.id,
            value: contact.rawValue,
          })),
        },
        identification: identificationForDb,
      });

      if (createdParticipant.error) {
        throw new Error(
          `Corrupt data in database for individuals: ${createdParticipant.error.errors.join(', ')}`,
        );
      }
      return createdParticipant.data;
    } catch (error) {
      if ((error as PostgresError).code === PostgresErrorCode.UniqueViolation) {
        throw new AlreadyExistsError('Participant already exists');
      }
      throw error;
    }
  });

  return result;
};

const get: IParticipantStore['get'] = async (
  id: string,
): Promise<Participant | null> => {
  const db = getDb();

  const participant = await db('participants').where('id', id).first();

  if (!participant) {
    return null;
  }

  const [languages, nationalities, contactDetails, identifications] =
    await Promise.all([
      db('participant_languages')
        .where('participantId', id)
        .select('languageIsoCode'),
      db('participant_nationalities')
        .where('participantId', id)
        .select('nationalityIsoCode'),
      db('participant_contact_details')
        .where('participantId', id)
        .select('id', 'contactDetailType', 'rawValue'),
      db('participant_identifications')
        .where('participantId', id)
        .select(
          'id',
          'identificationType',
          'identificationNumber',
          'isPrimary',
        ),
    ]);

  const participantResult = ParticipantSchema.safeParse({
    ...participant,
    languages: languages.map((lang) => lang.languageIsoCode),
    nationalities: nationalities.map((nat) => nat.nationalityIsoCode),
    contactDetails: {
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
    },
    identification: identifications,
  });

  if (participantResult.error) {
    throw new Error(
      `Corrupt data in database for individuals: ${participantResult.error.errors.join(', ')}`,
    );
  }
  return participantResult.data;
};

const list: IParticipantStore['list'] = async (
  pagination: Pagination,
  { sort, direction }: Sorting = createSortingSchema(
    EntityType.Participant,
  ).parse({}),
  filtering: ParticipantFiltering = {},
): Promise<ParticipantListItem[]> => {
  const db = getDb();

  const { equalityFilters, applyAdditionalFilters } =
    buildListQueryFilters(filtering);
  const { applyJoins } = buildListQueryJoins(db);

  const sortColumn = sort === 'id' ? 'participants.id' : snakeCase(sort);

  const participantFields = [
    'participants.id',
    'firstName',
    'lastName',
    'sex',
    'dateOfBirth',
    'displacementStatus',
  ];
  const identificationFields = [
    'participant_identifications.id as identificationId',
    'identificationType',
    'identificationNumber',
  ];

  interface ParticipantListItemRaw {
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

  const participants: ParticipantListItemRaw[] = await db('participants')
    .select([
      ...participantFields,
      ...identificationFields,
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
    .offset(pagination.startIndex).orderByRaw(`
  CASE WHEN '${sortColumn}' = 'nationalities' THEN main_nationality END ${direction},
  CASE WHEN '${sortColumn}' = 'emails' THEN first_email_value END ${direction},
  CASE WHEN '${sortColumn}' = 'phones' THEN first_phone_value END ${direction},
  CASE WHEN '${sortColumn}' NOT IN ('nationalities', 'emails', 'phones') THEN ${sortColumn} END ${direction}
`);

  const result = z.array(ParticipantListItemSchema).safeParse(
    participants.map((participant) => ({
      ...participant,
      identification: participant.identificationId
        ? [
            {
              id: participant.identificationId,
              identificationType: participant.identificationType,
              identificationNumber: participant.identificationNumber,
              isPrimary: true,
            },
          ]
        : [],
      nationalities: participant.mainNationality
        ? [participant.mainNationality]
        : [],
      contactDetails: {
        emails: participant.firstEmailId
          ? [
              {
                id: participant.firstEmailId,
                value: participant.firstEmailValue,
              },
            ]
          : [],
        phones: participant.firstPhoneId
          ? [
              {
                id: participant.firstPhoneId,
                value: participant.firstPhoneValue,
              },
            ]
          : [],
      },
    })),
  );

  if (result.error) {
    throw new Error(
      `Corrupt data in database for individuals: ${result.error.errors.join(', ')}`,
    );
  }
  return result.data;
};

const update: IParticipantStore['update'] = async (
  participantId: string,
  participantUpdate: ParticipantPartialUpdate,
): Promise<Participant> => {
  const db = getDb();

  const {
    contactDetails,
    identification,
    languages,
    nationalities,
    ...participantDetails
  } = participantUpdate;

  await db.transaction(async (trx) => {
    if (Object.keys(participantDetails).length > 0) {
      await trx('participants')
        .update({
          ...participantDetails,
        })
        .where('id', participantId);
    }

    if (languages?.add && languages.add.length > 0) {
      await trx('participant_languages').insert(
        languages.add.map((lang) => ({
          languageIsoCode: lang,
          participantId,
        })),
      );
    }
    if (languages?.remove && languages?.remove?.length > 0) {
      await trx('participant_languages')
        .whereIn('languageIsoCode', languages.remove)
        .where('participantId', participantId)
        .del();
    }

    if (nationalities?.add && nationalities?.add?.length > 0) {
      await trx('participant_nationalities').insert(
        nationalities.add.map((nat) => ({
          nationalityIsoCode: nat,
          participantId,
        })),
      );
    }
    if (nationalities?.remove && nationalities?.remove?.length > 0) {
      await trx('participant_nationalities')
        .whereIn('nationalityIsoCode', nationalities.remove)
        .where('participantId', participantId)
        .del();
    }

    const phonesToAdd =
      contactDetails?.phones?.add?.map((contact) => ({
        id: uuidv4(),
        contactDetailType: ContactDetailType.PhoneNumber,
        rawValue: contact.value,
        cleanValue: contact.value, // TODO: Clean string for searching
        participantId,
      })) || [];
    const emailsToAdd =
      contactDetails?.emails?.add?.map((contact) => ({
        id: uuidv4(),
        contactDetailType: ContactDetailType.Email,
        rawValue: contact.value,
        cleanValue: contact.value, // TODO: Clean string for searching
        participantId,
      })) || [];
    const contactDetailsToAdd = phonesToAdd.concat(emailsToAdd);
    if (contactDetailsToAdd.length > 0) {
      await trx('participant_contact_details').insert(contactDetailsToAdd);
    }

    const phonesToUpdate =
      contactDetails?.phones?.update?.map((contact) => ({
        id: contact.id,
        contactDetailType: ContactDetailType.PhoneNumber,
        rawValue: contact.value,
        cleanValue: contact.value, // TODO: Clean string for searching
        participantId,
      })) || [];
    const emailsToUpdate =
      contactDetails?.emails?.update?.map((contact) => ({
        id: contact.id,
        contactDetailType: ContactDetailType.Email,
        rawValue: contact.value,
        cleanValue: contact.value, // TODO: Clean string for searching
        participantId,
      })) || [];
    const contactDetailsToUpdate = phonesToUpdate.concat(emailsToUpdate);
    if (contactDetailsToUpdate.length > 0) {
      for (const detail of contactDetailsToUpdate) {
        await trx('participant_contact_details')
          .update({
            contactDetailType: detail.contactDetailType,
            rawValue: detail.rawValue,
            cleanValue: detail.cleanValue,
          })
          .where('participantId', detail.participantId)
          .where('id', detail.id);
      }
    }

    const phonesToRemove = contactDetails?.phones?.remove || [];
    const emailsToRemove = contactDetails?.emails?.remove || [];
    const contactDetailsToRemove = phonesToRemove.concat(emailsToRemove);
    if (contactDetailsToRemove.length > 0) {
      await trx('participant_contact_details')
        .whereIn('id', contactDetailsToRemove)
        .del();
    }

    const identificationsToAdd =
      identification?.add?.map((identification) => ({
        ...identification,
        id: uuidv4(),
        participantId,
      })) || [];
    if (identificationsToAdd.length > 0) {
      await trx('participant_identifications').insert(identificationsToAdd);
    }
    const identificationsToUpdate =
      identification?.update?.map((identification) => ({
        ...identification,
        participantId,
      })) || [];
    if (identificationsToUpdate.length > 0) {
      for (const identification of identificationsToUpdate) {
        await trx('participant_identifications')
          .update({
            identificationType: identification.identificationType,
            identificationNumber: identification.identificationNumber,
            isPrimary: identification.isPrimary,
          })
          .where('participantId', identification.participantId)
          .where('id', identification.id);
      }
    }
    if (identification?.remove && identification?.remove?.length > 0) {
      await trx('participant_identifications')
        .whereIn('id', identification.remove)
        .del();
    }
  });

  const updatedParticipant = await get(participantId);

  if (!updatedParticipant) {
    throw new NotFoundError('Participant that was updated not found');
  }

  return updatedParticipant;
};

export const ParticipantStore: IParticipantStore = {
  count,
  create,
  get,
  list,
  update,
};
