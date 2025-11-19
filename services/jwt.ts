// JWT token management service

import { decodeJwt } from 'jose';

import { getCookie, setCookie, removeCookie } from '@/utils/helpers/cookie';

//==================== REGION CONSTANTS ====================
const ACCESS_TOKEN_COOKIE_NAME = 'access_token';
const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';
const TOKEN_EXPIRY_DAYS = 7; // Access token expiry in days
const REFRESH_TOKEN_EXPIRY_DAYS = 30; // Refresh token expiry in days
//====================================================

/**
 * Get access token from cookie
 */
export const getAccessToken = (): string | null => {
  return getCookie(ACCESS_TOKEN_COOKIE_NAME);
};

/**
 * Get refresh token from cookie
 */
export const getRefreshToken = (): string | null => {
  return getCookie(REFRESH_TOKEN_COOKIE_NAME);
};

/**
 * Set access token to cookie
 */
export const setAccessToken = (token: string): void => {
  setCookie(ACCESS_TOKEN_COOKIE_NAME, token, {
    expires: TOKEN_EXPIRY_DAYS,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
};

/**
 * Set refresh token to cookie
 */
export const setRefreshToken = (token: string): void => {
  setCookie(REFRESH_TOKEN_COOKIE_NAME, token, {
    expires: REFRESH_TOKEN_EXPIRY_DAYS,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
};

/**
 * Set both tokens to cookies
 */
export const setTokens = (accessToken: string, refreshToken: string): void => {
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
};

/**
 * Remove access token from cookie
 */
export const removeAccessToken = (): void => {
  removeCookie(ACCESS_TOKEN_COOKIE_NAME);
};

/**
 * Remove refresh token from cookie
 */
export const removeRefreshToken = (): void => {
  removeCookie(REFRESH_TOKEN_COOKIE_NAME);
};

/**
 * Remove both tokens from cookies
 */
export const removeTokens = (): void => {
  removeAccessToken();
  removeRefreshToken();
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
