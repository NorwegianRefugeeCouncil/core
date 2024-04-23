import axios from 'axios';

const axiosInstance = axios.create({
  validateStatus: () => true,
});

describe('POST /api/prm/:entityType', () => {
  it('should return 400 if the entity type is invalid', async () => {
    const { status } = await axiosInstance.post('/api/prm/invalid', {});
    expect(status).toBe(400);
  });
});
