// JWT token management service
import { decodeJwt } from 'jose';

const ACCESS_TOKEN_KEY = 'accessToken';

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const setAccessToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const removeAccessToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const removeTokens = (): void => {
  removeAccessToken();
};

export const setTokens = (accessToken: string): void => {
  setAccessToken(accessToken);
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeJwt(token);
    if (!decoded.exp) return true;
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};

export const isAccessTokenValid = (): boolean => {
  const token = getAccessToken();
  return token ? !isTokenExpired(token) : false;
};

export const isAuthenticated = (): boolean => isAccessTokenValid();

export const getAuthHeader = (): string | null => {
  const token = getAccessToken();
  return token ? `Bearer ${token}` : null;
};

export const decodeToken = <T = Record<string, unknown>>(
  token: string
): T | null => {
  try {
    return decodeJwt(token) as T;
  } catch {
    return null;
  }
};

export const decodeAccessToken = <T = Record<string, unknown>>(): T | null => {
  const token = getAccessToken();
  return token ? decodeToken<T>(token) : null;
};
