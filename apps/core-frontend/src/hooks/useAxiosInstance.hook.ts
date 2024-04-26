import axios from 'axios';
import { ZodError } from 'zod';

export const useAxiosInstance = () => {
  const axiosInstance = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });

  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response.status === 401) {
        window.location.href = `/login`;
      }
      if (error.response.status === 400) {
        try {
          throw new ZodError(error.response.data);
        } catch {
          throw error;
        }
      }
      throw error;
    },
  );

  return axiosInstance;
};
