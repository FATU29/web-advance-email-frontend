import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Create axios instance
const createAxiosInstance = (baseURL?: string): AxiosInstance => {
  const instance = axios.create({
    baseURL: baseURL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      // Add auth token if available
      // const token = getToken();
      // if (token) {
      //   config.headers.Authorization = `Bearer ${token}`;
      // }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error) => {
      // Handle common errors
      if (error.response?.status === 401) {
        // Handle unauthorized
        // redirectToLogin();
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Main axios instance
export const axiosBI = createAxiosInstance();

// Custom response type
export type CustomAxiosResponse<T = any> = AxiosResponse<T>;

// Export axios instance creator for different base URLs
export { createAxiosInstance };
