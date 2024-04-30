import { v4 as uuidv4 } from 'uuid';
import { ulid } from 'ulidx';

import {
  ContactDetails,
  Identification,
  LanguageDefinition,
  NationalityDefinition,
  Participant,
  ParticipantDefinition,
  ParticipantSchema,
  ParticipantUpdate,
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

      const contactDetailsForDb =
        contactDetails && contactDetails.length > 0
          ? contactDetails.map((contact) => ({
              id: uuidv4(),
              contactDetailType: contact.contactDetailType,
              rawValue: contact.value,
              cleanValue: contact.value, // TODO: Clean string for searching
              participantId,
            }))
          : [];
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
        contactDetails: contactDetailsForDb.map((contact) => ({
          id: contact.id,
          contactDetailType: contact.contactDetailType,
          value: contact.rawValue,
        })),
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
    contactDetails: contactDetails.map((contactDetail) => ({
      id: contactDetail.id,
      contactDetailType: contactDetail.contactDetailType,
      value: contactDetail.rawValue,
    })),
    identification: identifications,
    disabilities,
  });

  return participantResult;
};

const calculateUpdates = async <T, U>(
  tableName: string,
  idFieldInTable: keyof U,
  participantId: string,
  idField: keyof T,
  incomingData?: T[],
) => {
  const updates: {
    add?: T[];
    update?: T[];
    remove?: U[];
  } = {};
  if (incomingData?.length) {
    const db = getDb();
    const existingData: U[] = await db(tableName).where(
      'participantId',
      participantId,
    );

    updates.add = incomingData.filter(
      (item) =>
        !existingData.some(
          (existingItem: any) => item[idField] === existingItem[idFieldInTable],
        ),
    );
    updates.update = incomingData.filter((item) =>
      existingData.some(
        (existingItem: any) => item[idField] === existingItem[idFieldInTable],
      ),
    ); // for updates we could do a diff to see if the value has changed
    updates.remove = existingData.filter(
      (existingItem: any) =>
        !incomingData.some(
          (item) =>
            item[idField] && item[idField] === existingItem[idFieldInTable],
        ),
    );
  }
  return updates;
};

const update = async (
  participantId: string,
  participantUpdate: ParticipantUpdate,
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

  const contactDetailUpdates = await calculateUpdates<
    Partial<ContactDetails>,
    ContactDetails
  >('participant_contact_details', 'id', participantId, 'id', contactDetails);

  const identificationUpdates = await calculateUpdates<
    Partial<Identification>,
    Identification
  >('participant_identifications', 'id', participantId, 'id', identification);

  const languageUpdates = await calculateUpdates<
    LanguageDefinition,
    { participantId: string; languageIsoCode: string }
  >(
    'participant_languages',
    'languageIsoCode',
    participantId,
    'isoCode',
    languages,
  );

  const nationalityUpdates = await calculateUpdates<
    NationalityDefinition,
    { participantId: string; nationalityIsoCode: string }
  >(
    'participant_nationalities',
    'nationalityIsoCode',
    participantId,
    'isoCode',
    nationalities,
  );

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

    if (languages && languages.length > 0) {
      if (languageUpdates.add?.length) {
        await trx('participant_languages').insert(
          languageUpdates.add.map((lang) => ({
            languageIsoCode: lang.isoCode,
            participantId,
          })),
        );
      }
      if (languageUpdates.remove?.length) {
        await trx('participant_languages')
          .whereIn(
            'languageIsoCode',
            languageUpdates.remove.map((lang) => lang.languageIsoCode),
          )
          .where('participantId', participantId)
          .del();
      }
    }

    if (nationalities && nationalities.length > 0) {
      if (nationalityUpdates.add?.length) {
        await trx('participant_nationalities').insert(
          nationalityUpdates.add.map((nat) => ({
            nationalityIsoCode: nat.isoCode,
            participantId,
          })),
        );
      }
      if (nationalityUpdates.remove?.length) {
        await trx('participant_nationalities')
          .whereIn(
            'nationalityIsoCode',
            nationalityUpdates.remove.map((nat) => nat.nationalityIsoCode),
          )
          .where('participantId', participantId)
          .del();
      }
    }

    const contactDetailsToAdd = contactDetailUpdates.add
      ? contactDetailUpdates.add.map((contact) => ({
          id: uuidv4(),
          contactDetailType: contact.contactDetailType,
          rawValue: contact.value,
          cleanValue: contact.value, // TODO: Clean string for searching
          participantId,
        }))
      : [];
    if (contactDetailsToAdd.length > 0) {
      await trx('participant_contact_details').insert(contactDetailsToAdd);
    }

    const contactDetailsToUpdate = contactDetailUpdates.update
      ? contactDetailUpdates.update.map((contact) => ({
          id: contact.id,
          contactDetailType: contact.contactDetailType,
          rawValue: contact.value,
          cleanValue: contact.value, // TODO: Clean string for searching
          participantId,
        }))
      : [];
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

    if (contactDetailUpdates.remove?.length) {
      await trx('participant_contact_details')
        .whereIn(
          'id',
          contactDetailUpdates.remove.map((cd) => cd.id!),
        )
        .del();
    }

    const identificationsToAdd = identificationUpdates.add
      ? identificationUpdates.add.map((identification) => ({
          ...identification,
          id: uuidv4(),
          participantId,
        }))
      : [];
    if (identificationsToAdd.length > 0) {
      await trx('participant_identifications').insert(identificationsToAdd);
    }
    const identificationsToUpdate = identificationUpdates.update
      ? identificationUpdates.update.map((identification) => ({
          ...identification,
          participantId,
        }))
      : [];
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
    if (identificationUpdates.remove?.length) {
      await trx('participant_identifications')
        .whereIn(
          'id',
          identificationUpdates.remove.map((id) => id.id!),
        )
        .del();
    }
  });

  const updatedParticipant = await get(participantId);

  return updatedParticipant!;
};

export const ParticipantStore: BaseStore<
  ParticipantDefinition,
  Participant,
  ParticipantUpdate
> = {
  create,
  get,
  update,
};
