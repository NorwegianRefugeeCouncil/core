import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('households', (table) => {
    table.string('id', 26).primary().notNullable();
    table.integer('size_override');

    table.enum(
      'head_type',
      [
        'adult_female',
        'adult_male',
        'elderly_female',
        'elderly_male',
        'minor_female',
        'minor_male',
      ],
      {
        useNative: true,
        enumName: 'head_type',
      },
    );
  });

  await knex.schema.createTable('household_individuals', (table) => {
    table.string('household_id', 26).notNullable();
    table.string('individual_id', 26).notNullable();
    table.boolean('is_head_of_household').notNullable();

    table.primary(['household_id', 'individual_id']);

    table
      .foreign('household_id')
      .references('households.id')
      .onDelete('CASCADE');
    table
      .foreign('individual_id')
      .references('participants.id')
      .onDelete('CASCADE');

    table.unique(['individual_id']);
    table.unique(['is_head_of_household', 'household_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema
    .table('household_individuals', (table) => {
      table.dropForeign('household_id');
      table.dropForeign('individual_id');
      table.dropUnique(['individual_id']);
      table.dropUnique(['is_head_of_household', 'household_id']);
    })
    .dropTableIfExists('household_individuals');

  await knex.raw('DROP TYPE head_type');
  await knex.schema.dropTableIfExists('household');
}
