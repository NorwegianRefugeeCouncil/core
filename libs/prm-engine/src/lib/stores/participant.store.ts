import { v4 as uuidv4 } from 'uuid';
import { ulid } from 'ulidx';

import {
  ContactDetailType,
  Participant,
  ParticipantDefinition,
  ParticipantPartialUpdate,
  ParticipantSchema,
} from '@nrcno/core-models';
import { PostgresError, PostgresErrorCode, getDb } from '@nrcno/core-db';
import { AlreadyExistsError } from '@nrcno/core-errors';

import { BaseStore } from './base.store';

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

      let languagesResult: Participant['languages'] = [];
      if (languages && languages.length > 0) {
        await trx('participant_languages').insert(
          languages.map((lang) => ({
            languageIsoCode: lang.isoCode,
            participantId,
          })),
        );
        languagesResult = await trx('languages').whereIn(
          'isoCode',
          languages.map((lang) => lang.isoCode),
        );
      }

      let nationalitiesResult: Participant['nationalities'] = [];
      if (nationalities && nationalities.length > 0) {
        await trx('participant_nationalities').insert(
          nationalities.map((nat) => ({
            nationalityIsoCode: nat.isoCode,
            participantId,
          })),
        );
        nationalitiesResult = await trx('nationalities').whereIn(
          'isoCode',
          nationalities.map((nat) => nat.isoCode),
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
        languages: languagesResult,
        nationalities: nationalitiesResult,
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
      .join(
        'languages',
        'languages.isoCode',
        'participant_languages.languageIsoCode',
      )
      .where('participantId', id)
      .select('isoCode', 'translationKey'),
    db('participant_nationalities')
      .join(
        'nationalities',
        'nationalities.isoCode',
        'participant_nationalities.nationalityIsoCode',
      )
      .where('participantId', id)
      .select('isoCode', 'translationKey'),
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
    languages,
    nationalities,
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

    if (languages?.add?.length) {
      await trx('participant_languages').insert(
        languages.add.map((lang) => ({
          languageIsoCode: lang.isoCode,
          participantId,
        })),
      );
    }
    if (languages?.remove?.length) {
      await trx('participant_languages')
        .whereIn('languageIsoCode', languages.remove)
        .where('participantId', participantId)
        .del();
    }

    if (nationalities?.add?.length) {
      await trx('participant_nationalities').insert(
        nationalities.add.map((nat) => ({
          nationalityIsoCode: nat.isoCode,
          participantId,
        })),
      );
    }
    if (nationalities?.remove?.length) {
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
    if (contactDetailsToRemove.length) {
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
    if (identification?.remove?.length) {
      await trx('participant_identifications')
        .whereIn('id', identification.remove)
        .del();
    }
  });

  const updatedParticipant = await get(participantId);
  return updatedParticipant!;
};

export const ParticipantStore: BaseStore<
  ParticipantDefinition,
  Participant,
  ParticipantPartialUpdate
> = {
  create,
  get,
  update,
};
