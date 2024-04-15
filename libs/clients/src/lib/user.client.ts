import { AxiosError } from 'axios';
import { redirect } from 'react-router-dom';

import { User } from '@nrcno/core-models';

import { BaseClient, ClientConfig } from './base.client';

export class UserClient extends BaseClient<User> {
  constructor({ baseURL, cookie, loginURL }: ClientConfig<User>) {
    super({ baseURL, cookie, loginURL });
  }

  async getMe() {
    try {
      const res = await super.get('/me');
      console.log('ME RESP', res);
      return res;
    } catch (e) {
      console.log('ME ERROR', e);
      // return e as AxiosError;
      return super.login();
    }
  }
}
