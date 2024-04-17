import { v4 as uuid } from 'uuid';
import { faker } from '@faker-js/faker';

import { User, UserSchema } from './user.model';

describe('user model', () => {
  it('should parse a valid user', () => {
    const user: User = {
      id: faker.string.uuid(),
      oktaId: faker.string.alphanumeric(),
      userName: faker.internet.userName(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      displayName: faker.person.firstName(),
      emails: [
        {
          primary: true,
          value: faker.internet.email(),
          type: faker.helpers.arrayElement(['work', 'home']),
        },
      ],
      active: true,
      createdAt: faker.date.recent(),
      updatedAt: faker.date.recent(),
    };

    expect(UserSchema.parse(user)).toEqual(user);
  });

  it('should throw an error for an invalid user', () => {
    const user: User = {
      id: faker.string.alphanumeric(), // invalid uuid
      oktaId: faker.string.alphanumeric(),
      userName: faker.internet.userName(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      displayName: faker.person.firstName(),
      emails: [
        {
          primary: true,
          value: faker.internet.email(),
          type: faker.helpers.arrayElement(['work', 'home']),
        },
      ],
      active: true,
      createdAt: faker.date.recent(),
      updatedAt: faker.date.recent(),
    };

    const invalidUser = {
      ...user,
      id: 'invalid',
    };

    expect(() => UserSchema.parse(invalidUser)).toThrow();
  });
});
