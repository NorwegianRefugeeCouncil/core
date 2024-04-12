import knex, { Knex } from 'knex';

import { config } from '../../knexfile';

import { postProcessResponse, wrapIdentifier } from './db-utils';

config.postProcessResponse = postProcessResponse;
config.wrapIdentifier = wrapIdentifier;

export const getDb = (connectionConfig: Knex.Config['connection']) =>
  knex({
    ...config,
    connection: connectionConfig,
  });

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
