import * as path from 'path';
import { Knex } from 'knex';

import { getDb } from '@nrcno/core-db';

let db: Knex;

beforeAll(async () => {
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };
  db = getDb(config);
  await db.migrate.latest({
    loadExtensions: ['.js'],
  });
  await db.seed.run({
    loadExtensions: ['.js'],
    directory: path.join(db.client.config.seeds.directory, 'common'),
  });

  (global as any).db = db;
});

afterAll(async () => {
  await db.destroy();
});
