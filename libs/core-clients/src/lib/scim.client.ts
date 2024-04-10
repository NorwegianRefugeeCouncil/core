import { User } from '@nrcno/core-models';

import { BaseClient, ClientConfig } from './base.client';

export class ScimClient extends BaseClient<User> {
  constructor({ baseURL }: ClientConfig<User>) {
    super({ baseURL, url: '/scim/v2' });
  }

  async getUser({ id }: Partial<User>) {
    return super.get('/Users/' + id);
  }
}
