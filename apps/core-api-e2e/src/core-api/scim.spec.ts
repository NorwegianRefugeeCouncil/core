import axios from 'axios';
import { faker } from '@faker-js/faker';

const createScimUser = () => {
  return {
    schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
    userName: faker.internet.userName(),
    name: {
      givenName: faker.person.firstName(),
      familyName: faker.person.lastName(),
    },
    emails: [
      {
        primary: true,
        value: faker.internet.email(),
        type: faker.helpers.arrayElement(['work', 'home']),
      },
    ],
    displayName: faker.internet.displayName(),
    active: true,
  };
};

/**
 * These tests follow Okta SCIM 2.0 User Operations flows
 * @see {@link https://developer.okta.com/docs/reference/scim/scim-20/#scim-user-operations}
 */
describe('SCIM E2E', () => {
  describe('Create User', () => {
    test('should check that a user does not exist and then create it', async () => {
      const user = createScimUser();
      const listResponse = await axios.get(
        `/scim/v2/Users?filter=userName eq ${user.userName}&startIndex=1&count=100`,
      );

      expect(listResponse.status).toBe(200);
      expect(listResponse.data).toEqual({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
        totalResults: 0,
        startIndex: 1,
        itemsPerPage: 100,
        Resources: [],
      });

      const createUserResponse = await axios.post('/scim/v2/Users', user);
      expect(createUserResponse.status).toBe(201);
      expect(createUserResponse.data).toEqual(
        expect.objectContaining({ ...user, id: expect.any(String) }),
      );
    });

    test('should return an error if the user already exists', async () => {
      const user = createScimUser();
      const createUserResponse = await axios.post('/scim/v2/Users', user);
      expect(createUserResponse.status).toBe(201);

      await expect(axios.post('/scim/v2/Users', user)).rejects.toMatchObject({
        response: {
          status: 409,
          data: {
            schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
            detail: 'User already exists in the database.',
            status: 409,
          },
        },
      });
    });
  });

  describe('Retrieve list of users', () => {
    beforeAll(async () => {
      await axios.post('/scim/v2/Users', createScimUser());
    });

    test('should return a list of users', async () => {
      const listResponse = await axios.get(
        '/scim/v2/Users?startIndex=1&count=100',
      );
      expect(listResponse.status).toBe(200);
      expect(listResponse.data).toEqual({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
        totalResults: listResponse.data.Resources.length,
        startIndex: 1,
        itemsPerPage: 100,
        Resources: expect.any(Array),
      });
    });
  });

  describe('Retrieve a specific user', () => {
    let userId: string;

    beforeAll(async () => {
      const user = createScimUser();
      const createUserResponse = await axios.post('/scim/v2/Users', user);
      userId = createUserResponse.data.id;
    });

    test('should return a user', async () => {
      const userResponse = await axios.get(`/scim/v2/Users/${userId}`);
      expect(userResponse.status).toBe(200);
      expect(userResponse.data).toEqual(
        expect.objectContaining({ id: userId }),
      );
    });

    test('should return an error if the user does not exist', async () => {
      const nonExistingUserId = faker.string.uuid();
      await expect(
        axios.get(`/scim/v2/Users/${nonExistingUserId}`),
      ).rejects.toMatchObject({
        response: {
          status: 404,
          data: {
            schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
            detail: 'User not found',
            status: 404,
          },
        },
      });
    });
  });

  describe('Update a specific user (PUT)', () => {
    let userId: string;

    beforeAll(async () => {
      const user = createScimUser();
      const createUserResponse = await axios.post('/scim/v2/Users', user);
      userId = createUserResponse.data.id;
    });

    test('should update a user', async () => {
      const userResponse = await axios.get(`/scim/v2/Users/${userId}`);
      expect(userResponse.status).toBe(200);

      userResponse.data.displayName = faker.internet.displayName();
      const updateUserResponse = await axios.put(
        `/scim/v2/Users/${userId}`,
        userResponse.data,
      );
      expect(updateUserResponse.status).toBe(200);
      expect(updateUserResponse.data).toEqual(userResponse.data);
    });

    test('should return an error if the user does not exist', async () => {
      const nonExistingUserId = faker.string.uuid();
      await expect(
        axios.put(`/scim/v2/Users/${nonExistingUserId}`, createScimUser()),
      ).rejects.toMatchObject({
        response: {
          status: 404,
          data: {
            schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
            detail: 'User not found',
            status: 404,
          },
        },
      });
    });
  });

  describe('Update a specific user (PATCH)', () => {
    let userId: string;

    beforeAll(async () => {
      const user = createScimUser();
      const createUserResponse = await axios.post('/scim/v2/Users', user);
      userId = createUserResponse.data.id;
    });

    test('should update a user', async () => {
      const userResponse = await axios.get(`/scim/v2/Users/${userId}`);
      expect(userResponse.status).toBe(200);

      const updateUserResponse = await axios.patch(`/scim/v2/Users/${userId}`, {
        schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
        Operations: [
          {
            op: 'replace',
            value: {
              active: false,
            },
          },
        ],
      });
      expect(updateUserResponse.status).toBe(200);
      expect(updateUserResponse.data).toEqual({
        ...userResponse.data,
        active: false,
      });
    });

    test('should return an error if the user does not exist', async () => {
      const nonExistingUserId = faker.string.uuid();
      await expect(
        axios.patch(`/scim/v2/Users/${nonExistingUserId}`, {
          schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
          Operations: [
            {
              op: 'replace',
              value: {
                active: false,
              },
            },
          ],
        }),
      ).rejects.toMatchObject({
        response: {
          status: 404,
          data: {
            schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
            detail: 'User not found',
            status: 404,
          },
        },
      });
    });
  });
});
