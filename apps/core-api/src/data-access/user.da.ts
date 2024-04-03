import { db, PostgresError, PostgresErrorCode } from '@nrcno/db';

import { User } from '../models/user.model';
import { AlreadyExistsError } from '../errors';

export const createUser = async (user: Partial<User>): Promise<User> => {
  try {
    const rows = await db('users').insert(user).returning('*');
    return new User(rows[0]);
  } catch (error) {
    if ((error as PostgresError).code === PostgresErrorCode.UniqueViolation) {
      throw new AlreadyExistsError('User already exists');
    }
    throw error;
  }
};

export const getUserById = async (userId: string): Promise<User | null> => {
  const rows = await db('users').where('id', userId);
  return rows.length > 0 ? new User(rows[0]) : null;
};

export const updateUser = async (
  userId: string,
  updatedUser: Partial<User>,
): Promise<User | null> => {
  const row = await db('users')
    .update(updatedUser)
    .where('id', userId)
    .returning('*');
  return row.length > 0 ? new User(row[0]) : null;
};

export const listUsers = async (
  startIndex: number,
  count: number,
): Promise<User[]> => {
  const rows = await db('users').offset(startIndex).limit(count);
  return rows.map((row) => new User(row));
};

export const searchUsers = async (
  attribute: string,
  value: string,
): Promise<User[]> => {
  const rows = await db('users').where(attribute, '=', value);
  return rows.map((row) => new User(row));
};

export const countAllUsers = async (): Promise<number> => {
  const rows = await db('users').count();
  return Number(rows[0].count);
};
