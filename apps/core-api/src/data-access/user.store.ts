import { db, PostgresError, PostgresErrorCode } from '@nrcno/db';

import { User, UserSchema } from '../models/user.model';
import { AlreadyExistsError } from '../errors';

export const create = async (
  user: Omit<User, 'createdAt' | 'updatedAt'>,
): Promise<User> => {
  try {
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
  const rows = await db('users').where('id', userId);
  return rows.length > 0 ? UserSchema.parse(rows[0]) : null;
};

export const update = async (
  userId: string,
  updatedUser: Partial<User>,
): Promise<User | null> => {
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
  const rows = await db('users').count();
  return Number(rows[0].count);
};
