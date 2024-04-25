import { v4 as uuidv4 } from 'uuid';
import { ulid } from 'ulidx';

import {
  Participant,
  ParticipantDefinition,
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
    identification: identifications.map((identification) => ({
      id: identification.id,
      identificationType: identification.identificationType,
      identificationNumber: identification.identificationNumber,
      isPrimary: identification.isPrimary,
    })),
    disabilities,
  });

  return participantResult;
};

export const ParticipantStore: BaseStore<ParticipantDefinition, Participant> = {
  create,
  get,
};
