import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { redirect } from 'react-router-dom';

export interface ClientConfig<Data> extends AxiosRequestConfig<Data> {
  cookie?: string;
  loginURL: string;
}

type ClientRequest<Data> = (
  url: string,
  params?: Partial<Data>,
) => Promise<
  AxiosResponse<Data, ClientConfig<Data>> | AxiosError<Data, ClientConfig<Data>>
>;

interface IClient<Data> {
  get: ClientRequest<Data>;
  post: ClientRequest<Data>;
  put: ClientRequest<Data>;
  patch: ClientRequest<Data>;
  delete: ClientRequest<Data>;
}

export class BaseClient<Data> implements IClient<Data> {
  client: AxiosInstance;
  loginURL: string;

  constructor({ baseURL, cookie, loginURL, ...config }: ClientConfig<Data>) {
    this.loginURL = loginURL;
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        Authorization: cookie,
      },
      ...config,
    });
  }

  async login() {
    return axios.get(`${this.loginURL}/login`, { method: 'GET' });
  }

  async get(url: string, params?: Partial<Data>) {
    return this.client.get(url, params);
  }

  async post(url: string, params?: Partial<Data>) {
    return this.client.post(url, params);
  }

  async put(url: string, params?: Partial<Data>) {
    return this.client.put(url, params);
  }

  async patch(url: string, params?: Partial<Data>) {
    return this.client.patch(url, params);
  }

  async delete(url: string, params?: Partial<Data>) {
    return this.client.delete(url, params);
  }
}
