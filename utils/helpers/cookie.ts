// Cookie utility functions for Next.js (client and server side)

/**
 * Get cookie value by name (client-side)
 */
export const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }

  return null;
};

/**
 * Set cookie (client-side)
 */
export const setCookie = (
  name: string,
  value: string,
  options?: {
    expires?: number; // days
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  }
): void => {
  if (typeof window === 'undefined') {
    return;
  }

  let cookieString = `${name}=${value}`;

  if (options?.expires) {
    const date = new Date();
    date.setTime(date.getTime() + options.expires * 24 * 60 * 60 * 1000);
    cookieString += `; expires=${date.toUTCString()}`;
  }

  if (options?.path) {
    cookieString += `; path=${options.path}`;
  } else {
    cookieString += '; path=/';
  }

  if (options?.domain) {
    cookieString += `; domain=${options.domain}`;
  }

  if (options?.secure) {
    cookieString += '; secure';
  }

  if (options?.sameSite) {
    cookieString += `; samesite=${options.sameSite}`;
  }

  document.cookie = cookieString;
};

/**
 * Remove cookie (client-side)
 */
export const removeCookie = (name: string, path = '/'): void => {
  if (typeof window === 'undefined') {
    return;
  }

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
};

/**
 * Get all cookies as object (client-side)
 */
export const getAllCookies = (): Record<string, string> => {
  if (typeof window === 'undefined') {
    return {};
  }

  const cookies: Record<string, string> = {};
  document.cookie.split(';').forEach((cookie) => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });

  return cookies;
};
