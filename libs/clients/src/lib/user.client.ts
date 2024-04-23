import { User, UserSchema } from '@nrcno/core-models';

import { BaseClient, ClientConfig } from './base.client';

export class UserClient extends BaseClient<User> {
  constructor({ baseURL }: ClientConfig<User>) {
    super({ baseURL });
  }

  async getMe(): Promise<User> {
    const res = await super.get('/users/me');
    return UserSchema.parse(res.data);
  }
}
