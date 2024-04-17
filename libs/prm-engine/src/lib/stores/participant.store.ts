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
  const trx = await db.transaction();

  try {
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

    const disabilitiesResult = await trx('participant_disability')
      .insert({
        participantId: participantDetailsResult[0].id,
        ...disabilities,
      })
      .returning('*')
      .then((rows) => rows[0]);

    const languagesResult = await trx('participant_languages')
      .insert(
        languages.map((lang) => ({
          languageIsoCode: lang.isoCode,
          participantId: participantDetailsResult[0].id,
        })),
      )
      .returning('*');
    const retrievedLanguages = await trx('languages')
      .select('*')
      .whereIn(
        'iso_code',
        languagesResult.map((lang) => lang.languageIsoCode),
      );

    const nationalitiesResult = await trx('participant_nationalities')
      .insert(
        nationalities.map((nat) => ({
          nationalityIsoCode: nat.isoCode,
          participantId: participantDetailsResult[0].id,
        })),
      )
      .returning('*');
    const retrievedNationalities = await trx('nationality')
      .select('*')
      .whereIn(
        'iso_code',
        nationalitiesResult.map((nat) => nat.nationalityIsoCode),
      );

    const contactDetailsResult = await trx('participant_contact_detail')
      .insert(contactDetails.map((contact) => ({ ...contact, id: uuidv4() })))
      .returning('*');

    const identificationResult = await trx('participant_nationalities')
      .insert(identification.map((id) => ({ ...id, id: uuidv4() })))
      .returning('*');

    const createdParticipant = ParticipantSchema.parse({
      ...participantDetailsResult[0],
      languages: retrievedLanguages,
      nationalities: retrievedNationalities,
      disabilities: disabilitiesResult,
      contactDetails: contactDetailsResult,
      identification: identificationResult,
    });

    trx.commit();

    return createdParticipant;
  } catch (error) {
    trx.rollback();
    if ((error as PostgresError).code === PostgresErrorCode.UniqueViolation) {
      throw new AlreadyExistsError('Participant already exists');
    }
    throw error;
  }
};

export const ParticipantStore: BaseStore<ParticipantDefinition, Participant> = {
  create,
};
