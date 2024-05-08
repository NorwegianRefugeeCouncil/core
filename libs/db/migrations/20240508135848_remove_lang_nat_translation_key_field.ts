import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('nationalities', (table) => {
    table.dropColumn('translation_key');
  });

  await knex.schema.alterTable('languages', (table) => {
    table.dropColumn('translation_key');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('nationalities', (table) => {
    table.string('translation_key').notNullable();
  });

  await knex.schema.alterTable('languages', (table) => {
    table.string('translation_key').notNullable();
  });
}
