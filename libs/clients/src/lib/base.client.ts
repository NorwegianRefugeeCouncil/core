import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';

export type ClientConfig<Data> = AxiosRequestConfig<Data>;

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

  constructor({ baseURL, ...config }: ClientConfig<Data>) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
      ...config,
    });
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
