import { Knex } from 'knex';

export const config: Knex.Config = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'core',
  },
  migrations: {
    directory: './libs/db/migrations',
  },
  seeds: {
    directory: './libs/db/seeds',
  },
};
