import { v4 as uuidv4 } from 'uuid';
import { ulid } from 'ulidx';

import {
  ContactDetailType,
  Participant,
  ParticipantDefinition,
  ParticipantListItem,
  ParticipantListItemSchema,
  ParticipantPartialUpdate,
  ParticipantSchema,
} from '@nrcno/core-models';
import { PostgresError, PostgresErrorCode, getDb } from '@nrcno/core-db';
import { AlreadyExistsError, NotFoundError } from '@nrcno/core-errors';

import { BaseStore } from './base.store';

const count = async (): Promise<number> => {
  const db = getDb();

  const [{ count }] = await db('participants').count();

  return typeof count === 'string' ? parseInt(count, 10) : count;
};

const create = async (
  participantDefinition: ParticipantDefinition,
): Promise<Participant> => {
  const db = getDb();

  const {
    disabilities,
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

      if (disabilities) {
        await trx('participant_disabilities').insert({
          ...disabilities,
          participantId,
        });
      }

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

      const createdParticipant = ParticipantSchema.parse({
        ...participantDetails,
        id: participantId,
        personId,
        entityId,
        languages,
        nationalities,
        disabilities,
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

      return createdParticipant;
    } catch (error) {
      const e = (() => {
        if (
          (error as PostgresError).code === PostgresErrorCode.UniqueViolation
        ) {
          return new AlreadyExistsError('Participant already exists');
        }
        return error;
      })();
      throw e;
    }
  });

  return result;
};

const get = async (id: string): Promise<Participant | null> => {
  const db = getDb();

  const participant = await db('participants').where('id', id).first();

  if (!participant) {
    return null;
  }

  const [
    languages,
    nationalities,
    contactDetails,
    identifications,
    disabilities,
  ] = await Promise.all([
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
      .select('id', 'identificationType', 'identificationNumber', 'isPrimary'),
    db('participant_disabilities').where('participantId', id).first(),
  ]);

  const participantResult = ParticipantSchema.parse({
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
    disabilities,
  });

  return participantResult;
};

const list = async (
  startIndex = 0,
  pageSize = 50,
): Promise<ParticipantListItem[]> => {
  const db = getDb();

  const participantFields = [
    'participants.id',
    'firstName',
    'lastName',
    'sex',
    'dateOfBirth',
    'displacementStatus',
  ];
  const identificationFields = ['identificationType', 'identificationNumber'];

  const participants = await db('participants')
    .select([...participantFields, ...identificationFields])
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
    .limit(pageSize)
    .offset(startIndex)
    .orderBy('lastName', 'asc');

  const participantIds = participants.map((participant) => participant.id);

  const nationalities = await db('participant_nationalities')
    .select(
      'participantId',
      db.raw(
        'array_agg(nationality_iso_code ORDER BY created_at ASC) as nationalities',
      ),
    )
    .whereIn('participantId', participantIds)
    .groupBy('participantId');

  const phones = await db('participant_contact_details')
    .select(
      'participantId',
      db.raw('array_agg(raw_value ORDER BY created_at ASC) as raw_values'),
    )
    .where('contactDetailType', ContactDetailType.PhoneNumber)
    .whereIn('participantId', participantIds)
    .groupBy('participantId');

  const emails = await db('participant_contact_details')
    .select(
      'participantId',
      db.raw('array_agg(raw_value ORDER BY created_at ASC) as raw_values'),
    )
    .where('contactDetailType', ContactDetailType.Email)
    .whereIn('participantId', participantIds)
    .groupBy('participantId');

  return participants.map((participant) =>
    ParticipantListItemSchema.parse({
      ...participant,
      primaryIdentificationType: participant.identificationType,
      primaryIdentificationNumber: participant.identificationNumber,
      nationality:
        nationalities.find(
          (nationality) => nationality.participantId === participant.id,
        )?.nationalities?.[0] || null,
      email:
        emails.find((email) => email.participantId === participant.id)
          ?.rawValues?.[0] || null,
      phone:
        phones.find((phone) => phone.participantId === participant.id)
          ?.rawValues?.[0] || null,
    }),
  );
};

const update = async (
  participantId: string,
  participantUpdate: ParticipantPartialUpdate,
): Promise<Participant> => {
  const db = getDb();

  const {
    disabilities,
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

    if (disabilities) {
      await trx('participant_disabilities')
        .update({
          ...disabilities,
        })
        .where('participantId', participantId);
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

export const ParticipantStore: BaseStore<
  ParticipantDefinition,
  Participant,
  ParticipantPartialUpdate,
  ParticipantListItem
> = {
  count,
  create,
  get,
  list,
  update,
};
