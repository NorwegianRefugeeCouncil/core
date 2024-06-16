import { getDb } from '@nrcno/core-db';
import { getLogger } from '@nrcno/core-logger';
import {
  DeduplicationRecord,
  DeduplicationRecordDefinition,
  DeduplicationRecordSchema,
  Pagination,
} from '@nrcno/core-models';

export const count = async (): Promise<number> => {
  const db = getDb();

  const [{ count }] = await db('duplicates').count();

  return typeof count === 'string' ? parseInt(count, 10) : count;
};

export const list = async (
  pagination: Pagination,
): Promise<DeduplicationRecord[]> => {
  const db = getDb();

  const rows = await db('duplicates')
    .limit(pagination.pageSize)
    .offset(pagination.startIndex)
    .orderBy('weighted_score', 'desc');

  return rows.map((row: any) => {
    const {
      participantIdA,
      participantIdB,
      weightedScore,
      createdAt,
      updatedAt,
      scores,
    } = row;

    return DeduplicationRecordSchema.parse({
      participantIdA,
      participantIdB,
      weightedScore,
      scores,
      createdAt,
      updatedAt,
    });
  });
};

export const upsert = async (
  records: (DeduplicationRecord | DeduplicationRecordDefinition)[],
): Promise<DeduplicationRecord[]> => {
  const db = getDb();

  const insertRecords = records.map((record) => ({
    participantIdA: record.participantIdA,
    participantIdB: record.participantIdB,
    weightedScore: record.weightedScore,
    scores: JSON.stringify(record.scores),
  }));

  const rows = await db('duplicates')
    .insert(insertRecords)
    .onConflict(['participantId_a', 'participantId_b'])
    .merge()
    .returning('*');

  return rows.map((r) => DeduplicationRecordSchema.parse(r));
};

export const getForUser = async (
  participantId: string,
): Promise<DeduplicationRecord[]> => {
  const db = getDb();

  const rows = await db('duplicates')
    .where('participantId_a', participantId)
    .orWhere('participantId_b', participantId);

  return rows.map((r: unknown) => DeduplicationRecordSchema.parse(r));
};

export const deletePair = async (
  participantIdA: string,
  participantIdB: string,
): Promise<void> => {
  const db = getDb();

  await db('duplicates')
    .where('participantId_a', participantIdA)
    .andWhere('participantId_b', participantIdB)
    .del();
};

export const logResolution = async (
  participantIdA: string,
  participantIdB: string,
  resolution: 'merge' | 'ignore',
): Promise<void> => {
  const db = getDb();

  await db('deduplication_resolutions').insert({
    participantId_a: participantIdA,
    participantId_b: participantIdB,
    resolution,
  });
};

export const prepareViews = async (): Promise<void> => {
  const logger = getLogger();
  const db = getDb();

  logger.info('Preparing participant_identification_matches temp table');
  await db.raw(`
    CREATE TEMPORARY TABLE participant_identification_matches AS (
      SELECT
        participant_identifications_a.participant_id AS participant_id_a,
        participant_identifications_b.participant_id AS participant_id_b
      FROM
        participant_identifications AS participant_identifications_a
      CROSS JOIN
        participant_identifications AS participant_identifications_b
      WHERE
        participant_identifications_a.identification_type = participant_identifications_b.identification_type
      AND
        participant_identifications_a.identification_number = participant_identifications_b.identification_number
    )
  `);

  logger.info('Creating indexes for participant_identification_matches');
  await db.raw(`
    CREATE INDEX idx_pim_on_participant_id_a_id_b
    ON participant_identification_matches(participant_id_a, participant_id_b)
  `);

  return;
};

export async function* getParticipantIdPairs(
  fromDate: Date,
): AsyncGenerator<[string, string], void, unknown> {
  const db = getDb();

  const result = await db.raw(
    `
    SELECT participants_a.id as participant_id_a, participants_b.id as participant_id_b
    FROM participants participants_a
    CROSS JOIN participants participants_b
    WHERE participants_a.id != participants_b.id
    AND participants_a.updated_at >= ?
    AND participants_a.sex = participants_b.sex
    AND participants_a.nrc_id != participants_b.nrc_id
    AND (participants_a.id, participants_b.id) NOT IN (
      SELECT participant_id_a, participant_id_b
      FROM participant_identification_matches
    )
  `,
    [fromDate],
  );

  for (const row of result.rows) {
    yield [row.participant_id_a, row.participant_id_b];
  }
}

export async function* getExactMatches(
  fromDate: Date,
): AsyncGenerator<DeduplicationRecord, void, unknown> {
  const db = getDb();

  const result = await db.raw(
    `
    SELECT participants_a.id as participant_id_a, participants_b.id as participant_id_b
    FROM participants participants_a
    CROSS JOIN participants participants_b
    WHERE participants_a.id != participants_b.id
    AND participants_a.updated_at >= ?
    AND (
      participants_a.nrc_id = participants_b.nrc_id
      OR (participants_a.id, participants_b.id) IN (
        SELECT participant_id_a, participant_id_b
        FROM participant_identification_matches
      )
    )
  `,
    [fromDate],
  );

  for (const row of result.rows) {
    yield row.map((r: any) => ({
      participantIdA: r.participant_id_a,
      participantIdB: r.participant_id_b,
      weightedScore: 1,
      scores: {},
    }));
  }
}

export async function* getWeightedMatches(
  fromDate: Date,
  pagination: Pagination,
): AsyncGenerator<any, void, unknown> {
  const db = getDb();

  await db.raw(
    `
    CREATE TEMPORARY TABLE participant_max_email_score AS (
      SELECT
        pcd_a.participant_id as participant_id_a,
        pcd_b.participant_id as participant_id_b,  
        MAX(
          CASE
            WHEN split_part(pcd_a.raw_value, '@', 2) != split_part(pcd_b.raw_value, '@', 2) THEN 0
            ELSE DICE_COEFF(pcd_a.raw_value, pcd_b.raw_value)
          END
        ) as email_score_max
      FROM participant_contact_details AS pcd_a
      JOIN participant_contact_details AS pcd_b ON pcd_a.participant_id != pcd_b.participant_id AND pcd_a.contact_detail_type = 'email' AND pcd_b.contact_detail_type = 'email'
      JOIN (
        SELECT id
        FROM participant_contact_details
        ORDER BY updated_at DESC
        LIMIT ?
        OFFSET ?
      ) sub_pcd ON pcd_a.id = sub_pcd.id
      GROUP BY pcd_a.participant_id, pcd_b.participant_id
    )  
  `,
    [pagination.pageSize, pagination.startIndex],
  );

  await db.raw(`
    CREATE INDEX idx_pmes_on_participant_id_a_id_b
    ON participant_max_email_score(participant_id_a, participant_id_b)
  `);

  const result = await db.raw(
    `
    SELECT
      pa.id as participant_id_a,
      pb.id as participant_id_b,
      CASE
        WHEN pa.date_of_birth IS NOT NULL AND pb.date_of_birth IS NOT NULL AND pa.date_of_birth = pb.date_of_birth THEN 1
        ELSE 0
      END as dob_score,
      ((
        DICE_COEFF(pa.first_name, pb.first_name) +
        DICE_COEFF(pa.last_name, pb.last_name) +
        DICE_COEFF(concat(pa.first_name, ' ', pa.last_name), concat(pb.first_name, ' ', pb.last_name))
      ) / 3) as name_score,
      pmes.email_score_max as email_score,
      calculate_residence_score(pa.residence, pb.residence) as residence_score
    FROM participants pa
    JOIN participants pb ON pa.sex = pb.sex AND pa.nrc_id != pb.nrc_id AND pa.id != pb.id
    LEFT JOIN participant_max_email_score pmes ON pa.id = pmes.participant_id_a AND pb.id = pmes.participant_id_b
    LEFT JOIN participant_identification_matches pim ON pa.id = pim.participant_id_a AND pb.id = pim.participant_id_b
    JOIN (
      SELECT id
      FROM participants
      ORDER BY updated_at DESC
      LIMIT ?
      OFFSET ?
    ) sub_pa ON pa.id = sub_pa.id
    WHERE pa.updated_at >= ?
    AND pim.participant_id_a IS NULL
    AND pim.participant_id_b IS NULL  
  `,
    [pagination.pageSize, pagination.startIndex, fromDate],
  );

  await db.raw(`
    DROP TABLE participant_max_email_score
  `);

  for (const row of result.rows) {
    yield row;
  }
}
