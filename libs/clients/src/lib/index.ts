import { UserClient } from './user.client';

export * from './prm';
export { BaseClient } from './base.client';
export { UserClient } from './user.client';

export const clients = {
  user: UserClient,
};
