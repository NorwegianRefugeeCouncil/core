import axios, {
  CreateAxiosDefaults,
  AxiosInstance,
  AxiosResponse,
} from 'axios';

export type ClientConfig = CreateAxiosDefaults;

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
  client: AxiosInstance;

  constructor({ baseURL, ...config }: ClientConfig) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
      ...config,
    });
  }

  async get(url: string, params?: any): Promise<AxiosResponse<unknown>> {
    return this.client.get(url, params);
  }

  async post(
    url: string,
    data?: any,
    params?: any,
  ): Promise<AxiosResponse<unknown>> {
    return this.client.post(url, params);
  }

  async put(
    url: string,
    data?: any,
    params?: any,
  ): Promise<AxiosResponse<unknown>> {
    return this.client.put(url, params);
  }

  async patch(
    url: string,
    data?: any,
    params?: any,
  ): Promise<AxiosResponse<unknown>> {
    return this.client.patch(url, params);
  }

  async delete(url: string, params?: any): Promise<AxiosResponse<unknown>> {
    return this.client.delete(url, params);
  }
}
