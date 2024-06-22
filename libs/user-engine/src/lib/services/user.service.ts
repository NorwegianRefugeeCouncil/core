import { v4 as uuidv4 } from 'uuid';

import {
  defaultPermissionMap,
  User,
  UserDefinition,
  UserListItem,
  UserSchema,
} from '@nrcno/core-models';
import { getAuthorisationClient } from '@nrcno/core-authorisation';

import { ScimUser } from '../scim.types';
import { UserStore } from '../stores/user.store';

interface IUserService {
  mapScimUserToUser: (scimUser: Partial<ScimUser>) => Partial<UserDefinition>;
  mapUserToScimUser: (user: User | UserListItem) => ScimUser;
  create: (scimUser: ScimUser) => Promise<User>;
  get: (userId: string) => Promise<User | null>;
  getByOidcId: (oidcId: string) => Promise<User | null>;
  update: (
    userId: string,
    scimUserUpdate: Partial<ScimUser>,
  ) => Promise<User | null>;
  list: (startIndex: number, count: number) => Promise<UserListItem[]>;
  search: (
    attribute: string,
    value: string | string[],
  ) => Promise<UserListItem[]>;
  getCount: () => Promise<number>;
}

const mapScimUserToUser: IUserService['mapScimUserToUser'] = (scimUser) => {
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

const mapUserToScimUser: IUserService['mapUserToScimUser'] = (user) => {
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

const create: IUserService['create'] = async (scimUser) => {
  const user = {
    ...mapScimUserToUser(scimUser),
    id: uuidv4(),
  };
  const createdUser = await UserStore.create(user);
  return {
    ...createdUser,
    permissions: defaultPermissionMap,
  };
};

const get: IUserService['get'] = async (userId) => {
  const authorisationClient = getAuthorisationClient();

  const [user, permissions] = await Promise.all([
    UserStore.getById(userId),
    authorisationClient.permission.getForUser(userId),
  ]);

  if (!user) {
    return null;
  }

  return UserSchema.parse({
    ...user,
    permissions,
  });
};

const getByOidcId: IUserService['getByOidcId'] = async (oidcId) => {
  const authorisationClient = getAuthorisationClient();

  const user = await UserStore.getByOidcId(oidcId);
  if (!user) return null;

  const permissions = await authorisationClient.permission.getForUser(user.id);

  return UserSchema.parse({
    ...user,
    permissions,
  });
};

const update: IUserService['update'] = async (userId, scimUserUpdate) => {
  const authorisationClient = getAuthorisationClient();

  const userUpdate = mapScimUserToUser(scimUserUpdate);

  const [user, permissions] = await Promise.all([
    UserStore.update(userId, userUpdate),
    authorisationClient.permission.getForUser(userId),
  ]);

  if (!user) {
    return null;
  }

  return UserSchema.parse({
    ...user,
    permissions,
  });
};

const list: IUserService['list'] = async (startIndex, count) => {
  return UserStore.findAll(startIndex, count);
};

const search: IUserService['search'] = async (attribute, value) => {
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
