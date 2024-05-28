import { AxiosInstance, AxiosResponse } from 'axios';

interface IClient {
  get: (url: string, params?: any) => Promise<AxiosResponse<unknown>>;
  post: (
    url: string,
    data?: any,
    params?: any,
  ) => Promise<AxiosResponse<unknown>>;
  put: (
    url: string,
    data?: any,
    params?: any,
  ) => Promise<AxiosResponse<unknown>>;
  patch: (
    url: string,
    data?: any,
    params?: any,
  ) => Promise<AxiosResponse<unknown>>;
  delete: (url: string, params?: any) => Promise<AxiosResponse<unknown>>;
}

export class BaseClient implements IClient {
  public client: AxiosInstance;

  constructor(instance: AxiosInstance) {
    this.client = instance;
  }

  async get(url: string, params?: any): Promise<AxiosResponse<unknown>> {
    return this.client.get(url, params);
  }

  async post(
    url: string,
    data?: any,
    params?: any,
  ): Promise<AxiosResponse<unknown>> {
    return this.client.post(url, data, params);
  }

  async put(
    url: string,
    data?: any,
    params?: any,
  ): Promise<AxiosResponse<unknown>> {
    return this.client.put(url, data, params);
  }

  async patch(
    url: string,
    data?: any,
    params?: any,
  ): Promise<AxiosResponse<unknown>> {
    return this.client.patch(url, data, params);
  }

  async delete(url: string, params?: any): Promise<AxiosResponse<unknown>> {
    return this.client.delete(url, params);
  }
}
