import axios from 'axios';
import { ulid } from 'ulidx';

import { HouseholdGenerator } from '@nrcno/core-test-utils';

const axiosInstance = axios.create({
  validateStatus: () => true,
});

describe('Households', () => {
  describe('POST /households', () => {
    it('should create a household', async () => {
      const householdDefinition = HouseholdGenerator.generateDefinition();
      const res = await axiosInstance.post(
        `/api/prm/households`,
        householdDefinition,
      );

      expect(res.status).toBe(201);
      expect(res.data).toEqual({
        ...householdDefinition,
        id: expect.any(String),
      });
    });
  });

  describe('GET /households/:id', () => {
    let householdId: string;
    const householdDefinition = HouseholdGenerator.generateDefinition();

    beforeAll(async () => {
      const res = await axiosInstance.post(
        `/api/prm/households`,
        householdDefinition,
      );

      householdId = res.data.id;
    });

    it('should return a household', async () => {
      const res = await axiosInstance.get(`/api/prm/households/${householdId}`);

      expect(res.status).toBe(200);
      expect(res.data).toEqual({ ...householdDefinition, id: householdId });
    });

    it('should return an error if the household does not exist', async () => {
      const response = await axiosInstance.get(`/api/prm/households/${ulid()}`);

      expect(response.status).toBe(404);
    });

    it('should return 404 if the household id is invalid', async () => {
      const response = await axiosInstance.get(`/api/prm/households/invalid`);

      expect(response.status).toBe(404);
    });
  });
});
