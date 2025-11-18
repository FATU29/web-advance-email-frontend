// API related types

import { AxiosError } from 'axios';

export type TApiError = AxiosError<{
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}>;

export type TRequestConfig = {
  params?: Record<string, any>;
  headers?: Record<string, string>;
};
