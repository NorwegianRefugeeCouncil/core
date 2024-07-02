import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw('TRUNCATE TABLE individual_identifications CASCADE');
  await knex.raw('TRUNCATE TABLE individual_contact_details CASCADE');
  await knex.raw('TRUNCATE TABLE comments CASCADE');

  await knex.schema.alterTable('individual_identifications', (table) => {
    table.string('id', 26).alter();
  });
  await knex.schema.alterTable('individual_contact_details', (table) => {
    table.string('id', 26).alter();
  });
  await knex.schema.alterTable('comments', (table) => {
    table.string('id', 26).alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('individual_identifications', (table) => {
    table.uuid('id').alter();
  });
  await knex.schema.alterTable('individual_contact_details', (table) => {
    table.uuid('id').alter();
  });
  await knex.schema.alterTable('comments', (table) => {
    table.uuid('id').alter();
  });
}
