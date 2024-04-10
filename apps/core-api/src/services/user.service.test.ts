import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../models/user.model';
import {
  createUser as createUserInDb,
  updateUser as updateUserInDb,
} from '../data-access/user.da';

import { createUser, updateUser } from './user.service';

jest.mock('../data-access/user.da');

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('user service', () => {
  describe('createUser', () => {
    it('should create a user', async () => {
      const userId = faker.string.uuid();
      (uuidv4 as jest.Mock).mockReturnValue(userId);

      const scimUser = {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        externalId: faker.string.uuid(),
        userName: faker.internet.userName(),
        name: {
          givenName: faker.person.firstName(),
          familyName: faker.person.lastName(),
        },
        displayName: faker.person.firstName(),
        emails: [
          {
            value: faker.internet.email(),
            primary: true,
            type: faker.helpers.arrayElement(['work', 'home']),
          },
        ],
        active: true,
      };

      const mappedUser = {
        id: userId,
        oktaId: scimUser.externalId,
        userName: scimUser.userName,
        firstName: scimUser.name.givenName,
        lastName: scimUser.name.familyName,
        displayName: scimUser.displayName,
        emails: scimUser.emails,
        active: scimUser.active,
      };

      const expectedUser: User = {
        ...mappedUser,
        createdAt: faker.date.recent(),
        updatedAt: faker.date.recent(),
      };

      (createUserInDb as jest.Mock).mockResolvedValue(expectedUser);

      const createdUser = await createUser(scimUser);

      expect(createUserInDb).toHaveBeenCalledWith(mappedUser);
      expect(createdUser).toEqual(expectedUser);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const userId = faker.string.uuid();

      const scimUserUpdate = {
        name: {
          givenName: faker.person.firstName(),
          familyName: faker.person.lastName(),
        },
      };

      const mappedUserUpdate = {
        firstName: scimUserUpdate.name.givenName,
        lastName: scimUserUpdate.name.familyName,
      };

      const expectedUser: User = {
        id: userId,
        oktaId: faker.string.uuid(),
        userName: faker.internet.userName(),
        firstName: scimUserUpdate.name.givenName,
        lastName: scimUserUpdate.name.familyName,
        displayName: faker.person.firstName(),
        emails: [
          {
            value: faker.internet.email(),
            primary: true,
            type: faker.helpers.arrayElement(['work', 'home']),
          },
        ],
        active: true,
        createdAt: faker.date.recent(),
        updatedAt: faker.date.recent(),
      };

      (updateUserInDb as jest.Mock).mockResolvedValue(expectedUser);

      const updatedUser = await updateUser(userId, scimUserUpdate);

      expect(updateUserInDb).toHaveBeenCalledWith(userId, mappedUserUpdate);
      expect(updatedUser).toEqual(expectedUser);
    });
  });
});
