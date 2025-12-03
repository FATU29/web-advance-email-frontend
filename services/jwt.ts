// JWT token management service
// Updated for HttpOnly cookie-based refresh token flow

import { decodeJwt } from 'jose';

//==================== REGION IN-MEMORY TOKEN STORAGE ====================
/**
 * In-memory storage for access token (more secure than localStorage)
 * Refresh token is stored in HttpOnly cookie by backend (not accessible to JS)
 */
let accessToken: string | null = null;

//====================================================

/**
 * Get access token from memory
 */
export const getAccessToken = (): string | null => {
  return accessToken;
};

/**
 * Set access token in memory
 * @param token - JWT access token
 */
export const setAccessToken = (token: string): void => {
  accessToken = token;
};

/**
 * Remove access token from memory
 */
export const removeAccessToken = (): void => {
  accessToken = null;
};

/**
 * Remove tokens (clear access token from memory)
 * Note: Refresh token (HttpOnly cookie) is cleared by backend during logout
 */
export const removeTokens = (): void => {
  removeAccessToken();
};

/**
 * Set tokens - for backward compatibility
 * Now only stores access token in memory (refresh token is in HttpOnly cookie)
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
 * Check if user is authenticated (has access token)
 */
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
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
