import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosError,
} from 'axios';
import { getRefreshToken, setTokens, removeTokens, getAuthHeader } from './jwt';

//==================== REGION TYPES ====================
interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface PendingRequest {
  resolve: (value?: string | null) => void;
  reject: (error?: AxiosError) => void;
}
//====================================================

//==================== REGION CONSTANTS ====================
const REFRESH_TOKEN_ENDPOINT = '/auth/refresh'; // Update this to your refresh token endpoint
const LOGIN_PATH = '/login';
//====================================================

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
let failedQueue: PendingRequest[] = [];

// Process queued requests after token refresh
const processQueue = (
  error: AxiosError | null,
  token: string | null = null
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Redirect to login page
const redirectToLogin = () => {
  if (typeof window !== 'undefined') {
    // Clear tokens before redirect
    removeTokens();
    window.location.href = LOGIN_PATH;
  }
};

// Refresh access token using refresh token
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    redirectToLogin();
    return null;
  }

  // Create a new axios instance without interceptors to avoid infinite loop
  const refreshAxios = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  try {
    const response = await refreshAxios.post<RefreshTokenResponse>(
      REFRESH_TOKEN_ENDPOINT,
      {
        refreshToken,
      }
    );

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    // Update tokens in cookies
    setTokens(accessToken, newRefreshToken);

    return accessToken;
  } catch (error) {
    // Refresh token expired (401) or other error -> redirect to login
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
      // Refresh token expired
      redirectToLogin();
    }
    return null;
  }
};

// Create axios instance
const createAxiosInstance = (baseURL?: string): AxiosInstance => {
  const instance = axios.create({
    baseURL: baseURL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for cookies
  });

  // Request interceptor - Add access token to headers
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const authHeader = getAuthHeader();

      if (authHeader && config.headers) {
        config.headers.Authorization = authHeader;
      }

      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle token refresh on 401 (access token expired)
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Handle 401 Unauthorized - Access token expired
      if (error.response?.status === 401 && !originalRequest._retry) {
        // Skip refresh if this is the refresh token endpoint itself
        if (originalRequest.url?.includes(REFRESH_TOKEN_ENDPOINT)) {
          // Refresh token expired, redirect to login
          redirectToLogin();
          return Promise.reject(error);
        }

        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers && token) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return instance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newAccessToken = await refreshAccessToken();

          if (newAccessToken) {
            processQueue(null, newAccessToken);

            // Retry original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }

            return instance(originalRequest);
          } else {
            processQueue(error, null);
            return Promise.reject(error);
          }
        } catch (refreshError) {
          processQueue(refreshError as AxiosError, null);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Main axios instance
export const axiosBI = createAxiosInstance();

// Custom response type
export type CustomAxiosResponse<T = unknown> = AxiosResponse<T>;

// Export axios instance creator for different base URLs
export { createAxiosInstance };
