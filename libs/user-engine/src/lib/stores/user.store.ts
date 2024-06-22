import { z } from 'zod';

import { AlreadyExistsError } from '@nrcno/core-errors';
import { getDb, PostgresError, PostgresErrorCode } from '@nrcno/core-db';
import {
  UserDefinition,
  User,
  UserSchema,
  UserListItem,
  UserListItemSchema,
} from '@nrcno/core-models';

const DBUserSchema = UserSchema.omit({
  permissions: true,
});
type DBUser = z.infer<typeof DBUserSchema>;

interface IUserStore {
  create: (user: Partial<UserDefinition>) => Promise<DBUser>;
  getById: (userId: string) => Promise<DBUser | null>;
  getByOidcId: (oidcId: string) => Promise<DBUser | null>;
  update: (
    userId: string,
    updatedUser: Partial<User>,
  ) => Promise<DBUser | null>;
  findAll: (
    startIndex?: number,
    count?: number,
    attribute?: string,
    value?: string | string[],
  ) => Promise<UserListItem[]>;
  countAll: () => Promise<number>;
}

const create: IUserStore['create'] = async (user) => {
  try {
    const db = getDb();

    const userToInsert = {
      ...user,
      emails: user.emails ? JSON.stringify(user.emails) : undefined,
    };
    const rows = await db('users').insert(userToInsert).returning('*');
    return DBUserSchema.parse(rows[0]);
  } catch (error) {
    if ((error as PostgresError).code === PostgresErrorCode.UniqueViolation) {
      throw new AlreadyExistsError('User already exists');
    }
    throw error;
  }
};

const getById: IUserStore['getById'] = async (userId) => {
  const db = getDb();

  const rows = await db('users').where('id', userId);
  return rows.length > 0 ? DBUserSchema.parse(rows[0]) : null;
};

const getByOidcId: IUserStore['getByOidcId'] = async (oidcId) => {
  const db = getDb();
  const rows = await db('users').where('oktaId', oidcId);
  return rows.length > 0 ? DBUserSchema.parse(rows[0]) : null;
};

const update: IUserStore['update'] = async (userId, updatedUser) => {
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
  return rows.length > 0 ? DBUserSchema.parse(rows[0]) : null;
};

const findAll: IUserStore['findAll'] = async (
  startIndex,
  count,
  attribute,
  value,
) => {
  const db = getDb();

  let query = db('users');

  if (startIndex !== undefined) {
    query = query.offset(startIndex);
  }

  if (count !== undefined) {
    query = query.limit(count);
  }

  if (attribute !== undefined && value !== undefined) {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return [];
      }
      query = query.whereIn(attribute, value);
    } else {
      query = query.where(attribute, '=', value);
    }
  }

  const rows = await query;
  return z.array(UserListItemSchema).parse(rows);
};

const countAll: IUserStore['countAll'] = async () => {
  const db = getDb();

  const rows = await db('users').count();
  return Number(rows[0].count);
};

export const UserStore: IUserStore = {
  create,
  getById,
  getByOidcId,
  update,
  findAll,
  countAll,
};
