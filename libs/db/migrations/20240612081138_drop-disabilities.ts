import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('participant_disabilities');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.createTable('participant_disabilities', (table) => {
    const yesNoUnknown = ['yes', 'no', 'unknown'];

    const disabilityLevel = ['1', '2', '3', '4'];

    table.string('participant_id', 26).primary().notNullable();
    table.boolean('has_disability_pwd');
    table.text('disability_pwd_comment');
    table.boolean('has_disability_vision');
    table.enum('disability_vision_level', disabilityLevel);
    table.boolean('has_disability_hearing');
    table.enum('disability_hearing_level', disabilityLevel);
    table.boolean('has_disability_mobility');
    table.enum('disability_mobility_level', disabilityLevel);
    table.boolean('has_disability_cognition');
    table.enum('disability_cognition_level', disabilityLevel);
    table.boolean('has_disability_selfcare');
    table.enum('disability_selfcare_level', disabilityLevel);
    table.boolean('has_disability_communication');
    table.enum('disability_communication_level', disabilityLevel);
    table.enum('is_child_at_risk', yesNoUnknown);
    table.enum('is_elder_at_risk', yesNoUnknown);
    table.enum('is_woman_at_risk', yesNoUnknown);
    table.enum('is_single_parent', yesNoUnknown);
    table.enum('is_separated_child', yesNoUnknown);
    table.enum('is_pregnant', yesNoUnknown);
    table.enum('is_lactating', yesNoUnknown);
    table.enum('has_medical_condition', yesNoUnknown);
    table.enum('needs_legal_physical_protection', yesNoUnknown);
    table.text('vulnerability_comments');
    table.timestamp('created_at', { precision: 3 }).defaultTo(knex.fn.now(3));
    table.timestamp('updated_at', { precision: 3 }).defaultTo(knex.fn.now(3));

    table
      .foreign('participant_id')
      .references('participants.id')
      .onDelete('CASCADE');
  });

  await knex.raw(`
      CREATE TRIGGER update_timestamp
      BEFORE UPDATE ON participant_disabilities
      FOR EACH ROW
      EXECUTE PROCEDURE update_updated_at_column();
    `);
}
