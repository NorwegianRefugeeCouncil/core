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
      await trx('person').insert({ id: personId });

      await trx('entity').insert({ id: entityId });

      await trx('participant').insert({
        ...participantDetails,
        id: participantId,
        personId,
        entityId,
      });

      if (disabilities) {
        await trx('participant_disability').insert({
          participantId,
          ...disabilities,
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
        languagesResult = await trx('language').whereIn(
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
        nationalitiesResult = await trx('nationality').whereIn(
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
        await trx('participant_contact_detail').insert(contactDetailsForDb);
      }

      const identificationForDb =
        identification && identification.length > 0
          ? identification.map((id) => ({
              id: uuidv4(),
              participantId,
              ...id,
            }))
          : [];
      if (identificationForDb.length > 0) {
        await trx('participant_identification').insert(identificationForDb);
      }

      const createdParticipant = ParticipantSchema.parse({
        id: participantId,
        personId,
        entityId,
        ...participantDetails,
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

export const ParticipantStore: BaseStore<ParticipantDefinition, Participant> = {
  create,
};
