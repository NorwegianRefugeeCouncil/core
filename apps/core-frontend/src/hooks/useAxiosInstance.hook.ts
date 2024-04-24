import axios from 'axios';

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
      return error;
    },
  );

  return axiosInstance;
};
