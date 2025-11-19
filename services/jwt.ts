// JWT token management service

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
