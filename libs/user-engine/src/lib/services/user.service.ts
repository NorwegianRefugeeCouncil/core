import { v4 as uuidv4 } from 'uuid';

import { PermissionMap, User } from '@nrcno/core-models';
import { getAuthorisationClient } from '@nrcno/core-authorisation';

import { ScimUser } from '../scim.types';
import * as UserStore from '../stores/user.store';

interface IUserService {
  mapScimUserToUser: (scimUser: Partial<ScimUser>) => Partial<User>;
  mapUserToScimUser: (user: User) => ScimUser;
  create: (scimUser: ScimUser) => Promise<User>;
  get: (
    userId: string,
  ) => Promise<(User & { permissions: PermissionMap }) | null>;
  getByOidcId: (
    oidcId: string,
  ) => Promise<(User & { permissions: PermissionMap }) | null>;
  update: (
    userId: string,
    scimUserUpdate: Partial<ScimUser>,
  ) => Promise<User | null>;
  list: (startIndex: number, count: number) => Promise<User[]>;
  search: (attribute: string, value: string | string[]) => Promise<User[]>;
  getCount: () => Promise<number>;
}

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

const mapUserToScimUser = (user: User): ScimUser => {
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

const create = async (scimUser: ScimUser): Promise<User> => {
  const user = {
    ...mapScimUserToUser(scimUser),
    id: uuidv4(),
  };
  return UserStore.create(user as Omit<User, 'createdAt' | 'updatedAt'>);
};

const get = async (
  userId: string,
): Promise<(User & { permissions: PermissionMap }) | null> => {
  const authorisationClient = getAuthorisationClient();

  const [user, permissions] = await Promise.all([
    UserStore.getById(userId),
    authorisationClient.permission.getForUser(userId),
  ]);

  if (!user) {
    return null;
  }

  return {
    ...user,
    permissions,
  };
};

const getByOidcId = async (
  oidcId: string,
): Promise<(User & { permissions: PermissionMap }) | null> => {
  const authorisationClient = getAuthorisationClient();
  const user = await UserStore.getByOidcId(oidcId);
  if (!user) return null;
  const permissions = await authorisationClient.permission.getForUser(user.id);
  return {
    ...user,
    permissions,
  };
};

const update = async (
  userId: string,
  scimUserUpdate: Partial<ScimUser>,
): Promise<User | null> => {
  const userUpdate = mapScimUserToUser(scimUserUpdate);
  return UserStore.update(userId, userUpdate);
};

const list = async (startIndex: number, count: number): Promise<User[]> => {
  return UserStore.findAll(startIndex, count);
};

const search = async (
  attribute: string,
  value: string | string[],
): Promise<User[]> => {
  return UserStore.findAll(undefined, undefined, attribute, value);
};

const getCount = async (): Promise<number> => {
  return UserStore.countAll();
};

export const UserService: IUserService = {
  mapScimUserToUser,
  mapUserToScimUser,
  create,
  get,
  getByOidcId,
  update,
  list,
  search,
  getCount,
};