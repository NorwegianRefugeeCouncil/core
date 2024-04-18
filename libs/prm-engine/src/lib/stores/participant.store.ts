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
      const personResult = await trx('person')
        .insert({ id: personId })
        .returning('*');

      const entityResult = await trx('entity')
        .insert({ id: entityId })
        .returning('*');

      const participantDetailsResult = await trx('participant')
        .insert({
          ...participantDetails,
          id: participantId,
          personId: personResult[0].id,
          entityId: entityResult[0].id,
        })
        .returning('*');

      const disabilitiesResult = disabilities
        ? await trx('participant_disability')
            .insert({
              participantId: participantDetailsResult[0].id,
              ...disabilities,
            })
            .returning('*')
            .then((rows) => rows[0])
        : undefined;

      const languagesResult =
        languages && languages.length > 0
          ? await trx('participant_languages')
              .insert(
                languages.map((lang) => ({
                  languageIsoCode: lang.isoCode,
                  participantId: participantDetailsResult[0].id,
                })),
              )
              .returning('*')
          : [];
      const retrievedLanguages =
        languagesResult.length > 0
          ? await trx('languages')
              .select('*')
              .whereIn(
                'iso_code',
                languagesResult.map((lang) => lang.languageIsoCode),
              )
          : [];

      const nationalitiesResult =
        nationalities && nationalities.length > 0
          ? await trx('participant_nationalities')
              .insert(
                nationalities.map((nat) => ({
                  nationalityIsoCode: nat.isoCode,
                  participantId: participantDetailsResult[0].id,
                })),
              )
              .returning('*')
          : [];
      const retrievedNationalities =
        nationalitiesResult.length > 0
          ? await trx('nationality')
              .select('*')
              .whereIn(
                'iso_code',
                nationalitiesResult.map((nat) => nat.nationalityIsoCode),
              )
          : [];

      const contactDetailsResult =
        contactDetails && contactDetails.length > 0
          ? await trx('participant_contact_detail')
              .insert(
                contactDetails.map((contact) => ({
                  id: uuidv4(),
                  contactDetailType: contact.contactDetailType,
                  rawValue: contact.value,
                  cleanValue: contact.value, // TODO: Clean string for searching
                  participantId: participantDetailsResult[0].id,
                })),
              )
              .returning('*')
          : [];

      const identificationResult =
        identification && identification.length > 0
          ? await trx('participant_identification')
              .insert(
                identification.map((id) => ({
                  ...id,
                  id: uuidv4(),
                  participantId: participantDetailsResult[0].id,
                })),
              )
              .returning('*')
          : [];

      const createdParticipant = ParticipantSchema.parse({
        ...participantDetailsResult[0],
        languages: retrievedLanguages,
        nationalities: retrievedNationalities,
        disabilities: disabilitiesResult,
        contactDetails: contactDetailsResult.map((contact) => ({
          id: contact.id,
          contactDetailType: contact.contactDetailType,
          value: contact.rawValue,
        })),
        identification: identificationResult,
      });

      trx.commit();

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
