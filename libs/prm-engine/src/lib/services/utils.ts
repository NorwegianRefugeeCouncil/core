import { getDb } from '@nrcno/core-db';

export const createTrx = async () => {
  const db = getDb();
  return await db.transaction();
};
