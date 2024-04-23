import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

import { BaseClient } from './base.client';

describe('coreClients', () => {
  let client: BaseClient;
  let mock: any;

  beforeEach(() => {
    const axiosInstance = axios.create();
    mock = new MockAdapter(axiosInstance);
    client = new BaseClient(axiosInstance);

    mock.onGet('/foo').reply(200, {
      a: 1,
    });

    mock.onPost('/foo').reply(202, {
      b: 2,
    });

    mock.onPut('/foo').reply(203, {
      c: 3,
    });

    mock.onPatch('/foo').reply(204, {
      d: 4,
    });

    mock.onDelete('/foo').reply(205, {
      e: 5,
    });
  });

  afterEach(() => {
    mock.restore();
  });

  it('should get', async () => {
    const res = await client.get('/foo');
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ a: 1 });
    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe('/foo');
  });

  it('should post', async () => {
    const res = await client.post('/foo', { a: 1 });
    expect(res.status).toBe(202);
    expect(res.data).toEqual({ b: 2 });
    expect(mock.history.post.length).toBe(1);
    expect(mock.history.post[0].url).toBe('/foo');
    expect(mock.history.post[0].data).toBe('{"a":1}');
  });

  it('should put', async () => {
    const res = await client.put('/foo', { a: 1 });
    expect(res.status).toBe(203);
    expect(res.data).toEqual({ c: 3 });
    expect(mock.history.put.length).toBe(1);
    expect(mock.history.put[0].url).toBe('/foo');
    expect(mock.history.put[0].data).toBe('{"a":1}');
  });

  it('should patch', async () => {
    const res = await client.patch('/foo', { a: 1 });
    expect(res.status).toBe(204);
    expect(res.data).toEqual({ d: 4 });
    expect(mock.history.patch.length).toBe(1);
    expect(mock.history.patch[0].url).toBe('/foo');
    expect(mock.history.patch[0].data).toBe('{"a":1}');
  });

  it('should delete', async () => {
    const res = await client.delete('/foo');
    expect(res.status).toBe(205);
    expect(res.data).toEqual({ e: 5 });
    expect(mock.history.delete.length).toBe(1);
    expect(mock.history.delete[0].url).toBe('/foo');
  });
});
