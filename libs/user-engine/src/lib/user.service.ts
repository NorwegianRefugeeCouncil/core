import { v4 as uuidv4 } from 'uuid';

import { User } from '@nrcno/core-models';

import * as UserStore from './user.store';
import { ScimUser } from './scim.types';

export const mapScimUserToUser = (
  scimUser: Partial<ScimUser>,
): Partial<User> => {
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

export const mapUserToScimUser = (user: User): ScimUser => {
  const {
    id,
    oktaId,
    userName,
    firstName,
    lastName,
    displayName,
    emails,
    active,
  } = user;

  const scimUser: ScimUser = {
    schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
    id,
    externalId: oktaId,
    userName,
    displayName,
    active,
    emails,
  };

  if (firstName || lastName) {
    scimUser.name = {
      givenName: firstName,
      familyName: lastName,
    };
  }

  return scimUser;
};

export const create = async (scimUser: ScimUser): Promise<User> => {
  const user = {
    ...mapScimUserToUser(scimUser),
    id: uuidv4(),
  };
  return UserStore.create(user as Omit<User, 'createdAt' | 'updatedAt'>);
};

export const get = async (userId: string): Promise<User | null> => {
  return UserStore.getById(userId);
};

export const getByOidcId = async (oidcId: string): Promise<User | null> => {
  return UserStore.getByOidcId(oidcId);
};

export const update = async (
  userId: string,
  scimUserUpdate: Partial<ScimUser>,
): Promise<User | null> => {
  const userUpdate = mapScimUserToUser(scimUserUpdate);
  return UserStore.update(userId, userUpdate);
};

export const list = async (
  startIndex: number,
  count: number,
): Promise<User[]> => {
  return UserStore.findAll(startIndex, count);
};

export const search = async (
  attribute: string,
  value: string,
): Promise<User[]> => {
  return UserStore.findAll(undefined, undefined, attribute, value);
};

export const getCount = async (): Promise<number> => {
  return UserStore.countAll();
};
