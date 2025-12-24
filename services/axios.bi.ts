import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosError,
} from 'axios';
import { AUTH_ENDPOINTS } from '@/utils/constants/api';
import { ROUTES } from '@/utils/constants/routes';
import { removeTokens, getAuthHeader, setAccessToken } from './jwt';
import { API_BASE_URL } from '@/utils/constants/general';

//==================== REGION TYPES ====================
interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: null; // Refresh token is in HttpOnly cookie, not in response
    tokenType: string;
    expiresIn: number;
    user: {
      id: string;
      email: string;
      name: string;
      profilePicture: string | null;
    };
  } | null;
}

interface PendingRequest {
  resolve: (value?: string | null) => void;
  reject: (error?: AxiosError) => void;
}
//====================================================

//==================== REGION CONSTANTS ====================
const REFRESH_TOKEN_ENDPOINT = AUTH_ENDPOINTS.REFRESH;
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
    window.location.href = ROUTES.LOGIN;
  }
};

// Refresh access token using HttpOnly cookie
const refreshAccessToken = async (): Promise<string | null> => {
  console.warn(
    '🔄 Attempting to refresh access token using HttpOnly cookie...'
  );

  // Create a new axios instance without interceptors to avoid infinite loop
  const refreshAxios = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // CRITICAL: Send HttpOnly cookie automatically
  });

  try {
    // No body needed! Browser sends refresh token cookie automatically
    const response = await refreshAxios.post<RefreshTokenResponse>(
      REFRESH_TOKEN_ENDPOINT
    );

    if (response.data.success && response.data.data) {
      const { accessToken } = response.data.data;

      console.warn('✅ Token refresh successful! New access token received.');

      // Store only access token in memory
      // Refresh token is automatically updated in HttpOnly cookie by backend
      setAccessToken(accessToken);

      return accessToken;
    }

    console.warn('❌ Token refresh failed: Invalid response from server');
    return null;
  } catch (error) {
    // Refresh token expired (401) or other error -> redirect to login
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
      console.warn(
        '❌ Refresh token expired or invalid. Redirecting to login...'
      );
      // Refresh token expired or invalid
      redirectToLogin();
    } else {
      console.warn('❌ Token refresh error:', axiosError.message);
    }
    return null;
  }
};

// Create axios instance
const createAxiosInstance = (baseURL?: string): AxiosInstance => {
  const instance = axios.create({
    baseURL: baseURL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
    timeout: 180000, // 3 minutes - increased for semantic search with embedding generation
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

      // Handle 401 Unauthorized or 403 Forbidden - Access token expired or invalid
      if (
        (error.response?.status === 401 || error.response?.status === 403) &&
        !originalRequest._retry
      ) {
        console.warn(
          `⚠️ Received ${error.response?.status} ${error.response?.status === 401 ? 'Unauthorized' : 'Forbidden'}. Access token may be expired.`
        );

        // Skip refresh if this is the refresh token endpoint itself
        if (originalRequest.url?.includes(REFRESH_TOKEN_ENDPOINT)) {
          console.warn(
            '❌ Refresh token endpoint returned error. Redirecting to login...'
          );
          // Refresh token expired, redirect to login
          redirectToLogin();
          return Promise.reject(error);
        }

        if (isRefreshing) {
          console.warn(
            '⏳ Token refresh already in progress. Queuing request...'
          );
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

        console.warn('🔄 Starting token refresh process...');
        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newAccessToken = await refreshAccessToken();

          if (newAccessToken) {
            console.warn(
              '✅ Token refreshed successfully. Retrying original request...'
            );
            processQueue(null, newAccessToken);

            // Retry original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }

            return instance(originalRequest);
          } else {
            console.warn(
              '❌ Failed to refresh token. Rejecting queued requests.'
            );
            processQueue(error, null);
            return Promise.reject(error);
          }
        } catch (refreshError) {
          console.warn('❌ Token refresh threw error:', refreshError);
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
