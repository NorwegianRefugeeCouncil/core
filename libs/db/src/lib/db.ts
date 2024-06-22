import knex, { Knex } from 'knex';

import { config } from '../../knexfile';

import { postProcessResponse, wrapIdentifier } from './db-utils';

config.postProcessResponse = postProcessResponse;
config.wrapIdentifier = wrapIdentifier;

let db: Knex<any, unknown[]>;

export const getDb = (
  connectionConfig?: Knex.Config['connection'],
  existingConnection?: Knex,
) => {
  if (existingConnection) {
    db = existingConnection;
  } else if (!db) {
    if (!connectionConfig) {
      throw new Error(
        'Connection configuration is required to create a new database connection',
      );
    }
    db = knex({
      ...config,
      connection: connectionConfig,
    });
  }

  return db;
};

export const getTrx = async () => {
  const _db = getDb();
  return _db.transaction();
};

export interface PostgresError extends Error {
  code?: string;
}

/**
 * PostgreSQL error codes
 * @see {@link https://www.postgresql.org/docs/current/errcodes-appendix.html PostgreSQL Error Codes}
 */
export enum PostgresErrorCode {
  UniqueViolation = '23505',
  // add more as needed
}
