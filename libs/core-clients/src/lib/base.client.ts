import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';

export interface ClientConfig<Data> extends AxiosRequestConfig<Data> {
  domain?: string;
}

type ClientRequest<Data> = (
  url: string,
  params?: Partial<Data>,
) => Promise<
  AxiosResponse<ClientConfig<Data>, Data> | AxiosError<ClientConfig<Data>, Data>
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

  constructor({ baseURL, ...options }: ClientConfig<Data>) {
    this.client = axios.create({
      baseURL,
      headers: { 'Content-Type': 'application/json' },
      ...options,
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
