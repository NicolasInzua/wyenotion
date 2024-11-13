import axios, { AxiosError } from 'axios';
import { ApiError } from '@/services/api';

const baseURL =
  process.env.PHOENIX_ENDPOINT || process.env.NEXT_PUBLIC_PHOENIX_ENDPOINT;

const axiosInstance = axios.create({
  baseURL,
  httpAgent: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const apiError: ApiError = {
      message: error.message || 'An unexpected error occurred',
      code: error.code || 'UNKNOWN_ERROR',
      status: error.status || 500,
    };

    return Promise.reject(apiError);
  }
);

export default axiosInstance;
