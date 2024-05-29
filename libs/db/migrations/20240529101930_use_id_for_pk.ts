import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('nationalities', (table) => {
    table.renameColumn('iso_code', 'id');
  });

  await knex.schema.alterTable('languages', (table) => {
    table.renameColumn('iso_code', 'id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('nationalities', (table) => {
    table.renameColumn('id', 'iso_code');
  });

  await knex.schema.alterTable('languages', (table) => {
    table.renameColumn('id', 'iso_code');
  });
}
