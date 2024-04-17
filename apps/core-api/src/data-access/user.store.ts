import { AlreadyExistsError } from '@nrcno/core-errors';
import { getDb, PostgresError, PostgresErrorCode } from '@nrcno/core-db';
import { User, UserSchema } from '@nrcno/core-models';

export const create = async (
  user: Omit<User, 'createdAt' | 'updatedAt'>,
): Promise<User> => {
  try {
    const db = getDb();

    const userToInsert = {
      ...user,
      emails: user.emails ? JSON.stringify(user.emails) : undefined,
    };
    const rows = await db('users').insert(userToInsert).returning('*');
    return UserSchema.parse(rows[0]);
  } catch (error) {
    if ((error as PostgresError).code === PostgresErrorCode.UniqueViolation) {
      throw new AlreadyExistsError('User already exists');
    }
    throw error;
  }
};

export const getById = async (userId: string): Promise<User | null> => {
  const db = getDb();

  const rows = await db('users').where('id', userId);
  return rows.length > 0 ? UserSchema.parse(rows[0]) : null;
};

export const getByOidcId = async (oidcId: string): Promise<User | null> => {
  const db = getDb();
  const rows = await db('users').where('oktaId', oidcId);
  return rows.length > 0 ? UserSchema.parse(rows[0]) : null;
};

export const update = async (
  userId: string,
  updatedUser: Partial<User>,
): Promise<User | null> => {
  const db = getDb();

  const userToUpdate = {
    ...updatedUser,
    emails: updatedUser.emails
      ? JSON.stringify(updatedUser.emails)
      : updatedUser.emails,
  };
  const rows = await db('users')
    .update(userToUpdate)
    .where('id', userId)
    .returning('*');
  return rows.length > 0 ? UserSchema.parse(rows[0]) : null;
};

export const findAll = async (
  startIndex?: number,
  count?: number,
  attribute?: string,
  value?: string,
): Promise<User[]> => {
  const db = getDb();

  let query = db('users');

  if (startIndex !== undefined) {
    query = query.offset(startIndex);
  }

  if (count !== undefined) {
    query = query.limit(count);
  }

  if (attribute !== undefined && value !== undefined) {
    query = query.where(attribute, '=', value);
  }

  const rows = await query;
  return rows.map((row) => UserSchema.parse(row));
};

export const countAll = async (): Promise<number> => {
  const db = getDb();

  const rows = await db('users').count();
  return Number(rows[0].count);
};
