// JWT token management service
// Updated for HttpOnly cookie-based refresh token flow

import { decodeJwt } from 'jose';

//==================== REGION TOKEN STORAGE ====================
/**
 * Access token storage using localStorage
 * - Persists across page refreshes for better UX
 * - Refresh token is stored in HttpOnly cookie by backend (not accessible to JS)
 *
 * Security note: While localStorage is vulnerable to XSS, it provides better UX
 * by maintaining session across page reloads. Combined with HttpOnly refresh token,
 * this provides a good balance between security and usability.
 */
const ACCESS_TOKEN_KEY = 'accessToken';

//====================================================

/**
 * Get access token from localStorage
 */
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Set access token in localStorage
 * @param token - JWT access token
 */
export const setAccessToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

/**
 * Remove access token from localStorage
 */
export const removeAccessToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

/**
 * Remove tokens (clear access token from localStorage)
 * Note: Refresh token (HttpOnly cookie) is cleared by backend during logout
 */
export const removeTokens = (): void => {
  removeAccessToken();
};

/**
 * Set tokens - for backward compatibility
 * Now only stores access token in localStorage (refresh token is in HttpOnly cookie)
 * @param accessToken - JWT access token
 * @param _refreshToken - Ignored (refresh token handled by backend via HttpOnly cookie)
 */
export const setTokens = (
  accessToken: string,
  _refreshToken?: string | null
): void => {
  setAccessToken(accessToken);
  // Refresh token is NOT stored on frontend - it's in HttpOnly cookie
};

/**
 * Get refresh token - DEPRECATED
 * Refresh token is now stored in HttpOnly cookie (not accessible to JavaScript)
 * This function is kept for backward compatibility but always returns null
 * @deprecated Refresh token is stored in HttpOnly cookie
 */
export const getRefreshToken = (): string | null => {
  console.warn(
    'getRefreshToken() is deprecated. Refresh token is stored in HttpOnly cookie.'
  );
  return null;
};

/**
 * Set refresh token - DEPRECATED
 * Refresh token is now stored in HttpOnly cookie by backend
 * @deprecated Refresh token is managed by backend via HttpOnly cookie
 */
export const setRefreshToken = (_token: string): void => {
  console.warn(
    'setRefreshToken() is deprecated. Refresh token is managed by backend via HttpOnly cookie.'
  );
};

/**
 * Remove refresh token - DEPRECATED
 * @deprecated Refresh token is managed by backend via HttpOnly cookie
 */
export const removeRefreshToken = (): void => {
  console.warn(
    'removeRefreshToken() is deprecated. Refresh token is managed by backend via HttpOnly cookie.'
  );
};

/**
 * Check if a JWT token is expired
 * @param token - JWT token string
 * @returns true if token is expired, false otherwise
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeJwt(token);
    if (!decoded.exp) {
      return true; // No expiration = treat as expired
    }
    // JWT exp is in seconds, Date.now() is in milliseconds
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Failed to check token expiration:', error);
    return true; // If can't decode, treat as expired
  }
};

/**
 * Check if access token is valid and not expired
 * @returns true if token exists and is not expired
 */
export const isAccessTokenValid = (): boolean => {
  const token = getAccessToken();
  if (!token) {
    return false;
  }
  return !isTokenExpired(token);
};

/**
 * Check if user is authenticated (has valid access token)
 */
export const isAuthenticated = (): boolean => {
  return isAccessTokenValid();
};

/**
 * Get authorization header value
 */
export const getAuthHeader = (): string | null => {
  const token = getAccessToken();
  return token ? `Bearer ${token}` : null;
};

/**
 * Decode JWT token and return payload
 * @param token - JWT token string
 * @returns Decoded token payload or null if invalid
 */
export const decodeToken = <T = Record<string, unknown>>(
  token: string
): T | null => {
  try {
    const decoded = decodeJwt(token);
    return decoded as T;
  } catch (error) {
    console.error('Failed to decode JWT token:', error);
    return null;
  }
};

/**
 * Decode current access token and return payload
 * @returns Decoded access token payload or null if not found/invalid
 */
export const decodeAccessToken = <T = Record<string, unknown>>(): T | null => {
  const token = getAccessToken();
  if (!token) {
    return null;
  }
  return decodeToken<T>(token);
};
