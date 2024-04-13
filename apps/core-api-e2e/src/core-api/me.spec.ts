import axios from 'axios';

describe('GET /api/me', () => {
  it('should return a message', async () => {
    const res = await axios.get(`/api/me`);

    expect(res.status).toBe(200);

    expect(res.data).toEqual({
      id: expect.any(String),
      oktaId: expect.any(String),
      userName: expect.any(String),
      firstName: expect.any(String),
      lastName: expect.any(String),
      displayName: expect.any(String),
      emails: expect.arrayContaining([
        {
          primary: expect.any(Boolean),
          value: expect.any(String),
          type: expect.any(String),
        },
      ]),
      active: expect.any(Boolean),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });
});
