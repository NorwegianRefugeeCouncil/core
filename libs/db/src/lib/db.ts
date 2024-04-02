import knex from 'knex';

import { config } from '../../knexfile';

import { postProcessResponse, wrapIdentifier } from './db-utils';

config.postProcessResponse = postProcessResponse;
config.wrapIdentifier = wrapIdentifier;

export const db = knex(config);
