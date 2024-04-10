import { v4 as uuidv4 } from 'uuid';

import { User } from '../models/user.model';
import {
  createUser as createUserInDb,
  getUserById,
  getUsers,
  countAllUsers,
  updateUser as updateUserInDb,
} from '../data-access/user.da';
import { ScimUser } from '../types/scim.types';

const mapScimUserToUser = (scimUser: Partial<ScimUser>): Partial<User> => {
  const { id, userName, displayName, name, emails, active } = scimUser;

  return {
    id,
    userName,
    displayName,
    active,
    emails,
    firstName: name?.givenName,
    lastName: name?.familyName,
  };
};

export const createUser = async (scimUser: ScimUser): Promise<User> => {
  const user = {
    ...mapScimUserToUser(scimUser),
    id: uuidv4(),
  };
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
  return getUsers(startIndex, count);
};

export const searchUsers = async (
  attribute: string,
  value: string,
): Promise<User[]> => {
  return getUsers(undefined, undefined, attribute, value);
};

export const getUserCount = async (): Promise<number> => {
  return countAllUsers();
};
