import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('households', (table) => {
    table.string('id', 26).primary().notNullable();
    table.integer('size_override');

    table.enum(
      'head_type',
      [
        'male_adult',
        'male_elderly',
        'male_minor',
        'female_adult',
        'female_elderly',
        'female_minor',
      ],
      {
        useNative: true,
        enumName: 'head_type',
      },
    );
  });

  await knex.schema.createTable('household_individuals', (table) => {
    table.string('household_id').primary().notNullable();
    table
      .foreign('household_id')
      .references('households.id')
      .onDelete('CASCADE');
    table.string('individual_id').primary().notNullable();
    table
      .foreign('individual_id')
      .references('participants.id')
      .onDelete('CASCADE');
    table.boolean('is_hoh').notNullable();

    table.unique(['household_id', 'individual_id']);
    table.unique(['is_hoh', 'individual_id']);
  });

  await knex.schema.createTable('household_nationalities', (table) => {
    table.string('household_id', 26).notNullable();
    table.string('nationality_id', 20).notNullable();

    table.primary(['household_id', 'nationality_id']);

    table
      .foreign('household_id')
      .references('households.id')
      .onDelete('CASCADE');

    table
      .foreign('nationality_id')
      .references('nationalities.id')
      .onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema
    .table('household_nationalities', (table) => {
      table.dropForeign('household_id');
      table.dropForeign('nationality_id');
    })
    .dropTableIfExists('household_nationalities');

  await knex.schema
    .table('household_individuals', (table) => {
      table.dropForeign('household_id');
      table.dropForeign('individual_id');
      table.dropUnique(['household_id', 'individual_id']);
      table.dropUnique(['is_hoh', 'individual_id']);
    })
    .dropTableIfExists('household_individuals');

  await knex.schema.dropTableIfExists('household');
}
