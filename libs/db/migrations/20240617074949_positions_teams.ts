import type { Knex } from 'knex';

export const up = async (knex: Knex): Promise<void> => {
  await knex.schema.createTable('positions', (table) => {
    table.string('id', 26).primary().notNullable();
    table.string('name', 100).notNullable();
  });

  await knex.schema.createTable('teams', (table) => {
    table.string('id', 26).primary().notNullable();
    table.string('name', 100).notNullable();
    table.string('parent_team_id', 26);

    table.foreign('parent_team_id').references('teams.id').onDelete('CASCADE');
  });

  await knex.schema.createTable('team_position_assignments', (table) => {
    table.string('team_id', 26).notNullable();
    table.string('position_id', 26).notNullable();
    table.boolean('is_team_lead').notNullable().defaultTo(false);

    table.primary(['team_id', 'position_id']);

    table.foreign('team_id').references('teams.id').onDelete('CASCADE');

    table.foreign('position_id').references('positions.id').onDelete('CASCADE');
  });

  await knex.schema.createTable('position_user_assignments', (table) => {
    table.string('position_id', 26).notNullable();
    table.string('user_id', 26).notNullable();

    table.primary(['position_id', 'user_id']);

    table.foreign('position_id').references('positions.id').onDelete('CASCADE');

    table.foreign('user_id').references('users.id').onDelete('CASCADE');
  });
};

export const down = async (knex: Knex): Promise<void> => {
  await knex.schema
    .table('position_user_assignments', (table) => {
      table.dropForeign('user_id');
      table.dropForeign('position_id');
    })
    .dropTableIfExists('position_user_assignments');

  await knex.schema
    .table('team_position_assignments', (table) => {
      table.dropForeign('position_id');
      table.dropForeign('team_id');
    })
    .dropTableIfExists('team_position_assignments');

  await knex.schema.dropTableIfExists('teams');

  await knex.schema.dropTableIfExists('positions');
};
