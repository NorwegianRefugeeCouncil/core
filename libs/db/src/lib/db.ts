import knex from 'knex';

import { config } from '../../knexfile';

import { postProcessResponse, wrapIdentifier } from './db-utils';

config.postProcessResponse = postProcessResponse;
config.wrapIdentifier = wrapIdentifier;

export const db = knex(config);

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
