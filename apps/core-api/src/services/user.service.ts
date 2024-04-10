import { v4 as uuidv4 } from 'uuid';

import { User } from '../models/user.model';
import * as UserStore from '../data-access/user.store';
import { ScimUser } from '../types/scim.types';

const mapScimUserToUser = (scimUser: Partial<ScimUser>): Partial<User> => {
  const { id, externalId, userName, displayName, name, emails, active } =
    scimUser;

  return {
    id,
    oktaId: externalId,
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
  return UserStore.create(user as Omit<User, 'createdAt' | 'updatedAt'>);
};

export const getUser = async (userId: string): Promise<User | null> => {
  return UserStore.getById(userId);
};

export const updateUser = async (
  userId: string,
  scimUserUpdate: Partial<ScimUser>,
): Promise<User | null> => {
  const userUpdate = mapScimUserToUser(scimUserUpdate);
  return UserStore.update(userId, userUpdate);
};

export const listUsers = async (
  startIndex: number,
  count: number,
): Promise<User[]> => {
  return UserStore.findAll(startIndex, count);
};

export const searchUsers = async (
  attribute: string,
  value: string,
): Promise<User[]> => {
  return UserStore.findAll(undefined, undefined, attribute, value);
};

export const getUserCount = async (): Promise<number> => {
  return UserStore.countAll();
};
