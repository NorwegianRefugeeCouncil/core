import { v4 as uuidv4 } from 'uuid';

import { User } from '../models/user.model';
import {
  createUser as createUserInDb,
  getUserById,
  countAllUsers,
  listUsers as listUsersInDb,
  updateUser as updateUserInDb,
  searchUsers as searchUsersInDb,
} from '../data-access/user.da';
import { ScimUser } from '../types/scim.types';

const mapScimUserToUser = (scimUser: Partial<ScimUser>): Partial<User> => {
  const { id, userName, name, emails, active } = scimUser;

  const user: Partial<User> = {
    id,
    userName,
    active,
    emails,
  };

  if (name?.givenName) {
    user.firstName = name.givenName;
  }

  if (name?.familyName) {
    user.lastName = name.familyName;
  }

  return user;
};

export const createUser = async (scimUser: ScimUser): Promise<User> => {
  const user = mapScimUserToUser(scimUser);
  user.id = uuidv4();
  return createUserInDb(user);
};

export const getUser = async (userId: string): Promise<User | null> => {
  return getUserById(userId);
};

export const updateUser = async (
  userId: string,
  scimUserUpdate: Partial<ScimUser>,
): Promise<User | null> => {
  const userUpdate = mapScimUserToUser(scimUserUpdate);
  return updateUserInDb(userId, userUpdate);
};

export const listUsers = async (
  startIndex: number,
  count: number,
): Promise<User[]> => {
  return listUsersInDb(startIndex, count);
};

export const searchUsers = async (
  attribute: string,
  value: string,
): Promise<User[]> => {
  return searchUsersInDb(attribute, value);
};

export const getUserCount = async (): Promise<number> => {
  return countAllUsers();
};
