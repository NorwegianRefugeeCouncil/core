import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.renameTable('participants', 'individuals');
  await knex.schema.renameTable(
    'participant_identifications',
    'individual_identifications',
  );
  await knex.schema.renameTable(
    'participant_contact_details',
    'individual_contact_details',
  );
  await knex.schema.renameTable(
    'participant_nationalities',
    'individual_nationalities',
  );
  await knex.schema.renameTable(
    'participant_languages',
    'individual_languages',
  );

  await knex.schema.alterTable('individual_identifications', (table) => {
    table.renameColumn('participant_id', 'individual_id');
  });
  await knex.schema.alterTable('individual_contact_details', (table) => {
    table.renameColumn('participant_id', 'individual_id');
  });
  await knex.schema.alterTable('individual_nationalities', (table) => {
    table.renameColumn('participant_id', 'individual_id');
  });
  await knex.schema.alterTable('individual_languages', (table) => {
    table.renameColumn('participant_id', 'individual_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.renameTable('individuals', 'participants');
  await knex.schema.renameTable(
    'individual_identifications',
    'participant_identifications',
  );
  await knex.schema.renameTable(
    'individual_contact_details',
    'participant_contact_details',
  );
  await knex.schema.renameTable(
    'individual_nationalities',
    'participant_nationalities',
  );
  await knex.schema.renameTable(
    'individual_languages',
    'participant_languages',
  );

  await knex.schema.alterTable('participant_identifications', (table) => {
    table.renameColumn('individual_id', 'participant_id');
  });
  await knex.schema.alterTable('participant_contact_details', (table) => {
    table.renameColumn('individual_id', 'participant_id');
  });
  await knex.schema.alterTable('participant_nationalities', (table) => {
    table.renameColumn('individual_id', 'participant_id');
  });
  await knex.schema.alterTable('participant_languages', (table) => {
    table.renameColumn('individual_id', 'participant_id');
  });
}
