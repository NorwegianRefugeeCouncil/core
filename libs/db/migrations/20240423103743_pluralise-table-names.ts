import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.renameTable('entity', 'entities');
  await knex.schema.renameTable('person', 'persons');
  await knex.schema.renameTable('participant', 'participants');
  await knex.schema.renameTable(
    'participant_disability',
    'participant_disabilities',
  );
  await knex.schema.renameTable(
    'participant_identification',
    'participant_identifications',
  );
  await knex.schema.renameTable(
    'participant_contact_detail',
    'participant_contact_details',
  );
  await knex.schema.renameTable('nationality', 'nationalities');
  await knex.schema.renameTable('language', 'languages');
  await knex.schema.renameTable('comment', 'comments');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.renameTable('entities', 'entity');
  await knex.schema.renameTable('persons', 'person');
  await knex.schema.renameTable('participants', 'participant');
  await knex.schema.renameTable(
    'participant_disabilities',
    'participant_disability',
  );
  await knex.schema.renameTable(
    'participant_identifications',
    'participant_identification',
  );
  await knex.schema.renameTable(
    'participant_contact_details',
    'participant_contact_detail',
  );
  await knex.schema.renameTable('nationalities', 'nationality');
  await knex.schema.renameTable('languages', 'language');
  await knex.schema.renameTable('comments', 'comment');
}
