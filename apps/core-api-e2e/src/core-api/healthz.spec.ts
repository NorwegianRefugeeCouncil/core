import axios from 'axios';

describe('GET /healthz', () => {
  it('should return a 200', async () => {
    const res = await axios.get(`/healthz`);
    expect(res.status).toBe(200);
  });
});
