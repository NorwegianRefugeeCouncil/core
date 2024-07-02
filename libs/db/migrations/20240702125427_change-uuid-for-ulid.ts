import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw('TRUNCATE TABLE individual_identifications CASCADE');
  await knex.raw('TRUNCATE TABLE individual_contact_details CASCADE');
  await knex.raw('TRUNCATE TABLE comments CASCADE');

  // Temporarily drop primary key constraints
  await knex.schema.alterTable('individual_identifications', (table) => {
    table.dropPrimary('participant_identification_pkey'); // note the constraint name references the table name at creation time
  });
  await knex.schema.alterTable('individual_contact_details', (table) => {
    table.dropPrimary('participant_contact_detail_pkey');
  });
  await knex.schema.alterTable('comments', (table) => {
    table.dropPrimary('comment_pkey');
  });

  // Alter column types
  await knex.schema.alterTable('individual_identifications', (table) => {
    table.string('id', 26).notNullable().alter();
  });
  await knex.schema.alterTable('individual_contact_details', (table) => {
    table.string('id', 26).notNullable().alter();
  });
  await knex.schema.alterTable('comments', (table) => {
    table.string('id', 26).notNullable().alter();
  });

  // Re-add primary key constraints
  await knex.schema.alterTable('individual_identifications', (table) => {
    table.primary(['id']);
  });
  await knex.schema.alterTable('individual_contact_details', (table) => {
    table.primary(['id']);
  });
  await knex.schema.alterTable('comments', (table) => {
    table.primary(['id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('individual_identifications', (table) => {
    table.dropPrimary();
  });
  await knex.schema.alterTable('individual_contact_details', (table) => {
    table.dropPrimary();
  });
  await knex.schema.alterTable('comments', (table) => {
    table.dropPrimary();
  });

  await knex.schema.alterTable('individual_identifications', (table) => {
    table.uuid('id').notNullable().alter();
  });
  await knex.schema.alterTable('individual_contact_details', (table) => {
    table.uuid('id').notNullable().alter();
  });
  await knex.schema.alterTable('comments', (table) => {
    table.uuid('id').notNullable().alter();
  });

  await knex.schema.alterTable('individual_identifications', (table) => {
    table.primary(['id'], {
      constraintName: 'participant_identification_pkey',
    });
  });
  await knex.schema.alterTable('individual_contact_details', (table) => {
    table.primary(['id'], {
      constraintName: 'participant_contact_detail_pkey',
    });
  });
  await knex.schema.alterTable('comments', (table) => {
    table.primary(['id'], { constraintName: 'comment_pkey' });
  });
}
