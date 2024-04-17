import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('entity', (table) => {
    table.string('id', 26).primary().notNullable();
  });

  await knex.schema.createTable('person', (table) => {
    table.string('id', 26).primary().notNullable();
  });

  await knex.schema.createTable('participant', (table) => {
    table.string('id', 26).primary().notNullable();
    table.string('person_id', 26).notNullable();
    table.string('entity_id', 26).notNullable();

    table.string('first_name', 100);
    table.string('middle_name', 100);
    table.string('last_name', 100);
    table.string('native_name', 100);
    table.string('mother_name', 100);
    table.string('preferred_name', 100);

    table.date('date_of_birth');
    table.string('nrc_id', 40);
    table.string('residence');
    table.string('contact_means_comment');
    table.boolean('consent_gdpr').notNullable().defaultTo(false);
    table.boolean('consent_referral').notNullable().defaultTo(false);

    table.enum('sex', ['male', 'female', 'other', 'prefer_not_to_answer'], {
      useNative: true,
      enumName: 'sex_type',
    });
    table.enum(
      'preferred_contact_means',
      ['phone', 'whatsapp', 'email', 'visit', 'other'],
      {
        useNative: true,
        enumName: 'contact_means_type',
      },
    );
    table.enum(
      'displacement_status',
      [
        'idp',
        'refugee',
        'host_community',
        'returnee',
        'non_displaced',
        'asylum_seeker',
        'other',
      ],
      {
        useNative: true,
        enumName: 'displacement_status_type',
      },
    );
    table.enum(
      'engagement_context',
      [
        'house_visit',
        'field_activity',
        'referred',
        'in_office_meeting',
        'remote_channels',
      ],
      {
        useNative: true,
        enumName: 'engagement_context_type',
      },
    );

    table.foreign('person_id').references('person.id').onDelete('CASCADE');
    table.foreign('entity_id').references('entity.id').onDelete('CASCADE');
  });

  await knex.schema.createTable('participant_disability', (table) => {
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

    table
      .foreign('participant_id')
      .references('participants.id')
      .onDelete('CASCADE');
  });

  await knex.schema.createTable('participant_identification', (table) => {
    table.uuid('id').primary().notNullable();
    table.string('participant_id', 26).notNullable();
    table.enum(
      'identification_type',
      ['unhcr_id', 'passport', 'national_id', 'other'],
      {
        useNative: true,
        enumName: 'identification_type_type',
      },
    );
    table.string('identification_number', 100);
    table.boolean('is_primary').notNullable().defaultTo(false);

    table
      .foreign('participant_id')
      .references('participants.id')
      .onDelete('CASCADE');
  });

  await knex.schema.createTable('participant_contact_detail', (table) => {
    table.uuid('id').primary().notNullable();
    table.string('participant_id', 26).notNullable();
    table.enum('contact_detail_type', ['email', 'phone_number', 'other'], {
      useNative: true,
      enumName: 'contact_detail_type_type',
    });
    table.string('raw_value', 150);
    table.string('clean_value', 100);

    table
      .foreign('participant_id')
      .references('participants.id')
      .onDelete('CASCADE');
  });

  await knex.schema.createTable('nationality', (table) => {
    table.string('iso_code', 20).primary().notNullable();
    table.string('translation_key', 200).notNullable();
    table.boolean('enabled').notNullable().defaultTo(true);
  });

  await knex.schema.createTable('participant_nationalities', (table) => {
    table.string('participant_id', 26).notNullable();
    table.string('nationality_iso_code', 20).notNullable();

    table.primary(['participant_id', 'nationality_iso_code']);

    table
      .foreign('participant_id')
      .references('participants.id')
      .onDelete('CASCADE');

    table
      .foreign('nationality_iso_code')
      .references('nationality.iso_code')
      .onDelete('CASCADE');
  });

  await knex.schema.createTable('language', (table) => {
    table.string('iso_code', 20).primary().notNullable();
    table.string('translation_key', 200).notNullable();
    table.boolean('enabled').notNullable().defaultTo(true);
  });

  await knex.schema.createTable('participant_languages', (table) => {
    table.string('participant_id', 26).notNullable();
    table.string('language_iso_code', 20).notNullable();

    table.primary(['participant_id', 'language_iso_code']);

    table
      .foreign('participant_id')
      .references('participants.id')
      .onDelete('CASCADE');

    table
      .foreign('language_iso_code')
      .references('language.iso_code')
      .onDelete('CASCADE');
  });

  await knex.schema.createTable('comment', (table) => {
    table.uuid('id').primary().notNullable();
    table.string('entity_id', 26).notNullable();
    table.text('comment').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.foreign('entity_id').references('entity.id').onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema
    .table('comment', (table) => {
      table.dropForeign('entity_id');
    })
    .dropTableIfExists('comment');

  await knex.schema
    .table('participant_languages', (table) => {
      table.dropForeign('language_iso_code');
      table.dropForeign('participant_id');
    })
    .dropTableIfExists('participant_languages');

  await knex.schema.dropTableIfExists('language');

  await knex.schema
    .table('participant_nationalities', (table) => {
      table.dropForeign('nationality_iso_code');
      table.dropForeign('participant_id');
    })
    .dropTableIfExists('participant_nationalities');

  await knex.schema.dropTableIfExists('nationality');

  await knex.schema
    .table('participant_contact_detail', (table) => {
      table.dropForeign('participant_id');
    })
    .dropTableIfExists('participant_contact_detail');

  await knex.schema
    .table('participant_identification', (table) => {
      table.dropForeign('participant_id');
    })
    .dropTableIfExists('participant_identification');

  await knex.schema
    .table('participant_disability', (table) => {
      table.dropForeign('participant_id');
    })
    .dropTableIfExists('participant_disability');

  await knex.schema
    .table('participant', (table) => {
      table.dropForeign('person_id');
      table.dropForeign('entity_id');
    })
    .dropTableIfExists('participant');

  await knex.schema.dropTableIfExists('person');

  await knex.schema.dropTableIfExists('entity');
}
